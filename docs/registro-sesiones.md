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
