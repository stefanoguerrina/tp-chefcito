# Registro de sesiones de trabajo

Qué se hizo en cada sesión, por qué y cómo se verificó. Complementa a
[analisis-estado-proyecto.md](analisis-estado-proyecto.md): cuando un pendiente de ese análisis se
resuelve, se borra de allá y queda anotado acá.

---

## 08/10/2026 — Validación duplicada en los controllers (ex B3)

**Rama:** `TASK/OptimizacionDeCodigo`

### Problema

11 controllers volvían a llamar `validationResult(req)` y a responder 422, aunque esa misma ruta
ya pasaba por `handleValidationErrors`, que corta la request con un 422 antes de llegar al
controller. Ese bloque nunca se ejecutaba: era código muerto (ítem B3 de
[analisis-estado-proyecto.md](analisis-estado-proyecto.md)).

### Verificación previa

Se revisaron las 22 rutas que llegan a esas funciones: todas tienen la forma
`validateX, handleValidationErrors, controller`. Por eso borrar el bloque no cambia la respuesta
de ningún endpoint.

### Cambios

Se borró el bloque `validationResult` + `if (!errors.isEmpty()) {...}` y el
`import { validationResult } from 'express-validator'`, que dejaba de usarse, en:

| Controller (`backend/src/features/...`) | Funciones |
|---|---|
| `auth/controllers/authController.ts` | `register`, `login` |
| `category/controllers/categoryController.ts` | `createCategory`, `updateCategoryById` |
| `image/controllers/imageController.ts` | `createImage`, `updateImageById` |
| `ingredient/controllers/ingredientController.ts` | `createIngredient`, `updateIngredientById` |
| `ingredientCategory/controllers/ingredientCategoryController.ts` | `createIngredientCategory`, `updateIngredientCategoryById` |
| `nutritionalValue/controllers/nutritionalValueController.ts` | `createNutritionalValue`, `updateNutritionalValueByNum` |
| `recipe/controllers/recipeController.ts` | `createRecipe`, `updateRecipeById` |
| `recipeIngredient/controllers/recipeIngredientController.ts` | `replaceRecipeIngredientsForRecipe` |
| `rol/controllers/roleController.ts` | `createRole`, `updateRoleById`, `assignRoleToUser` |
| `step/controllers/stepController.ts` | `replaceStepsForRecipe` |
| `user/controllers/userController.ts` | `createUser`, `updateUserById`, `changeUserPassword` |

También se borraron los comentarios que justificaban el chequeo repetido ("Doble chequeo..." en
`authController.register` y "...como buena práctica siempre se verifica en el controller también"
en `createCategory` y `updateUserById`).

No se tocaron rutas, middlewares, services, repositories ni el frontend.

### Verificación

- `npx tsc --noEmit` en `backend/`: sin errores.
- `git diff`: en los 11 controllers solo hay líneas borradas, ninguna agregada.
- Prueba con el servidor levantado (`npm run dev`, base con `demo-seed.sql`, token de `admindemo`):
  - Las 22 rutas, con datos inválidos, siguen respondiendo **422** con los errores por campo. En
    los PATCH se mandó `{"name":"x"}` (menos de 2 caracteres) para que fallen seguro y no se
    modifique nada en la base.
  - Login válido y lecturas (`/recipes`, `/recipes/1`, `/ingredients`, `/categories`,
    `/ingredient-categories`, `/roles`, `/admin/summary`, `/recipes/1/ingredients`,
    `/search/recipes?q=milanesa`) responden **200**.
  - **Casos válidos de las 22 rutas: 23/23 OK.** Con datos de prueba (prefijo `zz_test`) se hizo
    el recorrido completo:
    1. Registro y login del usuario nuevo; alta de usuario desde admin, edición y cambio de
       contraseña (más un login con la contraseña nueva).
    2. Alta y edición de categoría, de categoría de ingrediente y de ingrediente.
    3. Valor nutricional con decimal con coma (`"12,5"` se guardó como `12.5`).
    4. Receta con ingredientes, pasos e imagen.
    5. Rol, con su edición y asignación a un usuario.

    Las altas respondieron 201 y las ediciones 200, con el dato modificado en la respuesta. El
    detalle de la receta de prueba calculó bien la nutrición: 200 g de un ingrediente con
    12,5 g de proteína cada 100 g da 25 g en total, que en 2 porciones son 12,5 por porción.
  - Limpieza: todo lo creado se borró por la API. Los 2 usuarios se borraron con Prisma, porque
    la API solo hace baja lógica, y sus roles asignados se fueron en cascada. El rol de prueba
    respondió primero 409 (la API no deja borrar un rol con usuarios asignados, regla de negocio
    esperada) y se borró después de eliminar los usuarios. Al final no queda ningún registro
    `zz_test` en roles, categorías, ingredientes, categorías de ingrediente, recetas ni usuarios.

### Para la defensa

La validación de formato vive en un solo lugar: las reglas `validateX` de cada feature más
`handleValidationErrors` en la ruta. El controller recibe datos que ya pasaron la validación y solo
se encarga de las reglas de negocio (duplicados, permisos) y de la respuesta HTTP.

