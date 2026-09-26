# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Chefcito ("tp-chefcito") is a university full-stack project (DSW course): a recipe web app where
users plan meals from available ingredients and nutritional needs, create/save/review recipes, and
donate to recipe creators. See [docs/proposal.md](docs/proposal.md) for functional scope,
[backend/prisma/schema.prisma](backend/prisma/schema.prisma) for the reference schema, and
[docs/guia-profesor.md](docs/guia-profesor.md) + [docs/demo-seed.sql](docs/demo-seed.sql) for how
to set up a local DB with demo data (incl. a ready-to-use admin account) to try the app.

The repo is a two-package monorepo, agnostic frontend/backend communicating over a REST API:
- `backend/` — Express 5 + TypeScript + Prisma (MySQL)
- `frontend/` — React 19 + Vite (JSX, not TSX)

## Commands

Run each from its respective directory (`backend/` or `frontend/`) — there is no root-level script runner.

### Backend (`backend/`)
```
npm run dev        # tsc-watch: compiles src/ to dist/ and runs node dist/app.js on every change
npx prisma generate    # regenerate Prisma client after editing prisma/schema.prisma
npx prisma db push      # (or migrate) push schema changes to the MySQL database
```
No test script is configured yet (`npm test` is a placeholder). No lint script is configured.
Requires a `backend/.env` (gitignored) with `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`,
`DB_NAME`, `JWT_SECRET`, and `DATABASE_URL` (mysql connection string used by Prisma).

### Frontend (`frontend/`)
```
npm run dev       # start Vite dev server
npm run build     # production build
npm run lint      # eslint .
npm run preview   # preview production build
```
Requires a `frontend/.env` (gitignored, not present by default) with `VITE_API_BASE_URL` pointing
at the backend API (e.g. `http://localhost:3000/api`) — `src/shared/config/config.js` and every
service file read this directly via `import.meta.env.VITE_API_BASE_URL`.

There is no automated test suite in either package currently.

## Architecture

### Backend: layered, feature-sliced Express app

`src/app.ts` builds the Express app, applies `cors`/`express.json`, and mounts everything under
`/api` via `src/routes/apiRouter.ts`, which in turn mounts one router per feature
(`src/features/<feature>/routes/*Router.ts`, e.g. `/api/auth`, `/api/users`, `/api/database`).

Recipe images are uploaded as files with `multer` (`features/image/middleware/imageUploadMiddleware.ts`)
into `backend/uploads/recipes/` (gitignored, served statically at `/uploads`); the DB column
`image.imageUrl` stores only the public path or an external http(s) link — never base64.
`core/fileStorage.ts` resolves upload paths and deletes orphaned files.

Each feature under `src/features/<name>/` follows the same internal layering — new features should
mirror this shape:
- `routes/` — wires endpoints to `middleware/` (validation, auth) then `controllers/`
- `controllers/` — HTTP layer: reads `req`, calls the service, maps results to status codes/JSON.
  Never talks to Prisma directly.
- `services/` — business logic (hashing, JWT signing, duplicate checks, authorization decisions).
  Returns discriminated-union results (e.g. `{ ok: true, ... } | { ok: false, reason: '...' }`)
  rather than throwing for expected failure cases; controllers switch on `reason` to pick the HTTP
  response.
- `repository/` — the only layer allowed to import `core/prismaClient.ts` / call Prisma for that
  feature. No business logic here, just queries.
- `models/` — plain types/interfaces describing the feature's data shapes (no logic), e.g.
  `toPublic()` in `features/user/models/userModel.ts` strips `password` before a user is returned
  over the API.
- `middleware/` — feature-specific `express-validator` chains + a shared
  `handleValidationErrors` that turns validation failures into a `422` with a normalized
  `{ errores: [{ campo, mensaje }] }` body.

