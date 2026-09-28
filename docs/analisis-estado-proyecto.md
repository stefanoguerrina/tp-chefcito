# Análisis del estado del proyecto — Chefcito

> **Fecha del análisis:** 28/09/2026 · **Rama analizada:** `develop` (commit `f3080a3`, PR #17)
> **Objetivo:** saber qué falta para la **Aprobación Directa (AD)**, qué hay que mejorar y cómo
> repartirnos el trabajo. Se compara lo que pide la cátedra ([README.md](README.md),
> [FAQ.md](FAQ.md), [docs.md](docs.md)) y lo que prometimos en la [propuesta](proposal.md) contra
> lo que hay hoy en el código.

**Cómo leer las prioridades**

| Marca | Significado |
|:-:|---|
| 🔴 | Bloquea la **regularidad** o lo prometido en la propuesta. Va primero. |
| 🟠 | Obligatorio para la **Aprobación Directa**. |
| 🟡 | Mejora de calidad: nos pueden preguntar o bajar nota en la defensa. |
| ⚪ | Opcional / prolijidad. |

---

## 1. Resumen ejecutivo

**Lo que está bien:** la base técnica es sólida. Backend en capas (router → middleware →
controller → service → repository) con Prisma + MySQL, validación con `express-validator`,
login JWT con 2 niveles (usuario/admin), rutas protegidas en back y front, frontend React con
rutas protegidas (`ProtectedRoute`), manejo de errores unificado (`apiFetch` + `ApiError`),
estilos SASS mobile-first con los 3 breakpoints. Hay 15 features en el backend y casi todos los
CRUDs funcionan de punta a punta. `npm run lint`, `npm run build` (front) y `tsc --noEmit` (back)
pasan sin errores.

**Lo que falta para AD, en una lista:**

1. 🔴 **Listados con filtro que prometimos en la propuesta** (recetas por categoría y por
   valoración): no existen como listado general. La tarjeta "Buscá por categoría, receta o
   usuario" dice *Próximamente*.
2. 🔴 **Editar una reseña desde la UI**: el backend tiene `PATCH`, pero el frontend no lo usa
   (el CRUD Valoración está incompleto en la app).
3. 🟠 **CU "Consultar recetas según ingredientes disponibles"** (T-4.2): no existe.
4. 🟠 **CU / CRUD "Donaciones"** (T-4.3): la tabla existe en el schema, pero no hay backend
   ni frontend (los botones "Donar" muestran *Próximamente*).
5. 🟠 **Tests**: no hay ninguno. Faltan 4 tests de backend (1 por integrante) + 1 de
   integración, 1 test unitario de componente y 1 test E2E.
6. 🟠 **Documentación de la API**: no existe.
7. 🟠 **Deploy** (links + credenciales): no existe; además faltan scripts `build`/`start` y el
   puerto/CORS están hardcodeados.
8. 🔴 **Documentación que pide la cátedra**: falta el `README.md` en la raíz, `docs/README.md`
   hoy es la consigna (no nuestro índice), faltan minutas, tracking de tareas/issues,
   metodología y links a los PRs en la propuesta.
9. 🟠 **Video demo** + evidencia de ejecución de tests.
10. 🟡 Varias mejoras de código (sección 6 y 7) para llegar prolijos a la defensa.

---

## 2. Calendario y plan sugerido

Fechas de la cátedra: **1ª entrega Regularidad/AD 12/10–16/10**, recuperatorio 26/10–30/10,
última instancia 9/11–13/11. Hoy es 28/09: **quedan 2 semanas** para la primera ventana.

| Semana | Objetivo | Qué entra |
|---|---|---|
| **28/09 – 04/10** | Asegurar regularidad | Listado "Explorar recetas" con filtros (categoría + valoración), editar reseña, README raíz + índice de docs, propuesta actualizada, tablero de tareas + minutas, `.env.example`. Arrancar T-4.2, T-4.3 y la configuración de tests. |
| **05/10 – 11/10** | Completar AD | Donaciones, recetas según inventario, todos los tests, documentación de la API, deploy. |
| **12/10 – 16/10** | Entrega | Video, evidencia de tests, links de deploy + credenciales, formulario de entrega, coordinar defensa. |
| 26/10 – 30/10 | Plan B | Si no llegamos con AD completa, se entrega acá (mejor llegar bien que llegar a medias). |

---

## 3. Requisitos de la cátedra: dónde estamos

### 3.1 Backend

| Requisito | Nivel | Estado | Evidencia / qué falta |
|---|:-:|:-:|---|
| JavaScript | Reg | ✅ | TypeScript (superset de JS). Conviene declararlo en la propuesta. |
| Framework web con middlewares | Reg | ✅ | Express 5 |
| API web REST | Reg | ✅ | Todo bajo `/api` ([apiRouter.ts](../backend/src/routes/apiRouter.ts)) |
| BD persistente externa | Reg | ✅ | MySQL. ⚠️ El FAQ pide que "no requiera ejecutarse en local": para el deploy hace falta un MySQL en la nube. |
| ORM | Reg | ✅ | Prisma. (Queda un pool `mysql2` suelto solo para el health check, ver 6.8.) |
| Capas | Reg | ✅ | routes / middleware / controllers / services / repository / models |
| Validar datos e informar errores | Reg | ✅ | `express-validator` + 422. Formato inconsistente entre features (ver 6.4). |
| Dependencias en `package.json` | Reg | ✅ | Sí. Faltan scripts `build`/`start`/`test` (ver 6.1). |
| 1 test automatizado por integrante | AD | ❌ | `npm test` es un placeholder. |
| 1 test de integración | AD | ❌ | — |
| Login propio + 2 niveles de acceso | AD | ✅ | JWT + bcrypt, roles Usuario/Admin |
| Rutas protegidas por nivel | AD | ✅ | `verifyToken`, `verifyAdmin`, `verifyOwnerOrAdmin` |
| Ambientes (.env) | AD | ⚠️ | Hay `.env`, pero no hay `.env.example` ni ambiente de test/producción, y `PORT`/CORS están fijos en [app.ts](../backend/src/app.ts). |

### 3.2 Frontend

| Requisito | Nivel | Estado | Evidencia / qué falta |
|---|:-:|:-:|---|
| Framework de frontend | Reg | ✅ | React 19 + Vite. La cátedra da soporte a Angular: **hay que declararlo en la propuesta** (FAQ). |
| HTML5 | Reg | ✅ | `index.html` tiene `lang="en"` → cambiar a `es`. |
| CSS con metodología / preprocesador | Reg | ✅ | SASS con variables y mixins |
| Mobile-first + 3 breakpoints | Reg | ✅ | `respond-to(sm\|md\|lg)` en [_breakpoints.scss](../frontend/src/styles/abstracts/_breakpoints.scss). Revisar a mano cada pantalla en 375 / 768 / 1280 px antes de entregar. |
| UX sin manual | Reg | ⚠️ | Botones *Próximamente* (búsqueda, IA, donar) y datos falsos en la landing restan (ver 7.1 y 7.2). |
| Eventos, errores amigables, reactividad, input/output property | Reg | ✅ | props (input), callbacks `onX` (output), `AlertModal`/`ErrorState` |
| Al menos un servicio | Reg | ✅ | Un `services/` por feature sobre `apiFetch` |
| Modelos con clases/tipos custom | Reg | ⚠️ | Hay modelos en recipe, review, inventory, auth, admin; **faltan** en user (carpeta vacía), category, ingredient, role, etc. (ver 7.6) |
| Patrón de diseño OO (si es posible) | Reg | ✅ | `ApiError extends Error`, Singleton de Prisma, Repository. Preparar cómo explicarlos. |
| 1 test unitario de componente | AD | ❌ | — |
| 1 test E2E | AD | ❌ | — |
| Login + acceso según nivel | AD | ✅ | `ProtectedRoute allow="guest\|user\|admin"` |
| Ambientes (.env) | AD | ⚠️ | `VITE_API_BASE_URL` en `.env`; falta `.env.example` y `.env.production`. |

### 3.3 Requisitos funcionales (4 integrantes)

| Requisito | Nivel | Cuántos | Estado |
|---|:-:|:-:|---|
| CRUD simple por integrante | Reg | 4 | ✅ Usuario, Categoría de receta, Categoría de ingrediente, Rol (+ otros) |
| CRUD dependiente c/2 integrantes | Reg | 2 | ⚠️ Ingrediente ✅; Valoración **sin "editar" en la UI** (ver 5.2) |
| Listado con filtro c/2 integrantes | Reg | 2 | ⚠️ Solo la galería del perfil (filtra en el navegador) y tablas de admin. **Los dos listados de la propuesta no existen** (ver 5.1). |
| Detalle al seleccionar (request al back, ≥2 clases) | Reg | — | ✅ `/recetas/:id` muestra receta + creador + ingredientes + pasos + reseñas |
| CU/Epic c/2 integrantes | Reg | 2 | ✅ Crear y publicar recetas · Reseñar recetas |
| CRUDs de **todas** las clases de negocio | AD | — | ❌ Falta Donación (ver 5.4) |
| 1 CU por integrante, ≥2 relacionados | AD | 4 | ⚠️ 2 de 4 (faltan "recetas según ingredientes" y "donaciones") |

### 3.4 Entregas y documentación ([docs.md](docs.md))

| Entregable | Reg | AD | Estado |
|---|:-:|:-:|---|
| Proposal actualizada | X | X | ⚠️ Desactualizada (ver 8.3) |
| Links a los PR | X | X | ❌ No están en la propuesta |
| Instrucciones de instalación (en el README) | X | X | ⚠️ Existe [guia-profesor.md](guia-profesor.md) pero **no hay `README.md` en la raíz** que lo enlace |
| Minutas de reunión y avance | X | X | ❌ |
| Tracking de features, bugs e issues | X | X | ❌ (hay [tasks-division.md](tasks-division.md) pero sin estado ni issues) |
| Metodología ágil usada | X | X | ❌ No está escrita en ningún lado |
| Documentación de la API | | X | ❌ |
| Evidencia de ejecución de tests | | X | ❌ |
| Video demo | | X | ❌ |
| Deploy + credenciales | | X | ❌ |
| Contacto para la defensa | | X | ❌ (va en el formulario) |
| `docs/README.md` como índice, enlazado desde el README raíz | X | X | ❌ Hoy `docs/README.md` es la consigna de la cátedra |

---

## 4. Propuesta vs. implementado

| Ítem de la propuesta | Estado | Comentario |
|---|:-:|---|
| CRUD Usuario | ✅ | Alta (registro + admin), ver, editar, baja lógica, reactivar. El cambio de contraseña existe en el back pero no en la UI (7.3). |
| CRUD Categoría-Ingrediente | ✅ | Panel admin |
| CRUD Receta | ✅ | Editor por etapas con pasos, ingredientes e imagen. **Ojo:** en la propuesta figura como CRUD *simple*, pero depende de Usuario y Categoría → es *dependiente*. |
| CRUD Categoría-Receta | ✅ | Panel admin |
| CRUD Valoración (dep.) | ⚠️ | Crear, listar y borrar sí; **editar no** en la UI |
| CRUD Ingrediente (dep.) | ✅ | Panel admin, con valores nutricionales anidados |
| Listado recetas filtrado por categoría → detalle | ❌ | Solo existe dentro de un perfil, y solo mira la 1ª categoría de cada receta (7.4) |
| Listado recetas filtrado por valoración (con nombre del creador) → detalle | ❌ | No existe |
| CU Crear y publicar recetas | ✅ | |
| CU Reseñar recetas de otros | ✅ | Impide reseñar la propia y reseñar dos veces |
| CU Consultar recetas según ingredientes disponibles | ❌ | El inventario (T-4.1) ya está; falta el cruce (T-4.2) |
| CU Sistema de donaciones | ❌ | T-4.3 |
| *Adicional:* listado por tiempo de preparación | ❌ | Sale casi gratis con el listado "Explorar" |
| *Adicional:* top 10 mejor valoradas en un plazo | ❌ | Opcional |
| *Adicional:* filtro por necesidades nutricionales | ❌ | Opcional |
| *Adicional:* ChatBot IA | ❌ | Opcional. Si no se hace, sacar los botones que lo prometen (7.1). |
| **Extra no prometido y ya hecho** | ✅ | CRUD Rol + asignación a usuarios, Inventario, Valor nutricional, Pasos, Imágenes (subida real con multer), Recetas guardadas, Dashboard admin con métricas. **Agregarlos a la propuesta**: suman como alcance adicional. |

---

## 5. Funcionalidades que faltan (detalle)

### 5.1 🔴 Página "Explorar recetas" con filtros (listados 1 y 2 de la propuesta)

Es lo más urgente porque es requisito de **regularidad** y está prometido.

**Backend** — agregar filtros por query string a `GET /api/recipes`:
- `?categoryId=3` → `where: { recipecategory: { some: { idCategory } } }`
- `?minRating=4` → requiere el promedio de reseñas (ver 6.6)
- `?maxTime=30` → `preparationTime: { lte: maxTime }` (cubre el listado adicional)
- `?q=milanesa` → búsqueda por nombre (opcional)
- Validar los query params con `express-validator` (`query('categoryId').optional().isInt()`)
  en `recipeValidationMiddleware.ts`, y armar el `where` en `recipeRepository`.
- Incluir en la respuesta `averageRating` y `reviewCount` de cada receta, y el nombre del
  creador (ya viene en `user`).

**Frontend** — nueva ruta `/explorar` dentro de `UserLayout`:
- `features/recipe/pages/ExploreRecipesPage.jsx` con un selector de categoría, un filtro de
  valoración mínima (reutilizar `StarRating`) y opcionalmente tiempo máximo.
- Guardar los filtros en la URL con `useSearchParams` (así se puede compartir/volver atrás).
- Cada tarjeta muestra nombre, descripción, valoración y creador; al tocarla navega a
  `/recetas/:id` (el detalle ya cumple).
- Conectar la tarjeta *"Buscá por categoría, receta o usuario"* de
  [HomeFeatureCards.jsx](../frontend/src/features/recipe/components/HomeFeatureCards.jsx) y el
  `TODO` de [Sidebar.jsx](../frontend/src/features/user/components/Sidebar.jsx) a esta página.
- Estados de carga, vacío ("No hay recetas con esos filtros") y error con `ErrorState`.

### 5.2 🔴 Editar reseña

`updateReview` y `updateReviewPayload` existen en
[reviewService.js](../frontend/src/features/review/services/reviewService.js) y
[reviewModel.js](../frontend/src/features/review/models/reviewModel.js) pero ningún componente
los usa. Agregar un botón "Editar" en `ReviewList` (solo para la reseña propia) que abra
`ReviewModal` precargado con `rating` y `comment`, y que en modo edición llame a `updateReview`.

### 5.3 🟠 CU "Consultar recetas según ingredientes disponibles" (T-4.2)

- **Backend:** `GET /api/users/:userId/recipe-matches` (o `GET /api/recipes/matches`, tomando
  el usuario del token). Lógica en un service: traer el inventario del usuario y las recetas con
  sus `recipeingredient`; para cada receta calcular cuántos ingredientes tiene el usuario, cuáles
  faltan y un porcentaje de coincidencia (opcional: considerar cantidad). Ordenar por coincidencia.
  Es un buen candidato para **test unitario** (lógica pura de cruce).
- **Frontend:** página `/recetas-posibles` (o una sección dentro de Inventario) con el listado,
  mostrando "Tenés 5 de 7 ingredientes · Te falta: huevo, harina". Link desde Inventario.
- Este CU **se relaciona** con Inventario y con Crear recetas → cumple "≥2 CU relacionados".

### 5.4 🟠 Donaciones (CRUD + CU, T-4.3)

El modelo `donation` ya está en [schema.prisma](../backend/prisma/schema.prisma)
(PK `idDonor + idGrantee + transactionRef`, `amount`, `currency`, `status`).
- **Backend:** feature `features/donation/` con la estructura de siempre. Endpoints sugeridos:
  - `POST /api/donations` → donante sale del token; body `{ idGrantee, amount, currency }`;
    genera `transactionRef` (ej. `crypto.randomUUID()`), `status: 'completed'` (pago simulado).
    Reglas: no donarse a uno mismo, monto > 0, receptor activo.
  - `GET /api/donations/sent` y `GET /api/donations/received` (del usuario del token).
  - `GET /api/donations` (admin, listado general) · `PATCH /api/donations/:ref` (admin, cambiar
    estado, ej. `refunded`) · `DELETE` (admin). Así queda el CRUD completo.
- **Frontend:** reemplazar los *Próximamente* de `RecipeDetailPage` y `ProfileHeader` por un
  `DonationModal` (monto, moneda, confirmación con `ConfirmModal`, "pago simulado" explícito en
  la UI). Página "Mis donaciones" (enviadas/recibidas) y, si da el tiempo, sección en el admin.
- Es la entidad ideal para contar en la defensa como "CRUD dependiente" (depende de 2 usuarios).

### 5.5 ⚪ ChatBot IA (adicional, T-5.1/T-5.2)

Solo si sobra tiempo después de todo lo anterior. Si **no** se hace: sacar la tarjeta
"Consultá a la IA", el `FloatingAssistantButton` de la landing y pasarlo a "trabajo futuro" en la
propuesta. Mostrar funciones que no existen resta en UX.

---

## 6. Mejoras en el backend

| # | Prio | Qué | Dónde | Cómo |
|:-:|:-:|---|---|---|
| 6.1 | 🟠 | Faltan scripts para producción y tests | [package.json](../backend/package.json) | `"build": "prisma generate && tsc"`, `"start": "node dist/app.js"`, `"test": "vitest run"`. Corregir `"main"` y `"description"`. |
| 6.2 | 🟠 | `PORT` y orígenes CORS hardcodeados | [app.ts](../backend/src/app.ts) | `const PORT = Number(process.env.PORT) \|\| 3000;` y `CORS_ORIGINS` separado por comas en el `.env`. Sin esto el deploy no funciona. |
| 6.3 | 🟠 | `app.ts` hace `listen` al importarse: no se puede testear con Supertest | [app.ts](../backend/src/app.ts) | Separar: `app.ts` arma y **exporta** `app`; nuevo `server.ts` hace `app.listen`. Actualizar el script `dev`. |
| 6.4 | 🟡 | `handleValidationErrors` copiado en **14 archivos**, y con dos formatos distintos: auth responde `{ errores }` y el resto `{ message, errors }` | `features/*/middleware/*ValidationMiddleware.ts` | Mover uno solo a `core/middleware/validationMiddleware.ts` con un único formato (`{ message, errors: [{ campo, mensaje }] }`). El front ya acepta los dos, así que no rompe nada. |
| 6.5 | 🟡 | 11 controllers vuelven a llamar `validationResult` aunque el middleware ya lo hizo | `features/*/controllers/*.ts` | Borrar ese bloque duplicado (código muerto; en la defensa pueden preguntar por qué está). |
| 6.6 | 🟡 | Las recetas no traen su promedio de valoración → el front hace **1 request por receta** (N+1) en el perfil y en el dashboard admin | `recipeRepository.ts`, [useProfileData.js](../frontend/src/features/user/hooks/useProfileData.js), [useAdminDashboard.js](../frontend/src/features/admin/hooks/useAdminDashboard.js) | En el service, `prisma.review.groupBy({ by: ['idRecipe'], _avg: { rating: true }, _count: true })` y agregar `averageRating`/`reviewCount` a cada receta. Lo necesita también el filtro por valoración (5.1). |
| 6.7 | 🟡 | `recipe.saveCount` **nunca se actualiza** (solo tiene el valor del seed) → la métrica "guardados" del perfil queda en 0 con datos nuevos | `userRecipeService.ts`, [ProfileMetrics.jsx](../frontend/src/features/user/components/ProfileMetrics.jsx) | Incrementar/decrementar en la misma transacción al guardar/desguardar, o calcularlo con `_count` y dejar de usar la columna. |
| 6.8 | 🟡 | Dos caminos a la BD: el health check usa un pool `mysql2` aparte ([database.ts](../backend/src/database.ts)) y devuelve `error.message` crudo al cliente | `features/database/`, `database.ts` | Usar ``prisma.$queryRaw`SELECT 1` `` y borrar `database.ts`. Así se puede quitar `mysql2` y las variables `DB_HOST/PORT/USER/PASSWORD/NAME`: el `.env` queda solo con `DATABASE_URL` y `JWT_SECRET` (más simple para el profe y para el deploy). |
| 6.9 | 🟡 | Listados vacíos responden **404** en vez de `200 []` | category, ingredient, ingredientCategory, recipe, rol, user controllers | Un listado vacío no es "no encontrado". Devolver `200 []`. `fetchListOrEmpty` del front sigue funcionando igual. Nos pueden marcar esto en la defensa por buenas prácticas REST. |
| 6.10 | 🟡 | Las recetas de usuarios dados de baja siguen apareciendo | `recipeRepository.findAll` | Agregar `where: { user: { deletedAt: null } }` en los listados públicos. |
| 6.11 | ⚪ | Una ruta `/api/xxx` inexistente o un error inesperado devuelven HTML de Express | [app.ts](../backend/src/app.ts) | Al final: un middleware 404 JSON y un error handler `(err, req, res, next)` que responda `500 { message }`. |
| 6.12 | ⚪ | El chequeo "dueño o admin" está reimplementado a mano en inventario y en recetas guardadas | `inventoryRouter.ts`, `userRecipeController.ts` | Parametrizar `verifyOwnerOrAdmin(paramName = 'id')` en `authMiddleware.ts`. Coordinar con quien hizo cada feature. |
| 6.13 | ⚪ | `GET /api/categories` pide token, a diferencia de los demás catálogos (públicos) | [categoryRouter.ts](../backend/src/features/category/routes/categoryRouter.ts) | Hacerlo público si la landing/explorar lo necesitan sin sesión. |
| 6.14 | ⚪ | Se usa `prisma db push` sin migraciones | `prisma/` | Para el deploy alcanza con `db push`. Si hay tiempo, `prisma migrate dev --name init` deja historial versionado. |

---

## 7. Mejoras en el frontend

| # | Prio | Qué | Dónde | Cómo |
|:-:|:-:|---|---|---|
| 7.1 | 🔴 | Botones *Próximamente* (búsqueda, IA, Donar) | [HomeFeatureCards.jsx](../frontend/src/features/recipe/components/HomeFeatureCards.jsx), [RecipeDetailPage.jsx](../frontend/src/features/recipe/pages/RecipeDetailPage.jsx), [ProfileHeader.jsx](../frontend/src/features/user/components/ProfileHeader.jsx), `FloatingAssistantButton` | Se resuelven con 5.1 y 5.4. Lo que no se haga, se saca de la UI antes de entregar. |
| 7.2 | 🟡 | La landing muestra **recetas inventadas** ([landingMockData.js](../frontend/src/features/landing/models/landingMockData.js)) | `ExploreSection`, `WeeklyRecipe`, `CommunitySection` | `GET /api/recipes` es público: mostrar recetas reales (ej. las mejor valoradas). Si nos preguntan "¿de dónde salen estos datos?", la respuesta tiene que ser "del backend". |
| 7.3 | 🟡 | Cambio de contraseña sin UI: [changePasswordService.js](../frontend/src/features/user/services/changePasswordService.js) no se usa en ningún lado | `EditProfileModal.jsx` | Agregar sección "Cambiar contraseña" (actual + nueva + confirmación) o borrar el servicio. |
| 7.4 | 🟡 | El filtro por categoría del perfil solo mira la **primera** categoría de cada receta (`recipecategory?.[0]`), pero una receta puede tener varias | [ProfileRecipeGallery.jsx](../frontend/src/features/user/components/ProfileRecipeGallery.jsx) | Usar `recipe.recipecategory.some((rc) => selectedCategoryIds.includes(rc.idCategory))` y armar las opciones con `flatMap`. |
| 7.5 | 🟡 | `CategoryFormModal` duplicado (category/ e ingredientCategory/) y las tablas admin de categorías casi idénticas (239 líneas cada una) | `features/category/`, `features/ingredientCategory/`, `features/admin/components/` | Un solo modal/tabla genérica en `core/components/` que reciba título y servicio por props. |
| 7.6 | 🟡 | Faltan modelos (requisito de la cátedra + CLAUDE.md §7) | `features/user/models/` (vacía), category, ingredient, role, nutritionalValue, image, step | Factory functions simples, ej. `createUserFromApi(raw)` y `toUpdateUserPayload(form)`, y que los servicios mapeen la respuesta cruda al modelo. |
| 7.7 | 🟡 | Componentes > 200 líneas (CLAUDE.md §6) | `AdminUsersTable` 353 · `AdminPage` 286 · `AdminIngredientsTable` 286 · `RecipeEditorPage` 281 · `InventoryPage` 264 · `NutritionalValuePanel` 262 · `RecipeDetailPage` 242 · `SearchUsersForm` 236 | Extraer subcomponentes (filas, paginación, formularios) y hooks. `NutritionalValuePanel` está en `pages/` pero es un panel dentro de un modal → moverlo a `components/`. |
| 7.8 | ⚪ | `index.html` con `lang="en"` y título "chefcito" | [index.html](../frontend/index.html) | `lang="es"`, `<title>Chefcito</title>` y `<meta name="description">`. |
| 7.9 | ⚪ | Archivos sin uso | `src/assets/react.svg`, `vite.svg`, `hero.png`; `.gitkeep` en carpetas que ya tienen archivos (`auth/styles`, `user/styles`, `styles/`) | Borrarlos. |
| 7.10 | ⚪ | Sin `.env.example` | `frontend/` | Crear `frontend/.env.example` con `VITE_API_BASE_URL=http://localhost:3000/api` (este sí se commitea). |
| 7.11 | ⚪ | SPA con `BrowserRouter`: al recargar `/admin` en el deploy da 404 | raíz del frontend | Según el hosting: `vercel.json` con un rewrite a `/index.html`, o `public/_redirects` en Netlify. |

---

## 8. Correcciones a la documentación existente

### 8.1 Estructura de `docs/` (requisito de [docs.md](docs.md))

La cátedra pide: `docs/` en la raíz, **`docs/README.md` como punto de entrada**, enlazado desde el
`README.md` del proyecto. Hoy `docs/README.md` es la consigna de la cátedra y no hay README raíz.

Propuesta de estructura:

```
README.md                      ← NUEVO: qué es Chefcito, integrantes, stack, link a docs/ e instalación
docs/
├── README.md                  ← NUEVO: índice de toda la documentación
├── consigna/                  ← mover acá README.md, FAQ.md y docs.md de la cátedra (sin tocarlos)
├── proposal.md                ← actualizar (8.3)
├── instalacion.md             ← renombrar guia-profesor.md (o dejarlo y enlazarlo)
├── demo-seed.sql
├── der.md                     ← NUEVO: DER en Mermaid generado desde schema.prisma
├── metodologia.md             ← NUEVO: Scrum/Kanban usado, roles, flujo de ramas y PRs
├── minutas/AAAA-MM-DD.md      ← NUEVO: una por reunión
├── tracking.md                ← NUEVO: link al GitHub Project + estado de cada T-X.X
├── api.md / openapi.yaml      ← NUEVO: documentación de la API
├── tests.md                   ← NUEVO: cómo correr los tests + evidencia (capturas/reportes)
├── deploy.md                  ← NUEVO: links, credenciales, variables de entorno
└── analisis-estado-proyecto.md ← este documento
```

Si se mueven los archivos de la consigna, actualizar las rutas que los mencionan en `CLAUDE.md`.

### 8.2 Minutas y tracking (gestión del proyecto)

- **Tracking:** crear un **GitHub Project** (tablero Kanban: *Todo / In progress / Review / Done*)
  con un issue por cada T-X.X pendiente y por cada bug. Enlazar cada PR con su issue
  (`Closes #N`). Poner el link en `docs/tracking.md`.
- **Minutas:** desde ahora, una minuta breve por reunión (fecha, presentes, qué se hizo, qué se
  decidió, quién hace qué). Para lo ya hecho, un resumen honesto por fase basado en las fechas
  reales de los PRs #1–#17 — **no inventar reuniones que no existieron**.
- **Metodología:** escribir cuál usamos de verdad (por ejemplo Kanban con fases/sprints de la
  task-division) y cómo es el flujo de ramas y revisiones.

### 8.3 [proposal.md](proposal.md)

- **Declarar el stack** (lo exige el FAQ para tecnologías distintas a las de la cátedra):
  React + Vite (en lugar de Angular), TypeScript en el backend, Express 5, Prisma, MySQL.
- **Actualizar el DER**: el de la imagen es anterior a cambios del schema (tablas `role`/`userrole`,
  `ingredientcategoryingredient` N:M, etc.). Mejor un `erDiagram` de Mermaid versionado en el repo
  (docs.md lo recomienda) que una imagen suelta en `user-attachments` + Google Drive.
- **Reclasificar CRUD Receta** como dependiente (depende de Usuario y Categoría).
- **Agregar el alcance extra ya hecho** (Rol, Inventario, Valor nutricional, Pasos, Imágenes,
  Recetas guardadas, Dashboard admin).
- **Agregar la sección de links a los PRs** (obligatoria en ambas entregas).
- Decidir y reflejar qué pasa con el ChatBot y los listados adicionales.

### 8.4 [CLAUDE.md](../CLAUDE.md)

- Dice que el 422 devuelve `{ errores: [...] }`; en realidad casi todo devuelve
  `{ message, errors: [{ campo, mensaje }] }` (solo auth usa `errores`). Corregir cuando se
  unifique (6.4).
- Menciona `task-division.md`; el archivo se llama `tasks-division.md`.
- Ejemplos con `.tsx` (`RecipeCard.tsx`) y "React en TypeScript y JavaScript": el front es solo
  JS/JSX.
- Referencia al "IDE Antigravity": quitar o generalizar.

### 8.5 [backend/README.md](../backend/README.md)

- Describe `database/` como "endpoint de inicialización/seed (solo dev)"; es solo un health check.
- El ejemplo de `handleValidationErrors` no coincide con el formato real.
- Dice que los handlers llevan prefijo `handle`; los controllers se llaman `searchX`, `createX`,
  `getXById`, etc.
- La checklist de AD (§13) hay que ir tildándola a medida que avancen los tests.

### 8.6 [tasks-division.md](tasks-division.md)

- Agregar una columna **Estado** (✅ / 🔄 / ⏳) a cada T-X.X.
- La convención de ramas documentada es `feature/T-X.X-...` y la de commits `[T-X.X] ...`, pero
  en la práctica se usa `task/...` y mensajes libres. **Elegir una y respetarla** de acá en
  adelante (la cátedra evalúa el uso de git).
- Actualizar la Fase 5 con el plan real (tests, deploy, docs).

---

## 9. Tests (🟠 AD)

> Todo esto agrega dependencias de desarrollo nuevas: **acordarlo en el grupo antes** (regla de
> CLAUDE.md). Propuesta: **Vitest** en back y front (misma herramienta, misma sintaxis, funciona
> con Vite y con TypeScript), **Supertest** para integración y **Playwright** para E2E.

| Test | Tipo | Qué probar (sugerencia) | Dependencias |
|---|---|---|---|
| Backend × 4 (1 por integrante) | Unitario | Services con el repository mockeado (`vi.mock`): `reviewService.createReview` (rechaza reseñar la propia / duplicada), `recipeService.updateRecipe` (403 si no es dueño), `authService.login` (credenciales inválidas, `isAdmin`), lógica de coincidencia de T-4.2, reglas de donación | `vitest` |
| Backend × 1 | Integración | Con Supertest sobre `app` (requiere 6.3) contra una BD de test (`.env.test` con otra `DATABASE_URL`): login → token → `GET` de ruta protegida (200) y sin token (401), o crear receta y leerla | `supertest`, `@types/supertest` |
| Frontend × 1 | Unitario de componente | `ErrorState` (muestra el mensaje y llama `onRetry` al hacer click), `StarRating` o `ConfirmModal` | `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` |
| Frontend × 1 | E2E | Con back y front levantados y el seed cargado: login con `juanperez` → crear receta → aparece en "Mis recetas"; o login admin → redirige a `/admin` | `@playwright/test` |

- Agregar `"test"` en los `package.json` y `"test:e2e"` en el front.
- **Evidencia:** guardar la salida de consola y el reporte HTML de Playwright (captura) en
  `docs/tests.md`.
- La BD de test **no** puede ser la misma que la de desarrollo (los tests de integración escriben
  datos) → esto además cubre "definir ambientes".

---

## 10. Documentación de la API (🟠 AD)

- **Opción recomendada:** `docs/openapi.yaml` (OpenAPI 3, el estándar para REST) y, si el grupo
  acepta la dependencia, servirlo con `swagger-ui-express` en `/api/docs` para probar en vivo.
- **Opción mínima (sin dependencias):** `docs/api.md` con una tabla por recurso: método, ruta,
  nivel de acceso, body, respuestas y códigos de error.
- Punto de partida: el inventario de endpoints del [Anexo A](#anexo-a--inventario-de-endpoints-actual).
- Documentar el formato común de errores (`{ message }`, `{ message, errors: [{ campo, mensaje }] }`)
  y el header `Authorization: Bearer <token>`.

---

## 11. Deploy (🟠 AD)

| Parte | Opciones | A tener en cuenta |
|---|---|---|
| Base de datos | MySQL gestionado: Railway, Aiven (free), Clever Cloud, TiDB Serverless (compatible con MySQL) | Correr `npx prisma db push` contra esa URL y cargar `demo-seed.sql`. |
| Backend | Render o Railway | Necesita 6.1 y 6.2. Variables: `DATABASE_URL`, `JWT_SECRET` (**uno nuevo**, no el de la guía, que es público en el repo), `CORS_ORIGINS`, `PORT`. |
| Frontend | Vercel o Netlify | `VITE_API_BASE_URL` apuntando al backend deployado. Rewrites para la SPA (7.11). |
| Imágenes | — | ⚠️ Las fotos se guardan en `backend/uploads/` (disco local). En Render free el disco se borra en cada redeploy → las fotos subidas se pierden. Opciones: Railway con volumen persistente, o aceptar que en la demo se usen links externos. Decidirlo antes de elegir hosting. |

Después: `docs/deploy.md` con los links y las credenciales de demo (admin + un usuario común).

---

## 12. Reparto sugerido

Basado en [tasks-division.md](tasks-division.md) (Fases 4 y 5) y en que **cada integrante necesita
su propio test y poder defender un CU**. Es una propuesta: ajustarla en la próxima reunión.

| Integrante | Funcionalidad | Test propio (backend) | Otras tareas | CU que defiende |
|---|---|---|---|---|
| **Stéfano** (Dev A) | Deploy completo (6.1, 6.2, 6.3, 7.11, 11) · editar reseña (5.2) | Integración (Supertest) + unitario de `reviewService` | README raíz, índice de docs, propuesta, GitHub Project, revisar PRs | Reseñar recetas |
| **Elías** (Dev B) | T-4.2 Recetas según inventario (5.3) | Unitario de la lógica de coincidencia | Documentación de la API (sus endpoints + consolidar) | Consultar recetas según ingredientes |
| **Juan** (Dev C) | T-4.3 Donaciones (5.4) | Unitario de `donationService` | Test E2E con Playwright (T-5.3) · sacar los *Próximamente* | Donar a creadores |
| **Gastón** (Dev D) | T-4.4 Explorar recetas con filtros (5.1 + 6.6) | Unitario de `recipeService` (filtros / permisos) | Test unitario de componente (front) · minutas | Crear y publicar recetas (+ listados) |

Las mejoras 🟡/⚪ de las secciones 6 y 7 las toma **cada uno sobre su propia feature**, o se
reparten al final. No tocar código de otro sin avisar (regla del grupo).

**Sobre la participación en git.** La cátedra evalúa "los aportes que haya realizado cada
integrante" mirando el historial. Hoy (`git shortlog --no-merges`, sin contar los commits del
template) la distribución está despareja: Stéfano 25, Juan 6, Gastón 6, Elías 3. Para lo que
queda: **cada uno commitea y abre los PRs de sus tareas desde su propia cuenta**, con commits
chicos y frecuentes, aunque después Stéfano revise y mergee.

---

## 13. Preparación de la defensa

Cada integrante tiene que poder explicar, además de su feature:

- **Arquitectura backend:** por qué capas, qué hace cada una, por qué solo el repository usa
  Prisma, por qué los services devuelven `{ ok, reason }` en vez de tirar excepciones.
- **Patrones:** Repository, Singleton (`prismaClient.ts`), cadena de middlewares (Chain of
  Responsibility), `ApiError extends Error` (herencia), Context + `useReducer` (`AuthContext`).
- **Seguridad:** bcrypt con salt, JWT (payload, expiración, dónde se guarda), `verifyToken` /
  `verifyAdmin` / `verifyOwnerOrAdmin`, por qué `idUser` sale del token y no del body, por qué
  Prisma previene SQL injection, baja lógica de usuarios.
- **Frontend:** `ProtectedRoute` y los 3 niveles, `apiFetch` y el evento de sesión expirada,
  mobile-first con `respond-to`, input/output properties (props y callbacks `onX`), estados de
  carga/error/vacío.
- **Tests:** qué prueba el suyo y cómo se corre.

---

## 14. Checklist final de entrega AD

Formulario: https://kutt.to/DSWEntregaSistemaFinal

- [ ] Listados con filtro (categoría y valoración) + detalle
- [ ] Editar reseña en la UI
- [ ] CU Recetas según ingredientes
- [ ] CRUD + CU Donaciones
- [ ] Sin botones *Próximamente* ni datos falsos en la UI
- [ ] 4 tests unitarios backend + 1 integración, pasando
- [ ] 1 test de componente + 1 E2E en el front, pasando
- [ ] Evidencia de tests en `docs/tests.md`
- [ ] Documentación de la API
- [ ] `.env.example` en back y front
- [ ] Deploy funcionando (back + front + BD en la nube) y probado desde un celular
- [ ] Credenciales de demo en la entrega
- [ ] `README.md` raíz con instalación y link a `docs/README.md`
- [ ] `docs/README.md` como índice
- [ ] Propuesta actualizada con stack, DER y links a los PRs
- [ ] Minutas, metodología y tracking (GitHub Project)
- [ ] Video demo (recorrer los 4 CU, los CRUDs y el panel admin)
- [ ] PR `develop` → `main` para la entrega
- [ ] Coordinar la fecha de defensa con los docentes

---

## Anexo A — Inventario de endpoints actual

Base: `/api`. **Público** = sin token · **Token** = cualquier usuario logueado ·
**Dueño/Admin** = el propio usuario o un admin · **Admin** = solo admin.

| Recurso | Método y ruta | Acceso |
|---|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` | Público |
| Usuarios | `GET /users` (`?inactive=true` solo admin) · `GET /users/:id` | Token |
| | `POST /users` · `PATCH /users/:id/restore` | Admin |
| | `PATCH /users/:id` · `PATCH /users/:id/password` · `DELETE /users/:id` (baja lógica) | Dueño/Admin |
| | `PATCH` / `DELETE /users/:id/avatar` · `PATCH` / `DELETE /users/:id/cover` (foto de perfil y portada, archivo multipart en `image`) | Dueño/Admin |
| Inventario | `GET`, `POST /users/:userId/inventory` · `PATCH`, `DELETE /users/:userId/inventory/:ingredientId` | Dueño/Admin |
| Roles | `GET`, `POST /roles` · `GET`, `PATCH`, `DELETE /roles/:id` · `GET /roles/users/:userId` · `GET`, `POST /roles/:id/users` · `DELETE /roles/:id/users/:userId` | Admin |
| Categorías de receta | `GET /categories` · `GET /categories/name/:name` | Token |
| | `POST /categories` · `PATCH`, `DELETE /categories/:id` | Admin |
| Categorías de ingrediente | `GET /ingredient-categories` · `GET /ingredient-categories/:id` | Público |
| | `POST` · `PATCH`, `DELETE /:id` | Admin |
| Ingredientes | `GET /ingredients` · `GET /ingredients/:id` | Público |
| | `POST` · `PATCH`, `DELETE /:id` | Admin |
| Valores nutricionales | `GET /ingredients/:idIngredient/nutritional-values` · `GET .../:num` | Público |
| | `POST` · `PATCH`, `DELETE .../:num` | Admin |
| Recetas | `GET /recipes` (`?userId=N`) · `GET /recipes/:id` | Público |
| | `POST /recipes` | Token |
| | `PATCH`, `DELETE /recipes/:id` | Dueño de la receta/Admin |
| Pasos | `GET /recipes/:idRecipe/steps` | Público |
| | `PUT /recipes/:idRecipe/steps` (reemplaza la lista) | Dueño/Admin |
| Ingredientes de receta | `GET /recipes/:idRecipe/ingredients` | Público |
| | `PUT /recipes/:idRecipe/ingredients` (reemplaza la lista) | Dueño/Admin |
| Imágenes | `GET /recipes/:idRecipe/images` | Público |
| | `POST` (multipart `image` o JSON `imageUrl`) · `PATCH`, `DELETE /:id` | Dueño/Admin |
| Reseñas | `GET /recipes/:idRecipe/reviews` (incluye `averageRating`) | Público |
| | `POST /recipes/:idRecipe/reviews` | Token |
| | `PATCH`, `DELETE /recipes/:idRecipe/reviews/:idReview` | Autor/Admin |
| Guardado | `GET`, `POST`, `PATCH`, `DELETE /recipes/:idRecipe/save` | Token (usuario del token) |
| | `GET /saved-recipes/:idUser` | Dueño/Admin |
| Salud | `GET /database/health` | Público |
| Archivos | `GET /uploads/recipes/<archivo>` · `GET /uploads/users/<archivo>` (estático, fuera de `/api`) | Público |
| **Donaciones** | — | **No existe todavía** |

## Anexo B — Verificaciones hechas para este análisis

- `frontend`: `npm run lint` → sin errores · `npm run build` → OK (JS 431 kB / 116 kB gzip).
- `backend`: `npx tsc --noEmit` → sin errores.
- Búsquedas en el código: servicios/modelos sin uso, `Próximamente`, `TODO`, datos mock,
  `handleValidationErrors` duplicados, listados que responden 404, uso de `saveCount`, tamaño de
  componentes, historial de git.
- **No se levantó la app ni se probó contra la base de datos**: lo funcional se dedujo leyendo
  el código. Conviene recorrer la app completa con el seed antes de la entrega.