### Queda pendiente (B2)

`handleValidationErrors` sigue copiado en 16 features y no todas las copias responden igual (auth
responde `{ errores }`, el resto `{ message, errors }`). La solución es usar en todas las rutas el
de `core/middleware/validationMiddleware.ts`.

---

## 08/10/2026 — Listados vacíos respondían 404 (ex B4)

**Rama:** `TASK/OptimizacionDeCodigo`

### Problema

Varios `GET` de listados respondían **404** cuando no había datos, en vez de `200 []`. Un 404
significa "el recurso no existe", pero una lista vacía sí existe: solo no tiene elementos. El
frontend lo compensaba envolviendo esos pedidos con `fetchListOrEmpty` (ítem B4 de
[analisis-estado-proyecto.md](analisis-estado-proyecto.md)).

Además de los 7 listados que nombraba B4, aparecieron 2 más con el mismo patrón: el inventario
de un usuario y los usuarios de un rol.

### Cambios

En cada caso se sacó el `if (x.length === 0) return null;` del service (ahora devuelve el array
tal cual) y el bloque del controller que respondía 404 con la lista vacía:

| Endpoint | Service | Controller |
|---|---|---|
| `GET /api/categories` | `categoryService.getAllCategories` | `searchCategories` |
| `GET /api/ingredients` | `ingredientService.getAllIngredients` | `searchIngredients` |
| `GET /api/ingredient-categories` | `ingredientCategoryService.getAllIngredientCategories` | `searchIngredientCategories` |
| `GET /api/ingredients/:id/nutritional-values` | (ya devolvía el array) | `searchNutritionalValuesByIngredient` |
| `GET /api/recipes` y `?userId=` | `recipeService.getAllRecipes`, `getRecipesByUser` | `searchRecipes` |
| `GET /api/roles` | `roleService.getAllRoles` | `searchRoles` |
| `GET /api/roles/:id/users` | (ya devolvía el array) | `getUsersByRole` |
| `GET /api/users` y `?inactive=true` | `userService.getAllUsers`, `getDeletedUsers` | `searchUsers` |
| `GET /api/users/:userId/inventory` | `inventoryService.getUserInventory` | `getInventory` |

Se mantienen los 404 que sí significan "no existe": rol inexistente en `/roles/:id/users`,
ingrediente inexistente en `/nutritional-values`. Los `reason: 'empty'` de pasos e ingredientes
de receta tampoco se tocaron: no son listados, rechazan un `PUT` con la lista vacía.

**Frontend:** no hizo falta cambiarlo. `fetchListOrEmpty` devuelve la lista tal cual cuando la
respuesta es 200, así que todo sigue funcionando y queda como red de seguridad.

**Documentación:** se sacó B4 de `analisis-estado-proyecto.md` (y del reparto, que ahora dice
"limpieza B2"), el punto débil correspondiente de `guia-defensa.md` y se actualizó la convención
en `CLAUDE.md` (los listados responden `200 []`).

### Verificación

- `npx tsc --noEmit` en `backend/`: sin errores.
- Con el servidor levantado (token de `admindemo`), 14/14 OK:
  - **Listados vacíos → 200 `[]`** (antes 404): `/users?inactive=true`, `/recipes?userId=6`,
    `/users/6/inventory`, `/roles/:id/users` de un rol nuevo sin usuarios y
    `/ingredients/:id/nutritional-values` de un ingrediente nuevo sin valores.
  - **Listados con datos → 200** con los datos: categorías, ingredientes, categorías de
    ingrediente, recetas, roles, usuarios y recetas de un usuario.
  - **Recurso inexistente → sigue 404**: `/roles/99999/users` e
    `/ingredients/99999/nutritional-values`.
  - El rol, el ingrediente y la categoría de ingrediente `zz_test` creados para la prueba se
    borraron al final; no queda ningún registro `zz_test`.
  - Los listados generales (categorías, ingredientes, etc.) no se pudieron probar vacíos sin
    borrar datos reales; usan exactamente el mismo cambio que los casos que sí se probaron.

### Para la defensa

"¿Por qué un listado vacío no es 404?" Porque el 404 indica que la URL o el recurso no existe.
`/api/categories` siempre existe; si no hay categorías, la respuesta correcta es `200` con `[]`, y
el front muestra "no hay datos" sin tratarlo como error.

---

## 08/10/2026 — Respuestas HTML en rutas inexistentes y errores inesperados (ex B6)

**Rama:** `task/OptimizacionDeCodigo`

### Problema

Toda la API responde JSON, salvo tres casos en los que Express devolvía su página HTML por
defecto (`<!DOCTYPE html>...<title>Error</title>`), que el frontend no puede leer como mensaje:

- una ruta que no existe (ej. `GET /api/no-existe`);
- un body que no es JSON válido o que supera el límite de 1 MB;
- un error que ningún `try/catch` atrapa.

(Ítem B6 de [analisis-estado-proyecto.md](analisis-estado-proyecto.md).)

### Cambios

