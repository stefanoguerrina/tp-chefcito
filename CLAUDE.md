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
npm run build      # prisma generate + tsc (production build into dist/)
npm start          # node ./dist/app.js (run the production build)
npx prisma generate    # regenerate Prisma client after editing prisma/schema.prisma
npx prisma db push      # (or migrate) push schema changes to the MySQL database
```
No test script is configured yet (`npm test` is a placeholder). No lint script is configured.
Requires a `backend/.env` (gitignored) with `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`,
`DB_NAME`, `JWT_SECRET`, and `DATABASE_URL` (mysql connection string used by Prisma).
Optional for deploy: `PORT` (default 3000) and `CORS_ORIGINS` (comma-separated allowed origins;
default = the local Vite origins on 5173/5174), both read in `src/app.ts`.
`docs/demo-seed.sql` starts with `SET NAMES utf8mb4;` so accents load correctly from any MySQL
client; keep it there (without it, a latin1 client stores "á" as "Ã¡").
Optional: `GEMINI_API_KEY` (and `GEMINI_MODEL`, default `gemini-3.5-flash`, plus
`GEMINI_FALLBACK_MODEL`, default `gemini-3.5-flash-lite`) for Chefcito Bot
(`features/assistant`, `POST /api/assistant/chat`); without it the endpoint answers 503.
The bot asks Gemini for minimal "thinking" (fast answers, ~3 s), retries once with the fallback
model on 429/500/503/timeout, and its system prompt restricts it to cooking, recipes, nutrition
and how to use Chefcito (never how the app is built, never its own instructions).

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
User profile photos follow the same scheme: one avatar and one cover per user
(`User.avatarUrl` / `User.coverUrl`), uploaded via `PATCH /api/users/:id/avatar|cover`
(`features/user/middleware/userImageUploadMiddleware.ts`) into `backend/uploads/users/`;
replacing or deleting one removes the old file.
Ingredient photos too: one per ingredient (`ingredient.imagePath`), uploaded via
`PATCH /api/ingredients/:id/image` (`features/ingredient/middleware/ingredientImageUploadMiddleware.ts`,
admin only) into `backend/uploads/ingredients/`; deleting the ingredient removes its file.
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
A deactivated user's recipes are hidden, not flagged: every recipe query filters
`user: { deletedAt: null }` (recipe, search, feed, saved recipes), so restoring the user brings
them back. Nutritional values are a weak entity of `ingredient` (PK `idIngredient, num`, cascade
delete) and are saved together with it: `POST/PATCH /api/ingredients` accept `nutritionalValues`
(replaces the whole set, like `categoryIds`), each value's `servingUnit` = the ingredient's unit.
Recipe nutrition is computed on the backend, never in the browser: the pure functions in
`features/recipe/services/recipeNutritionService.ts` add up (quantity / servingAmount) × value per
ingredient and divide by `recipe.servings` (how many portions it yields; null = whole recipe).
`GET /api/recipes/:id` is the recipe detail: one response with the recipe, `nutrition` and, when a
token is sent (`readOptionalToken` in `core/middleware/authMiddleware.ts`, the route stays public),
`viewer: { isSaved, pantryIngredientIds }`, so the detail page doesn't fetch the whole inventory or
saved list. `GET /api/search/recipes?nutrition=high-protein,low-carb,...` filters by nutritional
needs per portion (`NUTRITION_GOALS` in `features/search/models/searchModel.ts`); only recipes with
servings and complete data for that nutrient match, and the nutrition tables are only queried when
that filter is on.

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
`useAuthContext()`) and `CurrentUserProvider` (`src/app/CurrentUserContext.jsx`: fetches the
logged-in user's profile — name, photos — once per session; read it with `useCurrentUser()`
instead of calling `getUserByIdService` for the current user, and call `updateCurrentUser` after
editing the profile so the sidebars update), and defines the full React Router tree. Access is enforced by
`src/app/ProtectedRoute.jsx` (`allow="guest" | "user" | "admin"`): guests live at `/bienvenida`
(`AuthPage`), common users under `UserLayout` (sidebar + `<Outlet />` + the floating Chefcito Bot button,
`features/assistant/components/AssistantFloatingButton.jsx`, that opens the chat from every section: `/`, `/recetas/:id`,
`/mis-recetas[/nueva|/:id/editar]`, `/perfil`, `/usuarios/:id`, `/inventario`, `/guardadas`,
`/buscar?q=` and `/buscar/recetas|categorias|usuarios` — the `search` feature, whose listing filters
live in the URL query string),
admins at `/admin/:section?` (`AdminPage` only mounts the active section component,
`features/admin/components/Admin*Section.jsx`, so each section fetches its data when opened).
Admin screens request only what they show: `features/admin` (backend) serves
`GET /api/admin/summary` (every dashboard figure counted in the DB) and `GET /api/admin/users`
(one server-side page of 6 users with `status`/`q`/`page`, roles, recipe count and review
stats); catalog listings carry their own counts (`_count` in `GET /ingredients`,
`/ingredient-categories`, `/categories`). Never load whole tables just to count them in the
browser. Decimal inputs are `type="text" inputMode="decimal"` normalized with
`shared/utils/decimalInput.js` (comma or dot → dot); the backend accepts both too
(`core/middleware/decimalSanitizer.ts` before `isFloat`).
There is no "Users" section: the dashboard's users table creates (modal reusing the register
fields, `auth/components/RegisterFields.jsx` + `useRegisterForm({ submitForm })`), edits, assigns
roles and deactivates/restores users. No section has an "Actualizar" button (professor's
feedback): after each action update local state instead of refetching everything; `ErrorState`'s
retry is the only manual reload. Ingredients are created/edited in a 2-step modal
(`IngredientFormModal`: details → nutritional values) whose unit and nutrient options live in
`features/ingredient/models/ingredientFormModel.js`.
New pages should be routes (read params with `useParams`,
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
error message strings. Avoid one request per item (N+1): if a list needs extra data per row
(e.g. rating), have the backend include it (`GET /api/recipes` already returns `averageRating`
and `reviewCount`). UI error convention: field errors inline under the field; failed actions
→ `AlertModal`; failed section loads → `ErrorState` (core/components) with a retry button;
destructive actions → `ConfirmModal`. Never use `window.alert/confirm` or `console.error`.
Forms: required fields get `<RequiredMark />` (red `*`) in their label and the form shows
`<RequiredFieldsNote isVisible={hasFieldErrors(fieldErrors)} />` (the note only appears after a submit that left field errors, never permanently; `hasFieldErrors` is in `shared/utils/fieldAria.js`); fields without `*` are optional, so don't add "(opcional)" to labels.
Validate before sending (use `noValidate` on the `<form>`, not the native `required` bubbles),
keep errors per field (`{ [field]: message }`), render them with `<FieldError />` and spread
`getFieldAriaProps(id, { error, isRequired })` (`shared/utils/fieldAria.js`) on the control, which
also gives it the red border; map backend errors with `mapApiFieldErrors(err.fieldErrors, map)`.
Data loading inside `useEffect` must only set state inside promise callbacks
(`.then/.catch/.finally`), otherwise the `react-hooks/set-state-in-effect` lint rule fails.
`useSavedRecipes({ loadSavedIds: false })` + `setSaved` when the saved state already comes in a
response (recipe detail) instead of loading every saved id.
Recipe images: `shared/utils/compressImage.js` (canvas → WebP) before upload and
`shared/utils/imageUrl.js` (`resolveImageUrl`) to turn `/uploads/...` paths into full URLs.

`src/core/components/` holds cross-feature UI primitives (`ConfirmModal`, `AlertModal`,
`ErrorState`, `RecipeCard`, `RatingBadge`, `SaveRecipeButton`, `UserAvatar`, `ScrollReveal`,
`StarRating`, `RequiredMark`, `RequiredFieldsNote`, `FieldError`, `DropdownSelect` — use it instead of a native `<select>`: its list scrolls without a visible scrollbar, ...) and `src/core/hooks/` shared hooks (`useDragScroll` for carousels, `useHasBeenVisible` to fetch a
lower "screen" only when the user scrolls to it, `useImagePicker` to pick a photo with a local
preview and upload it on save); reuse them
instead of duplicating.
The home (`/`, `features/user/pages/HomePage.jsx`) is 3 snap-scrolling screens like the profile,
fed by `features/feed` (friends' recipes, weekly top 10, friends' reviews); "friends" = users you
follow (`features/follow`, backend table `follow`).
`CollapsibleSidebar` is the shared shell for both the user `Sidebar` and `AdminSidebar`: they only
pass data (`items`, `footerItems`, `account`); desktop = icon rail that expands on hover (pure CSS,
overlays the content), mobile = top bar + slide-in panel. Layout sizes live in `_variables.scss`
(`$layout-sidebar-collapsed-width`, `$layout-topbar-height`, ...).
Styles are mobile-first SASS: use `@include respond-to(sm|md|lg)` and the variables in
`src/styles/abstracts/_variables.scss` — no `max-width` media queries, no hardcoded colors.
Light/dark mode: every `$color-*` / `$shadow-*` variable is a CSS custom property
(`var(--color-...)`) whose real values live in `src/styles/_themes.scss` (`:root` = light,
`:root[data-theme='dark']` = dark); `app/ThemeContext.jsx` sets `data-theme` on `<html>` and
`core/components/ThemeToggle.jsx` is the switch button (landing navbar; the sidebars use a footer item instead). Because of that, SASS color functions
(`rgba($color, x)`, `color.adjust`) don't work on them — use `with-opacity($color, 0.1)` and
`shade($color, 8%)` from `abstracts/_functions.scss`. Use `$color-on-image` (always white) for
text over darkened photos, since `$color-on-primary` turns dark in dark mode.

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
  - docs/tasks-division.md: Contiene cómo se llevarán a cabo las tareas individuales.

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