Cross-cutting auth lives in `src/core/middleware/authMiddleware.ts` (not per-feature):
`verifyToken` (decodes the JWT into `req.user`), `verifyAdmin` (role check), and
`verifyOwnerOrAdmin` (lets a user act on their own `:id` or lets an admin act on anyone's).
Compose these on routes in that order, e.g.
`router.patch('/:id', verifyToken, verifyOwnerOrAdmin, validateX, handleValidationErrors, controllerFn)`.

Two DB access paths currently coexist: `core/prismaClient.ts` (singleton `PrismaClient`, used by
feature repositories — the primary path for CRUD) and `src/database.ts` (a raw `mysql2/promise`
pool, used for a lower-level health check in the `database` feature). Prefer Prisma for new
feature work.

`prisma/schema.prisma` is the source of truth for the data model: `User`, `role`/`UserRole`,
`recipe`, `ingredient`/`ingredientcategory`, `category`/`recipecategory`, `recipeingredient`,
`inventory`, `nutritionalvalue`, `step`, `image`, `userrecipe`/`review`, `donation`. Soft-delete is
used for users (`deletedAt` — repositories filter on `deletedAt: null` rather than hard-deleting).

Auth model: JWT (`jsonwebtoken`) with an 8h expiry, payload `{ id, username, isAdmin }`, secret from
`JWT_SECRET`. `isAdmin` is derived at login time from whether the user's roles include
`ADMIN_ROLE_ID` (role id `1`, defined in `features/user/models/userModel.ts`). Passwords are hashed
with `bcrypt` (10 salt rounds) — plaintext passwords must never cross the repository boundary.

TypeScript compiles CommonJS-style `__dirname` usage (`app.ts`, `database.ts` load `.env` via
`path.resolve(__dirname, '../.env')`) — the `tsconfig.json` module target is `NodeNext`, so keep
new modules consistent with the existing import/export style (ESM `import`/`export`, `.js`
extensions on relative imports since output is compiled to `dist/`).

### Frontend: feature-sliced React app

`src/main.jsx` renders `src/app/App.jsx`, which wraps everything in `AuthProvider`
(`src/app/AuthContext.jsx`: session state via Context API + `useReducer`, read with
`useAuthContext()`) and defines the full React Router tree. Access is enforced by
`src/app/ProtectedRoute.jsx` (`allow="guest" | "user" | "admin"`): guests live at `/bienvenida`
(`AuthPage`), common users under `UserLayout` (sidebar + `<Outlet />`: `/`, `/recetas/:id`,
`/mis-recetas[/nueva|/:id/editar]`, `/perfil`, `/usuarios/:id`, `/inventario`, `/guardadas`),
admins at `/admin/:section?`. New pages should be routes (read params with `useParams`,
navigate with `useNavigate`), not panels toggled by local state.

Each feature under `src/features/<name>/` mirrors a slice of the backend's shape:
- `pages/` — route-level components
- `components/` — presentational/form components
- `hooks/` — feature state + orchestration (e.g. `useAuth.js` manages login/register form
  visibility and, on login success, persists the JWT to `localStorage` and calls the
  `onLoginSuccess` callback passed down from `App.jsx`)
- `services/` — one function per API call, built on `fetch` directly against
  `import.meta.env.VITE_API_BASE_URL` (see `loginService.js`, `registerService.js`); these parse
  the backend's `{ message }` / `{ errores: [...] }` error shapes into a thrown `Error`.
- `models/` — plain JS shapes for request/response data (no framework logic).
- `styles/` — feature-scoped CSS.

`src/shared/utils/apiFetch.js` is the single HTTP helper for every service (public or
authenticated): it adds the JWT if present, sends JSON (or `FormData` for file uploads), and
throws an `ApiError` (`shared/utils/ApiError.js`, with `status`, `isNotFound`, `isConflict`,
`fieldErrors`) whose message is already user-friendly (validation field messages, offline,
etc.). A 401 with a token fires `SESSION_EXPIRED_EVENT`, which `AuthContext` handles by logging
out. Use `fetchListOrEmpty()` for list endpoints that answer 404 when empty — never compare
error message strings. UI error convention: field errors inline under the field; failed actions
→ `AlertModal`; failed section loads → `ErrorState` (core/components) with a retry button;
destructive actions → `ConfirmModal`. Never use `window.alert/confirm` or `console.error`.
Data loading inside `useEffect` must only set state inside promise callbacks
(`.then/.catch/.finally`), otherwise the `react-hooks/set-state-in-effect` lint rule fails.
Recipe images: `shared/utils/compressImage.js` (canvas → WebP) before upload and
`shared/utils/imageUrl.js` (`resolveImageUrl`) to turn `/uploads/...` paths into full URLs.

`src/core/components/` holds cross-feature UI primitives (`ConfirmModal`, `AlertModal`,
`ErrorState`, `RecipeCard`, `MasonryGrid`, `StarRating`, ...); reuse them instead of duplicating.
Styles are mobile-first SASS: use `@include respond-to(sm|md|lg)` and the variables in
`src/styles/abstracts/_variables.scss` — no `max-width` media queries, no hardcoded colors.

## Documentation conventions (course requirement)

Per [docs/docs.md](docs/docs.md), all project documentation must live under `docs/`, be in
Markdown (diagrams via Mermaid or git-compatible image formats), with `docs/README.md` as the
entry point. `docs/proposal.md` is the graded scope proposal — keep it in sync with what's
actually implemented, since it's what's submitted for evaluation.

## Desarrollo Frontend - Proyecto Chefcito

### 1. Contexto e Identidad
Eres un asistente de IA configurado en el IDE Antigravity para ayudar con el proyecto "Chefcito" de la materia Desarrollo de Software.
- **Repositorio:** https://github.com/stefanoguerrina/tp-chefcito
- **Estructura:** Monorepo, dividido en carpetas de backend y frontend.
- **Equipo:** 4 integrantes. Stéfano Guerrina es el Líder de Equipo (único responsable de revisar y mergear PRs a main).
- **Documentos de Referencia:**
  - docs/README.md: Contiene la propuesta de la cátedra, rúbricas y pautas del proyecto. Debes seguirlas estrictamente.
  - task-division.md: Contiene cómo se llevarán a cabo las tareas individuales.

### 2. Restricciones Fundamentales y "Qué NO hacer"
- **Cero Interferencia:** NUNCA modifiques ni reescribas código de la feature o rama de otro integrante sin que el usuario lo pida explícitamente.
- **Sin Dependencias No Autorizadas:** NO agregues nuevas dependencias, librerías, frameworks de UI/estado/estilos fuera del stack definido sin avisar antes al usuario.
- **Sin Alterar Carpetas:** No modifiques ni alteres la estructura de carpetas existente sin preguntar (solo si es sumamente necesario).
- **Sin Lógica de Backend (Salvo Pedido):** No agregues backend, endpoints ni lógica de servidor, a menos que se te pida.
- **Mantenlo Simple (CRÍTICO):** NO inventes arquitecturas o patrones avanzados que un estudiante de una materia de DSW no manejaría (Server Components, Suspense para data fetching, arquitecturas exageradas). Prioriza código claro y directo por sobre "elegante pero complejo". El estudiante debe poder explicar el código en la defensa oral.

### 3. Stack Tecnológico (Obligatorio)
- **Frontend:** React + Vite, en TypeScript y JavaScript.
- **Enrutamiento:** React Router.
- **Estado:** Context API + useReducer para estado compartido; useState para estado local.
- **Estilos:** CSS puro o SASS. Nada de Tailwind ni librerías de componentes (MUI, Bootstrap, etc.) salvo pedido explícito.

### 4. Idioma y Convenciones de Nombres
- **Inglés/Español:** Código en Inglés, al igual que los nombres de componentes, etc. Comentarios, commits, mensajes de error, el resto en Español.
- **Variables/Funciones:** camelCase con nombres bien descriptivos.
- **Componentes:** PascalCase (ej. RecipeCard.tsx).
- **Hooks:** camelCase con el prefijo use (ej. useAuth).
- **Parciales SASS:** kebab-case (ej. _recipe-card.scss).

### 5. Documentación y Comentarios
- **Cabecera de Archivo:** Al inicio de cada componente/archivo, una línea explicando qué hace.
- **Funciones:** Antes de cada función no trivial, un comentario breve de qué recibe y qué devuelve.
- **Lógica:** En lógicas no obvias (transformaciones de datos, condicionales complejos, efectos) explicar el "por qué", no repetir el "qué" que ya es evidente en el código.
- **Sin Ruido:** No comentar cosas obvias.

### 6. Arquitectura de Componentes
- **Paradigma:** Solo componentes funcionales con Hooks. Nada de componentes de clase.
- **Responsabilidad Única:** Un componente = una responsabilidad. Si supera ~150-200 líneas o mezcla mucha lógica, hay que dividirlo.
- **Props:** Destructuring en la firma del componente.
- **Manejadores de Eventos (Handlers):** Prefijo handle (ej. handleClick).
- **Operaciones Asíncronas:** Todo fetch/servicio debe manejar estados de loading, error y datos vacíos, mostrando mensajes amigables en la UI (nunca un error crudo de consola).
- **Reutilización:** Reutilizar componentes comunes (inputs, botones, cards) desde core/components en vez de duplicar código entre features.

### 7. Modelado de Datos y Servicios
- **Modelos:** Representar los datos que van/vienen de la API con clases o factory functions simples en JS (NO usar interfaces de TS).
- **Servicios:** Los servicios mapean la estructura cruda del backend a estos modelos. Cada feature debe tener al menos un servicio propio que centralice sus llamadas HTTP.

### 8. Reglas de Estilos (SASS/CSS)
- **Enfoque:** Mobile-first. Primero estilos para mobile, luego media queries para ampliar.
- **Breakpoints:** Variables SASS en abstracts/_breakpoints.scss: SM >= 576px, MD >= 768px, LG >= 1024px.
- **Variables:** Variables SASS para colores, espaciados y tipografía. Nada de valores hardcodeados repetidos.

### 9. Entorno y Configuración
- **Variables de Entorno:** Usar .env para la URL base de la API u otra configuración. Nunca hardcodear URLs de backend en el código.

### 10. Testing
- **Alcance:** No es obligatorio para la regularidad. Para la etapa de aprobación se necesita al menos 1 test unitario de un componente y 1 test end-to-end.

### 11. Git y Pull Requests
- **Ramas:** Ramas desde develop, nombres en inglés.
- **PRs:** PR con descripción breve. NO mergear directo a main. Stéfano revisa y hace los merges a main cuando las fases respectivas de la task-division se terminan.