- **Nuevo** `backend/src/core/middleware/errorMiddleware.ts`, con dos middlewares:
  - `handleNotFound`: si la request llegó al final sin que ninguna ruta la atendiera, responde
    **404** `{ message: 'Ruta no encontrada.' }`.
  - `handleUnexpectedError`: el manejador de errores de Express (se reconoce porque recibe 4
    parámetros: `err, req, res, next`). Si el error es del cliente (4xx) respeta su código, con
    un mensaje en español: **400** "no es un JSON válido", **413** "demasiado grande". Cualquier
    otro error responde **500** `{ message: 'Error interno del servidor.' }` (el mismo texto que
    usan los controllers) y el detalle solo se loguea en la consola del servidor, nunca se manda
    al cliente.
- `backend/src/app.ts`: se montan los dos al final, después de `app.use("/api", apiRouter)`.
  Tienen que ir últimos: Express recorre los middlewares en orden, así que solo llegan ahí las
  requests que nadie respondió o los errores que nadie atrapó.

No se tocó ninguna ruta, controller ni el frontend. Los controllers siguen atrapando sus propios
errores esperados, y los middlewares de subida de fotos (multer) siguen respondiendo sus 422.

### Verificación

- `npx tsc --noEmit` en `backend/`: sin errores.
- Con el servidor levantado:
  - **Casos nuevos (antes HTML):** `GET /api/no-existe` → 404 JSON; `DELETE /api/recipes` sin id
    → 404 JSON; `/uploads/no-existe.webp` → 404 JSON; login con JSON roto → 400 JSON; body de
    más de 1 MB → 413 JSON.
  - **Lo que ya andaba, sin cambios:** `GET /` → 200; `GET /api/recipes` → 200;
    `/api/recipes/99999` → su 404 "Receta no encontrada."; login sin datos → 422 con errores por
    campo; `/api/users` sin token → 401; login válido → 200; una foto real de `/uploads` → 200
    `image/webp`.
- **Error 500:** no se puede provocar en la API real sin romper código, así que se probó el
  middleware compilado en una app Express de prueba con una ruta que lanza un error, tanto
  síncrono como en una función `async`. Las dos responden 500
  `{"message":"Error interno del servidor."}` sin mostrar el detalle del error.

**Documentación:** se sacó B6 de `analisis-estado-proyecto.md` y se agregó a `CLAUDE.md` que
estos dos middlewares tienen que quedar al final de `app.ts`.

### Para la defensa

"¿Qué pasa si piden una ruta que no existe o algo explota?" Al final de `app.ts` hay un
middleware 404 y un manejador de errores (4 parámetros). Así la API siempre responde JSON con
un `message`, el front lo muestra como cualquier otro error, y nunca se le muestra al usuario un
detalle interno del servidor.

---

## 09/10/2026 — Mejoras pendientes del backend (ex B1, B2, B5, B7, B8, B9, B10, B12, B13 y D5)

**Rama:** `task/Correcciones-Front-Back`

### Problema

La sección 4 de [analisis-estado-proyecto.md](analisis-estado-proyecto.md) listaba mejoras del
backend que no cambian lo que ve el usuario pero sí cómo está hecho el código: no se podía
testear la app con Supertest, la validación estaba copiada en 16 features, había un segundo
camino a la base de datos y algunas consultas estaban repetidas o se hacían de a una.

### Cambios

| Ítem | Qué se hizo |
|---|---|
| **B1** | `app.ts` ahora solo **arma y exporta** la app (sin `listen`). El nuevo `server.ts` es el punto de entrada: hace el `listen` y programa la revisión de donaciones vencidas (**D5**). `package.json`: `dev`, `start` y `main` apuntan a `dist/server.js`; se completó `description`. El script `test` queda para cuando se acuerden las dependencias de test. |
| **B2** | Se borraron las **16 copias** de `handleValidationErrors`: todas las rutas usan la de `core/middleware/validationMiddleware.ts`. Auth (422 y 409 de usuario/email repetido) pasó de `{ errores }` a `{ message, errors }`, como el resto. En `image`, el borrado de la foto que multer ya guardó pasó a un middleware propio (`discardUploadIfInvalid`), entre las reglas y el `handleValidationErrors` común. |
| **B5** | El health check usa Prisma (`SELECT 1` en `features/database/repository`) y responde 503 sin mostrar el detalle del error. Se borró `src/database.ts` (pool de `mysql2`) y se desinstaló `mysql2` (`npm uninstall mysql2`: cambian `package.json` y `package-lock.json`); el `.env` ya no necesita `DB_HOST/PORT/USER/PASSWORD/NAME`. |
| **B7** | Se sacó la columna `recipe.saveCount` (nunca se actualizaba ni se usaba) del esquema y de `demo-seed.sql`. |
| **B8** | `authMiddleware.ts` suma `verifyOwnerOrAdminOf(paramName, mensaje)`; `verifyOwnerOrAdmin` es ese mismo chequeo para `:id`. Lo usan inventario (`:userId`, en lugar del middleware copiado en el router) y recetas guardadas (`:idUser`, en lugar del `if` en el controller). |
| **B9** | La consulta "promedio y cantidad de reseñas por receta" quedó una sola vez, en `reviewRepository.findReviewStats`, y el armado de `averageRating`/`reviewCount` en `reviewService.withReviewStats`. Recipe, search y feed los importan en vez de tener su copia. |
| **B10** | El Top 10 (`feedService.getTopRecipes`) pide las cards de a `limit` recetas del ranking, en vez de las de todo el ranking. Si alguna es de un usuario dado de baja, pide el tramo siguiente. |
| **B12** | La tabla de usuarios del admin calcula las reseñas recibidas con **dos consultas fijas** (recetas de los usuarios de la página + suma y cantidad de reseñas por receta, con `groupBy`), en vez de una por usuario. |
| **B13** | La consulta "¿existe el ingrediente?" de inventario pasó del service al repository: ahora **solo los repositories importan Prisma**. |

En el frontend solo cambió `apiFetch.js`: lee los errores por campo de `errors` (ya no hace
falta `errores`).

### Verificación

- `npx tsc --noEmit` en `backend/`: sin errores. `eslint` sobre `apiFetch.js`: sin errores.
- **Comparación viejo vs. nuevo con la misma base:** se levantó el backend de `HEAD` (antes de
  los cambios, puerto 3998) y el nuevo (puerto 3999) y se hicieron los mismos 46 pedidos a los
  dos, con tokens de `juanperez`, `mariagomez` y `admindemo`. **43/46 respuestas son
  idénticas** (status y body): health, recetas, detalle, búsqueda rápida, listados con orden por
  valoración, inventario y necesidades nutricionales, feed (amigos, reseñas y Top con distintos
  plazos y límites), resumen y tabla de usuarios del admin (páginas, filtros, búsqueda),
  inventario y recetas guardadas propias, ajenas (403) y como admin, 401 sin token, 422 de
  recetas, búsqueda y asistente, 404 JSON y JSON roto. Las 3 diferencias son las esperadas: el
  422 del login y el 409 del registro ahora usan `errors` en vez de `errores`, y el 422 de los
  pasos usa el texto común ("Revisá los campos enviados."). Los mensajes por campo, que son los
  que muestra el front, no cambiaron.
- Foto de receta con un campo inválido (`isMain` no booleano): los dos responden 422 y **el
  archivo subido se borra** (12 archivos en `uploads/recipes` antes y después).
- No se corrió `prisma db push` contra la base local: el cliente se regeneró sin `saveCount` y
  la app funciona igual con la columna todavía en la base (Prisma la ignora).

### Para la defensa

- "¿Cómo testearían la API?" `app.ts` exporta la app sin levantarla, así Supertest le hace
  pedidos sin abrir un puerto ni arrancar el timer de donaciones (eso queda en `server.ts`).
- "¿Dónde se valida?" Las reglas en cada feature (`validateX`) y la respuesta en un solo lugar
  (`handleValidationErrors` de `core`): todos los 422 tienen el mismo formato.
- "¿Cómo evitaron el N+1 en el admin?" Dos consultas por página (una agrupada), sin importar
  cuántos usuarios haya.

### Queda pendiente

- B11 (migraciones de Prisma): no se hizo. Pasar de `db push` a `migrate` obliga a cada
  integrante a marcar como aplicada la migración inicial en su base, así que conviene decidirlo
  en grupo antes del deploy.
- Quien ya tenga la base cargada: `npx prisma db push --accept-data-loss` para borrar la
  columna `saveCount` (no tiene datos que se usen).

---

## 09/10/2026 — Loader en toda la app, arreglos de donaciones (ex D4, D8, D9) y guía del profesor

**Rama:** `task/Correcciones-Front-Back`

### Problema

- Mientras se esperaba al backend, cada sección mostraba un texto distinto ("Cargando...",
  "Buscando...") o directamente nada. Muchas **acciones** (guardar una receta, seguir, borrar,
  cambiar de página en un listado, el inventario) no daban ninguna señal de que algo se estaba
  ejecutando.
- Donaciones: `confirmPayment` podía pisar una donación ya completada (D4); `demo-seed.sql` no
  tenía donaciones y `/donaciones` arrancaba vacía (D8); un comentario listaba mal los estados (D9).
- `docs/guia-profesor.md` se hizo para que el profesor pudiera revisar el avance. La próxima
  entrega es la de AD y ya no hace falta.

### Cambios

**Loader (frontend)**

| Pieza | Qué hace |
|---|---|
| `shared/utils/requestTracker.js` (nuevo) | Cuenta los pedidos al backend en curso y las secciones que ya muestran su spinner, y avisa a quien se suscriba (patrón Observer). |
| `shared/utils/apiFetch.js` | Avisa al tracker al empezar y al terminar cada pedido (en un `finally`, así también se apaga si falla). Nueva opción `background: true` para los pedidos que no deben mostrar el loader. |
| `core/components/RequestIndicator.jsx` (nuevo) | Loader global, montado una sola vez en `App.jsx`: un cartel flotante abajo al centro, con el spinner y "Cargando…", cuando un pedido tarda más de 400 ms. No bloquea la pantalla y queda por encima de los modales. |
| `core/components/LoadingState.jsx` (nuevo) | Spinner + texto para una sección que está cargando (la contraparte de `ErrorState`). Mientras está en pantalla el loader global no aparece, para no mostrar dos. Tiene una variante `LoadingState--compact`. |
| 27 pantallas y paneles | Los textos "Cargando..."/"Buscando..." se cambiaron por `LoadingState`: inicio (amigos, Top 10, reseñas), perfil, detalle y editor de receta, mis recetas, reseñas, inventario, búsqueda (resultados, listados y panel rápido), donaciones (página, modal y resultado), y en el panel admin el dashboard, usuarios, ingredientes, categorías y roles. Se borraron las clases de CSS que quedaron sin uso. |
| `background: true` | El chequeo del pago cada 4 s (`DonationWaitingView`), la búsqueda rápida (ya muestra "Buscando...") y el chat (ya muestra "escribiendo..."). |

**Donaciones**

- **D4:** en `donationService.confirmPayment`, si la donación ya está `completed`, se devuelve sin
  cambiar el estado.
- **D8:** sección 10 de `demo-seed.sql`: 13 donaciones de ejemplo (`transactionRef` `demo-01` a
  `demo-13`). `juanperez` tiene recibidas de 4 personas y realizadas en estado completada,
  rechazada y vencida. No hay ninguna `pending`, porque el backend la revisaría contra Mercado
  Pago. Primero borra las `demo-...`, así se puede correr sola y repetir.
- **D9:** el comentario de `donationFromApi` ahora lista los 4 estados.
- D1 (que el admin vea las donaciones) se descartó: cada usuario ve solo las suyas.

**Documentación**

- Se borró `docs/guia-profesor.md`, junto con sus referencias en `CLAUDE.md`,
  `guia-defensa.md` y el análisis. Ojo: las **instrucciones de instalación siguen siendo
  obligatorias para la AD** y ahora van en el `README.md` raíz. La guía se puede recuperar con
  `git show 40f3b70:docs/guia-profesor.md`.
- `CLAUDE.md`, `guia-defensa.md` y `donaciones.md` documentan el loader, el seed de donaciones y
  el arreglo de D4.

### Verificación

- Frontend: `npx eslint src` sin errores y `npm run build` OK.
- Backend: `tsc` sin errores.
- Seed: se ejecutó la sección 10 contra la base local (13 filas). Después, con el backend
  levantado, se consultó `GET /api/donations` como tres usuarios:
  - `juanperez`, recibidas: total $22.000 en 6 donaciones, promedio $3.667. Top: carlosdiaz
    10.000, luciafernandez 5.000, martinlopez 3.500, mariagomez 3.500.
  - `juanperez`, realizadas: total $7.500 en 2. Las 4 filas aparecen, incluidas la rechazada y la
    vencida, pero solo las 2 completadas suman en los totales.
  - `mariagomez` (recibidas y realizadas) y `martinlopez` (solo realizadas) también dan lo
    esperado. Los íconos corresponden a cada monto fijo.
- D4 no se pudo probar contra Mercado Pago (hace falta un pago real de prueba). Es un `if`
  antes de actualizar el estado.
- El loader no se probó en el navegador. Para verlo: con las herramientas del navegador en
  "Slow 3G", guardar una receta o cambiar de página en un listado.

### Para la defensa

- "¿Cómo sabe el usuario que algo se está ejecutando?" Toda sección que carga muestra
  `LoadingState`. Además, como todos los pedidos pasan por `apiFetch`, ahí se cuentan y un único
  componente (`RequestIndicator`) muestra el loader si alguno tarda. Es el patrón Observer: el
  tracker avisa y el componente se suscribe. No hace falta acordarse de mostrarlo en cada pantalla.
- "¿Por qué espera 400 ms?" Para que un pedido rápido no haga parpadear el loader.

---

## 09/10/2026 — Mejoras del frontend (ex F1, F3–F11) y limpieza de código sin uso

**Rama:** `task/Correcciones-Front-Back`

### Problema

La sección 5 de [analisis-estado-proyecto.md](analisis-estado-proyecto.md) listaba mejoras del
frontend: la landing mostraba recetas inventadas, faltaban modelos en varias features (requisito
de regularidad), había componentes de más de 200 líneas, código sin uso, textos con "despensa",
la lista de seguidores no existía y casi todos los modales se cerraban al soltar el mouse afuera.
Durante el trabajo aparecieron más problemas del mismo tipo (abajo, "Encontrado en el camino").

### Cambios

| Ítem | Qué se hizo |
|---|---|
| **F1** | La landing muestra **las 5 recetas mejor valoradas de los últimos 30 días** con datos reales: `landing/services/landingService.js` + `models/landingModel.js` + `hooks/useLandingTopRecipes.js`, con carga, error con "Reintentar" y estado vacío. En el backend, `GET /api/feed/top-recipes` pasó a ser **público** (no usa datos del usuario; las cards traen lo mismo que `GET /api/recipes`, que ya era público). Se borraron `landingMockData.js` y las 5 fotos de ejemplo. |
| **F3** | Modelos nuevos (factory functions) y los servicios mapean con ellos: `categoryFromApi`, `ingredientCategoryFromApi`, `imageFromApi`, `stepFromApi`, `recipeIngredientFromApi`, `nutritionalValueFromApi`/`ToPayload` (en `ingredient/models`, es entidad débil del ingrediente), `userFromApi` (+ formularios de perfil y contraseña en `user/models/userModel.js`) y `userRecipeFromApi`. Los `stepsToDraft`/`ToPayload`, `recipeIngredientsToDraft`/`ToPayload` y `recipeImagesToDraft` se mudaron de `recipeModel` al modelo de su feature. |
| **F4** | Botón **"Cambiar contraseña"** en "Editar perfil" (solo para la cuenta propia: el backend pide la actual) → `ChangePasswordModal` (actual, nueva y confirmación, validación antes de enviar y errores por campo). **Arreglo en el backend:** la contraseña actual incorrecta respondía **401**, y `apiFetch` toma todo 401 con token como sesión vencida: el usuario quedaba deslogueado. Ahora responde **400** con el error en el campo `currentPassword`. |
| **F5** | Todos los componentes quedaron en 200 líneas o menos. Las dos tablas de categorías del admin y los dos `CategoryFormModal` (que eran copias) se unificaron en `AdminCategoriesTable` + `AdminCategoryRow` y `core/components/CategoryFormModal`; las funciones puras repetidas de sus modelos, en `adminCategoriesModel.js`. Pie de paginación común `AdminTablePagination` (3 tablas). Hook `core/hooks/useDeleteConfirmation` (confirmar borrado + aviso si falla) en las tablas, roles y "Mis recetas". `useEditProfileForm`, `useRecipeEditor`, `useProfileRecipeActions` y componentes chicos (`EditProfileField`, `EditProfilePhoneField`, `AdminUsersTableHeader`, `InventoryHeader`, `InventorySearchBar`, `InventorySuggestionBanner`). `core/components/EmptyState` (contraparte de `LoadingState`/`ErrorState`) reemplaza dos bloques de estado vacío idénticos. |
| **F6** | Borrados: `react.svg`, `vite.svg`, `hero.png`, `public/icons.svg`, `MasonryGrid` (+ `.scss`), `RecipeListItem` (+ `.scss`), `useScrollReveal`, `getSavedRecipesByUser` + `savedRecipeFromApi`, los `.gitkeep` y las carpetas vacías `src/components`, `src/data` y `src/pages`. |
| **F7** | "Despensa" → "inventario" en todos los textos y comentarios; la etiqueta del detalle de receta pasó a "Lo tenés". El parámetro de la URL del filtro ahora es `?inventario=1` (antes `?despensa=1`). |
| **F8** | El banner de "Mi inventario" tenía un botón **deshabilitado** "Ver recetas posibles": ahora lleva a `/buscar/recetas?inventario=1`. |
| **F9** | Lista de **seguidores y seguidos**: `GET /api/users/:userId/follow/followers` y `/following` (solo usuarios activos, datos públicos) y `FollowListModal` con dos pestañas, que se abre tocando esas tarjetas en las métricas del perfil. Cada persona lleva a su perfil. |
| **F11** | `useOverlayClose` en **todos** los modales (16 archivos). |

**Encontrado en el camino (también corregido):**

- Las secciones de categorías y roles **volvían a pedir toda la lista** (con loader) después de crear o editar, y "Mis recetas" después de borrar: ahora actualizan la lista local con la respuesta (feedback del profesor).
- **Paginación:** al borrar la última fila de la última página, la tabla quedaba vacía con "Página 3 de 2".
- **Estilos viejos que pisaban a los nuevos:** `_inventory-page.scss` tenía una versión anterior de los estilos de `EditIngredientModal` (184 líneas) y de `IngredientCard` (297 líneas). Como esa hoja se carga después, sus reglas pisaban las de `_edit-ingredient-modal.scss` e `_ingredient-card.scss` (por eso el modal de editar cantidad salía de 440 px en vez de 350). Se borraron.
- `index.css` traía el `#root` del template de Vite (ancho fijo de 1126 px, borde y texto centrado) que la landing, la home y el admin anulaban con `#root:has(...)`. Se dejó un `#root` neutro y se sacaron los tres `:has()`.
- El fondo de los modales tenía 4 colores distintos copiados en 15 archivos: ahora es la variable `$color-scrim`.
- Los dos `<select>` nativos que quedaban (orden de los listados y mes/año del calendario) pasaron a `DropdownSelect`, como pide `CLAUDE.md`.
- Login y registro tenían links "Condiciones del servicio" y "Política de privacidad" a `#` (páginas que no existen): se sacaron.
- El editor de recetas tenía un botón deshabilitado "Guardar como borrador" (un "próximamente"): se sacó.
- Toast del inventario: un aviso nuevo se ocultaba antes de tiempo por el timer del anterior, y el timer no se cancelaba al salir de la página.
- Código sin uso: 8 funciones de servicio que nadie llamaba (`getImagesByRecipe`, `getIngredientById`, `getIngredientCategoryById`, `getRecipeIngredientsByRecipe`, `getRoleById`, `getStepsByRecipe`, `getUserRecipe`, `updateUserRecipe`), `RECIPE_DIFFICULTIES`, `$color-pantry-warning`, clases CSS sin uso en 7 hojas (había un `&-error` repetido dos veces seguidas) y `export` de constantes que solo se usan en su archivo. Un ternario con las dos ramas iguales en `ReviewModal`.
- Comentarios que seguían diciendo "un 404 = lista vacía" (desde el #28 los listados responden `200 []`) y un placeholder con "(opcional)".

### Verificación

- Frontend: `npx eslint src --report-unused-disable-directives` sin errores y `npm run build` OK, sin advertencias.
- Backend: `npx tsc --noEmit` sin errores.
- Con el backend levantado (base local con el seed, puerto 3997):
  - `GET /api/feed/top-recipes?days=30&limit=5` **sin token** → 200 con 5 recetas.
  - `juanperez`: `/follow/followers` y `/follow/following` → 200 con 3 personas cada una (coinciden con los contadores de `GET /follow`); usuario inexistente → 404; sin token → 401; id inválido → 422.
  - Contraseña actual incorrecta → **400** `{ errors: [{ campo: 'currentPassword' }] }` y el token sigue sirviendo (200); nueva de 1 carácter → 422. Cambio real ida y vuelta (`123456` → `nueva123` → `123456`), con login OK en cada paso: la cuenta quedó como estaba.
- Se comparó la lista de íconos usados con la de `index.html`: no falta ninguno.
- **No se probó en el navegador.** Mirar en F2: la landing con datos reales, los modales de categorías y de contraseña, la lista de seguidores, los desplegables de orden y del calendario, y el modal de editar cantidad del inventario (cambió de ancho al sacar los estilos viejos).

### Para la defensa

- "¿De dónde salen las recetas de la landing?" Del backend: el mismo ranking que el Top 10 de la home (`GET /api/feed/top-recipes`), público porque no depende del usuario.
- "¿Por qué la contraseña incorrecta es 400 y no 401?" Porque 401 significa "no estás autenticado" (token inválido) y el front cierra la sesión al recibirlo; acá el token es válido, lo que está mal es un dato del formulario.
- "¿Dónde están los modelos?" En `models/` de cada feature: factory functions que los servicios usan para mapear la respuesta cruda.

---

## 09/10/2026 — Velocidad al navegar y mensaje de registro

**Rama:** `task/Correcciones-Front-Back`

### Problema

Al navegar, la mayoría de las pantallas "quedaban estáticas" un rato antes de cambiar, sin
ningún loader. Además se pidió revisar que el registro avise que salió bien y ofrezca pasar al
login.

### Diagnóstico (medido, no supuesto)

- **Backend:** 4–60 ms por pedido (login, feed, recetas, inventario, búsqueda, donaciones). No
  era el problema.
- **Navegador** (Chrome headless manejado por el protocolo de DevTools, haciendo clic en la
  sidebar como un usuario): con Vite recién arrancado, la **primera** visita a cada pantalla
  esperaba a que Vite compilara sus hojas SASS (~300–480 ms cada una): el perfil tardaba
  650 ms y la landing 1,8 s. Durante ese tiempo no había ningún indicador porque React
  Router navega como **transición** (deja la pantalla anterior hasta que la nueva está lista)
  y el `<Suspense>` solo muestra su pantalla de carga la primera vez.
- Cada GET llevaba `Content-Type: application/json` sin tener body, y ningún preflight CORS
  se guardaba (el navegador repetía el `OPTIONS` antes de cada pedido con token).

### Cambios

| Qué | Dónde |
|---|---|
| Las funciones que descargan cada página pasaron a `app/pageLoaders.js`. `lazyPage()` (en lugar de `lazy()`) cuenta la descarga como un pedido en curso: si tarda más de 400 ms aparece el loader global ("Cargando…"). | `pageLoaders.js`, `App.jsx` |
| **Precarga:** al entrar, `UserLayout` descarga en segundo plano (cuando el navegador está libre) el código de todas las secciones del usuario: navegar entre ellas ya no espera descargas. | `UserLayout.jsx` |
| `LoadingScreen` avisa al tracker que ya hay un loader en pantalla (como `LoadingState`), para que no aparezcan dos. | `LoadingScreen.jsx` |
| `server.warmup` en Vite: compila todas las páginas (y `critical.scss`) al arrancar `npm run dev`, no en el primer clic. Solo afecta al desarrollo. | `vite.config.js` |
| `apiFetch` manda `Content-Type: application/json` solo si hay un body JSON. | `apiFetch.js` |
| CORS con `maxAge: 600`: el navegador guarda 10 min la respuesta del preflight. | `backend/src/app.ts` |
| Registro: el mensaje de éxito ahora dice **"¡Registro exitoso!"** ("Tu cuenta @usuario ya está lista") con el botón "Iniciar sesión", que abre el login con el usuario ya cargado. El flujo ya existía; solo cambió el texto. | `RegisterSuccess.jsx` |

### Verificación

- `npx eslint src` sin errores, `npm run build` OK, `npx tsc --noEmit` sin errores.
- Misma medición en Chrome con Vite en frío (`--force`), antes → después:
  - primera visita al perfil: 650 ms → **98 ms**; landing: 1,8 s → **1,1 s** (incluye el
    arranque del cliente de Vite);
  - inventario, mis recetas, guardadas, donaciones e inicio: aparecen en **30–130 ms** y con
    sus datos en **85–320 ms**; desde la segunda sección ya no se descarga ningún archivo al
    hacer clic (llegan precargadas).
- Registro probado en Chrome de punta a punta: enviar vacío muestra los errores debajo de
  cada campo; con datos válidos aparece "¡Registro exitoso!"; el botón abre el login con el
  usuario cargado; registrar el mismo usuario otra vez muestra "El nombre de usuario ya está
  en uso." debajo del campo. El usuario de prueba se borró de la base al terminar.
- En desarrollo cada pedido aparece dos veces en la pestaña Network: es `StrictMode`, que
  monta los efectos dos veces a propósito solo en desarrollo; en el build no pasa.

### Para la defensa

- "¿Por qué no se veía un loader al navegar?" React Router hace el cambio de página como
  transición: React mantiene la pantalla anterior hasta tener lista la nueva. Ahora la
  descarga de la página cuenta para el loader global y, además, las páginas se precargan.
- "¿Qué es el preflight?" Un `OPTIONS` que el navegador manda antes de un pedido a otro
  origen con headers especiales (el token); con `maxAge` se guarda y no se repite cada vez.

---

## 09/10/2026 — Velocidad del panel admin y análisis enfocado en la AD

**Rama:** `task/Correcciones-Front-Back`

### Problema

El panel admin no tenía las optimizaciones de la parte de usuario. Medido en Chrome headless
(clic en la sidebar como `admindemo`):

- Entrar a `/admin` bajaba el código de las 5 secciones (173 archivos en desarrollo; en
  producción un solo archivo de 69 KB) aunque solo se viera el dashboard.
- Cada cambio de sección desmontaba la anterior: al volver, se pedía todo de nuevo y aparecía
  otra vez el "Cargando..." (volver al dashboard: 130 ms, con el resumen tardando 150–200 ms).
- Las dos secciones de categorías pedían el resumen completo del dashboard (10 conteos y los
  datos de los gráficos) solo para mostrar un total.

El backend no era el problema: cada pedido del panel tarda 3–10 ms.

### Cambios

| Qué | Dónde |
|---|---|
| Cada sección es un archivo aparte (`lazyPage`); al entrar se baja solo la abierta y las demás se precargan en segundo plano. En producción, entrar al panel baja ~26 KB (AdminPage 6 KB + dashboard 19 KB) en vez de 69 KB. | `AdminPage.jsx` |
| Las secciones ya abiertas quedan montadas pero ocultas (`hidden`): al volver se ven al instante, conservando la búsqueda y la página de su tabla. Hook nuevo `useRefreshOnReturn(isActive, refresh)`: cuando una sección vuelve a verse, actualiza sus datos sin mostrar "Cargando..." (así un ingrediente o una categoría creados en otra sección aparecen igual). | `core/hooks/useRefreshOnReturn.js`, las 5 secciones, `RolePage`, `useAdminUsers` (`refreshPage`), hooks de ingredientes y categorías (`refresh`) |
| El resumen se pide **una sola vez** en `AdminPage` y se comparte: el dashboard lo recibe por props y las categorías reciben el total de recetas / ingredientes. Se refresca en silencio al cambiar de sección. Los hooks de categorías ya no lo piden. | `AdminPage.jsx`, `AdminDashboardSection`, `useAdmin*Categories` |
| Las secciones del admin se suman al `warmup` de Vite. | `vite.config.js` |
| `analisis-estado-proyecto.md` reescrito: solo lo que falta para la AD según la cátedra, el plan para seguir (fecha, decisiones en grupo, reparto) y el detalle de cada entregable. Se sacó lo ya resuelto (donaciones, mejoras de back y front, preparación de la defensa, que está en la guía). | `docs/` |

### Verificación

- `npx eslint src` sin errores y `npm run build` OK.
- Misma medición antes → después (Vite en desarrollo):
  - entrar a `/admin`: 173 → **127** archivos;
  - volver a una sección ya abierta: **36–75 ms**, sin "Cargando..." y con un solo pedido en
    segundo plano (antes 130 ms, con loader y todo de nuevo);
  - las secciones de categorías ya no piden su propio resumen.
- Al principio el chequeo de "primera vez" con una ref hacía un pedido de más en desarrollo
  (`StrictMode` ejecuta los efectos dos veces): se cambió por comparar con el valor anterior.

### Para la defensa

- "¿Por qué el panel no vuelve a cargar al cambiar de sección?" Las secciones ya abiertas
  quedan montadas y ocultas; al volver se actualizan en segundo plano (patrón *stale while
  revalidate*: se muestra lo que había y se pone al día sin bloquear).
- "¿Cuántas veces se pide el resumen?" Una por cambio de sección, desde `AdminPage`, y lo
  comparten las secciones que lo usan.
