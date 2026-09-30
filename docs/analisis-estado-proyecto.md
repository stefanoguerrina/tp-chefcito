# Análisis del estado del proyecto — Chefcito

> **Última actualización:** 29/09/2026 · **Rama analizada:** `task/fixes-post-feedback`, sobre
> `develop` (commit `b29c500`: ya incluye el PR #21 con Chefcito Bot y el PR #22 con "Seguir" y la
> home nueva) **más los cambios de esa rama**, que corrigen el feedback del profesor (ver
> [Registro de avances](#registro-de-avances)).
> **Objetivo:** saber qué falta para la **Aprobación Directa (AD)**, qué hay que mejorar y cómo
> repartirnos el trabajo. Se compara lo que pide la cátedra ([README.md](README.md),
> [FAQ.md](FAQ.md), [docs.md](docs.md)) y lo que prometimos en la [propuesta](proposal.md) contra
> lo que hay hoy en el código. Este documento se va actualizando a medida que avanzamos:
> lo resuelto queda marcado con ✅ y con la fecha en que se hizo.

**Cómo leer las prioridades**

| Marca | Significado |
|:-:|---|
| 🔴 | Bloquea la **regularidad** o lo prometido en la propuesta. Va primero. |
| 🟠 | Obligatorio para la **Aprobación Directa**. |
| 🟡 | Mejora de calidad: nos pueden preguntar o bajar nota en la defensa. |
| ⚪ | Opcional / prolijidad. |
| ✅ | Resuelto (con la fecha). |

---

## Registro de avances

Qué se fue resolviendo desde el primer análisis (28/09/2026, commit `f3080a3`).

| Fecha | Dónde | Qué se hizo | Cubre |
|---|---|---|---|
| 28/09 | PR #18 (`task/Frontend-Upgrades`, ya en `develop`) | Editor de recetas partido en secciones propias; foto de portada del perfil (`coverUrl`); fix de UI al confirmar la cantidad de un ingrediente; `onDelete: Restrict` en `ingredient` → `inventory`/`recipeingredient`; paleta clara/oscura ajustada. | 7.7 (parcial) |
| 29/09 | `task/Frontend-Updates` | **Buscador en la home:** barra de búsqueda con panel de resultados rápidos (categorías, recetas y usuarios mientras se escribe, con debounce de 300 ms). Reemplaza las 3 tarjetas de acceso rápido (dos decían *Próximamente*). Backend: feature nueva `search` con `GET /api/search?q=`. | 7.1 (parcial) |
| 29/09 | `task/Frontend-Updates` | **Página de resultados `/buscar?q=`:** secciones "Categorías / Recetas / Perfiles sugeridos" con cards "+N más" y banner de Chefcito Bot (el botón queda visible pero sin acción, *Próximamente*). | — |
| 29/09 | `task/Frontend-Updates` | **Listados completos con filtros** `/buscar/recetas`, `/buscar/categorias`, `/buscar/usuarios`: filtros en la URL, orden, paginación de 12, vista cuadrícula/lista. Recetas filtra por **categoría, valoración mínima, tiempo e ingredientes**. Backend: `GET /api/search/recipes`, `/categories`, `/users`. | **5.1** ✅, 6.6 (parcial), 6.9 y 6.10 (en los endpoints nuevos) |
| 29/09 | `task/Frontend-Updates` | **Card de perfil** (`UserProfileCard`) en `/buscar/usuarios`: foto grande, nombre, @usuario y "Ver perfil", adaptada del diseño "Animated Profile Card" (sin Tailwind ni lucide-react). | — |
| 29/09 | `task/Frontend-Updates` | **"Recetas guardadas" con filtros:** `/guardadas` reutiliza el listado de recetas del buscador (`savedOnly`): tiempo, valoración, categoría, ingredientes, "Inventario", buscador por nombre, orden (por defecto "Guardadas recientemente"), vista y paginación. Backend: `GET /api/search/recipes?savedOnly=true&sort=saved`. | 5.3 (también sobre las guardadas) |
| 29/09 | `task/Frontend-Updates` | **Filtro "Inventario"** (se llamó "Con mi despensa" al principio) en el listado de recetas: cruza el inventario del usuario con los ingredientes de cada receta (considera cantidades); primero las que se pueden hacer completas, después las más cercanas, con "Tenés 2 de 3 · Te falta: …". Lógica pura en `pantryMatchService.ts`. | **5.3** ✅ |
| 29/09 | `task/Frontend-Updates` | **Perfil en 3 secciones con scroll reveal** (`ScrollReveal` en core): portada + métricas del usuario (valoración promedio, recetas por mes, categorías); las 3 recetas mejor valoradas en abanico; encajan por pantallas (scroll snap) con avisos de sección siguiente y la galería completa (hasta 5 por fila, alturas parejas) con buscador, "Inventario", categoría y orden (filtros en la URL). En la tarjeta del perfil, "Editar" y "Compartir" pasan a íconos y el perfil ajeno suma "Seguir" (sin funcionalidad todavía, avisa "Próximamente"); se quitan "Preferencias y dieta", "Borradores" y "Ver recetas". Backend: `GET /api/search/recipes?authorId=`. | 5.3 (también en el perfil) |
| 29/09 | `task/Frontend-Updates` | **Ajustes visuales generales:** degradé verde de la marca compartido (`abstracts/_gradients.scss`) en el logo, el ítem activo de la sidebar, los botones seleccionados y el de "receta guardada"; el ítem de la cuenta en la sidebar marca el perfil con un aro en el avatar; valoración de las cards con **5 estrellas** que se rellenan hasta el promedio (`RatingStars` en core); "Abrir receta" → "Ver receta"; barra de búsqueda flotante, alineada con el logo, con un difuminado oscuro al scrollear. Datos de demo: `juanperez` tiene inventario suficiente para 2 recetas completas. | — |
| 29/09 | PR #22 (`task/front-and-back-updates`, ya en `develop`) | **"Seguir" a otros usuarios.** Tabla nueva `follow` (PK `idFollower + idFollowed`, borrado en cascada) y feature `follow` en el backend: `GET` / `POST` / `DELETE /api/users/:userId/follow` (no se puede seguir a uno mismo ni dos veces; quien sigue sale del token). El botón "Seguir / Siguiendo" del perfil ajeno ya funciona. ⚠️ **Cambia el esquema: hay que correr `npx prisma db push`.** | 7.1 (Seguir ✅) |
| 29/09 | PR #22 (`task/front-and-back-updates`, ya en `develop`) | **Home nueva ("Inicio")**, en 3 pantallas con el mismo esquema del perfil (scroll reveal, encaje por pantallas y avisos con flecha): **Recetas por amigos** (una card grande + hasta 3 en formato lista), **Top 10 de la semana** (carrusel del #1 al #10 con las mejor valoradas de los últimos 7 días; el #1 con borde degradé) y **Reseñas de amigos**. "Amigos" = a quienes seguís. Backend: feature `feed` con `GET /api/feed/friends/recipes`, `/friends/reviews` y `/top-recipes?days=&limit=`. Reemplaza la grilla "Recetas de la comunidad" (todas las recetas de otros): el carrusel viejo (`RecipeCarouselSection`, `HomeRecipeCard`) se borró. | **Adicional "top 10 en un plazo" ✅**, 6.6 (la home ya no hace N+1), 7.9 |
| 29/09 | PR #22 (`task/front-and-back-updates`, ya en `develop`) | **Perfil, métricas:** la tarjeta grande pasa a "Recetas publicadas" (número grande que se adapta al espacio) con la valoración promedio del usuario, y las chicas son Seguidores, Seguidos y Categoría principal (se quitan "Recetas por mes" y "Categorías"). Las métricas se ven también en perfiles sin recetas. La etiqueta de especialidad usa el degradé de la marca. | — |
| 29/09 | PR #22 (`task/front-and-back-updates`, ya en `develop`) | **Piezas compartidas y datos de demo.** En `core`: `UserAvatar`, `RatingBadge`, `SaveRecipeButton`, `RecipeHoverOverlay`, hook `useDragScroll` y mixin `gradient-text`; `RecipeCard` suma la disposición `horizontal` (foto **cuadrada de tamaño fijo**: también corrige la vista "lista" de Recetas guardadas y de los listados, donde la foto cambiaba de proporción según el texto). Backend: `core/middleware/validationMiddleware.ts` compartido (lo usan `follow` y `feed`). `demo-seed.sql` suma la **sección 8** (seguidos + reseñas de la última semana, se puede correr sola sobre una base ya cargada) y `guia-profesor.md` explica cómo probar el inicio y "Seguir". | 6.4 (parcial) |
| 29/09 | `task/fixes-post-feedback` | **Menos llamadas al backend (feedback del profe: "muchísimas llamadas al entrar al tablero" y "llamadas repetidas").** (1) **Sin N+1:** `GET /api/recipes` (y `?userId=`) y la búsqueda rápida `GET /api/search` devuelven `averageRating` y `reviewCount` de cada receta con **una** consulta `review.groupBy`; se borró `useRecipeReviewStats` y ya no se piden las reseñas receta por receta en el dashboard, el perfil, "Mis recetas" (ahí ni se mostraban) y "Recetas sugeridas". Nuevo `GET /api/roles/users` (admin): los roles de todos los usuarios en un pedido, en vez de uno por usuario. (2) **Carga por pantalla:** el panel admin solo monta la sección activa (`AdminDashboardSection`, `AdminIngredientsSection`, etc. + `AdminSectionLayout`): al entrar al tablero ya no se piden también ingredientes y categorías (antes `/recipes` salía 3 veces, `/ingredients` 3, `/ingredient-categories` 3 y `/categories` 2). En la home, "Top 10" y "Reseñas de amigos" se piden recién al llegar a su pantalla, igual que la galería del perfil (hook `useHasBeenVisible` en `core`). Resultado en el tablero: de 7 + 7 de otras secciones + 1 por usuario + 1 por receta, a **8 pedidos fijos**. | **6.6** ✅, 7.7 (`AdminPage` 286 → 78 líneas) |
| 29/09 | PR #21 (`asistente`, ya en `develop`) | **Chefcito Bot** (T-5.1/T-5.2): chat con IA (Google Gemini) que sugiere recetas con el inventario del usuario. Se abre desde el banner del buscador y de los listados de recetas. Backend: `POST /api/assistant/chat`. Detalle y pruebas en [asistente-ia.md](asistente-ia.md). | **Adicional "ChatBot IA"** ✅, 7.1 (asistente) |
| 29/09 | `task/fixes-post-feedback` | **Usuario logueado en un solo lugar:** `app/CurrentUserContext.jsx` pide el usuario una vez por sesión; las dos sidebars y el perfil propio lo leen de ahí (antes cada uno lo pedía por su cuenta y `/perfil` lo pedía dos veces). Al editar el perfil, la sidebar se actualiza sola: se borró el evento global `PROFILE_UPDATED_EVENT`. | Feedback ("llamadas repetidas") |
| 29/09 | `task/fixes-post-feedback` | **Acentos rotos (mojibake, feedback del profesor):** `demo-seed.sql` no le decía a MySQL que venía en UTF-8 y, cargado con un cliente en latin1, guardaba "á" como "Ã¡". Se agregó `SET NAMES utf8mb4;` al principio del archivo y de la sección 8. Probado en una base temporal con un cliente en latin1: 29 filas rotas con el seed viejo, 0 con el nuevo. **Una base ya cargada con el problema hay que volver a crearla** (ver [guía](guia-profesor.md)). | Feedback (acentos) |
| 29/09 | `task/fixes-post-feedback` | **Campos obligatorios en todos los formularios (feedback del profesor):** asterisco rojo en el label de cada obligatorio, nota "Los campos marcados con * son obligatorios" y el error debajo de cada campo con borde rojo, en vez de un mensaje general. Los campos sin `*` son opcionales (no se aclara "(opcional)"). Piezas compartidas en `core` (`RequiredMark`, `RequiredFieldsNote`, `FieldError`) + `shared/utils/fieldAria.js`. Cubre registro, login, alta de usuario (admin), editar perfil, editor de recetas (que además baja solo hasta el primer error), inventario, ingrediente, valores nutricionales, categorías, roles y la reseña. Backend: los 409 de usuario/email repetido indican el campo. | Feedback (validación) |
| 29/09 | `task/fixes-post-feedback` | **Registro:** campos de a dos por fila desde tablet (entra en la pantalla sin scrollear) y, al crear la cuenta, el mismo modal muestra "¡Tu cuenta está lista!" con el botón "Iniciar sesión", que abre el login con el usuario ya cargado. Se corrigió que un modal más alto que la pantalla quedaba cortado arriba. | Feedback (validación) |
| 29/09 | `task/fixes-post-feedback` | **Editar reseña:** la reseña propia suma el botón "Editar", que abre el mismo `ReviewModal` precargado y guarda con `PATCH`. | **5.2** ✅ |
| 30/09 | `task/Admin-Redesign` | **Panel de administrador rediseñado.** (1) **Sin botón "Actualizar"** en ninguna sección (feedback del profesor: no es una feature real): cada acción actualiza la lista local, y al fallar una carga queda el "Reintentar" de `ErrorState`. (2) **Usuarios:** se borró la pantalla vieja (`SearchUsersForm`, `CreateUserForm` y sus hooks); el alta se hace desde la tabla del dashboard con un modal que reutiliza los campos y la validación del registro (`RegisterFields` + `useRegisterForm({ submitForm })`) más la opción "Darle rol de administrador". El alta por admin ahora también asigna el rol "Usuario" (antes quedaba "Sin rol asignado"). La tabla muestra la **foto de perfil** de cada usuario (antes solo iniciales) y el pie de la sidebar la del admin. (3) **Baja de usuario → sus recetas se ocultan** sin columna nueva: las consultas de recetas filtran `user.deletedAt: null` (ya lo hacían búsqueda y feed; se sumaron `GET /recipes`, `/recipes/:id` y las guardadas). Al reactivarlo vuelven solas; el admin ve igual cuántas tiene (`_count.recipe`). (4) **Roles:** el borrado ya se bloqueaba con usuarios asignados; ahora la tabla muestra cuántos usuarios tiene cada rol, deshabilita "Eliminar" y el 409 dice cuántos son. (5) **Ingredientes:** foto propia (multer, `PATCH`/`DELETE /ingredients/:id/image`, mismo esquema que el avatar), unidad de medida elegida de una **lista fija** (ud., gr, kg, ml, L, cda., ...), categorías con chips + el buscador del editor de recetas, descripción al final, y **valores nutricionales en el mismo formulario** (paso 2): nutrientes de una lista (Calorías, Proteínas, Carbohidratos, Grasas totales, ...), porción de referencia común y su unidad fija = la del ingrediente; se guardan junto con el ingrediente en **un solo pedido**. La tabla suma la miniatura y la columna "Valores nutricionales". Se borró `NutritionalValuePanel` (los endpoints anidados de valores nutricionales siguen). Fix: las fotos de ingredientes del inventario no resolvían la URL del backend. | Feedback, 7.7 (parcial) |
| 30/09 | `task/Admin-Redesign` | **Menos llamadas en el panel admin (feedback del profesor).** Nueva feature `admin` en el backend: `GET /api/admin/summary` devuelve todas las cifras del dashboard ya contadas en la base (`count`/`groupBy`) y `GET /api/admin/users` una **página de 6 usuarios** (filtro activos/inactivos y búsqueda por usuario, nombre o email en el mismo pedido), con roles, cantidad de recetas y valoraciones. El dashboard pasó de 8 pedidos que traían **todos** los usuarios, todas las recetas con sus relaciones, etc., a **2 pedidos livianos**; cambiar de página o de filtro pide solo esa página y la búsqueda espera a que se deje de escribir. Ingredientes y categorías traen su conteo con `_count` (ingredientes por categoría, recetas por categoría y por ingrediente, sin las de usuarios dados de baja): ninguna sección pide ya todas las recetas o todos los ingredientes solo para contar. Además: decimales con coma o punto en valores nutricionales, inventario (que ahora acepta decimales) e ingredientes de receta (se guardan siempre con punto); la nota "Los campos marcados con * son obligatorios" aparece solo después de un envío con errores, en todos los formularios; `DropdownSelect` en `core` (desplegable sin barra de scroll); gramos = `gr`; la sección activa de la sidebar del admin usa el verde de la marca. | **Feedback (llamadas)**, 6.9 (parcial: `/admin/users` responde 200 con lista vacía) |
| 30/09 | `task/recipe-nutrition` | **Valores nutricionales en las recetas.** El detalle de receta muestra, al lado de los ingredientes (la tarjeta pasó a la mitad del ancho), la tabla **"Valores nutricionales" por porción**: cada ingrediente aporta (cantidad de la receta / porción de referencia) × valor, y se divide por las **porciones** que rinde la receta. Lo calcula el backend con funciones puras ([recipeNutritionService.ts](../backend/src/features/recipe/services/recipeNutritionService.ts), buenas para un test unitario): si un ingrediente no tiene cantidad o tabla nutricional se avisa "No incluye …", y un valor al que le faltan datos lleva `*` ("puede ser mayor"). Columna nueva **`recipe.servings`** (campo "Porciones" en el editor, chip "4 porciones" en el detalle). Se sacó el multiplicador de cantidades (×1, ×2…) de Ingredientes. ⚠️ **Cambia el esquema: `npx prisma db push`** y cargar la **sección 9** de `demo-seed.sql` (tablas nutricionales completas de los 18 ingredientes y porciones de las 10 recetas; se puede correr sola). | **Adicional "listado por necesidades nutricionales" ✅** (con la fila de abajo) |
| 30/09 | `task/recipe-nutrition` | **Listado de recetas filtrado por necesidades nutricionales** (alcance adicional de la propuesta): en `/buscar/recetas` (y "Recetas guardadas"), grupo "Necesidades nutricionales" con alta en proteínas (≥ 20 gr), baja en calorías (≤ 400 kcal), en carbohidratos (≤ 20 gr), en grasas (≤ 10 gr), alta en fibra (≥ 5 gr) y baja en sodio (≤ 140 mg), todo **por porción** y combinables. Solo entran recetas que indican sus porciones y tienen el dato de todos sus ingredientes; cada card muestra el valor por porción de los nutrientes filtrados. Backend: `GET /api/search/recipes?nutrition=high-protein,low-fat`; las tablas nutricionales se consultan **solo** si el filtro está activo. | Adicional ✅ |
| 30/09 | `task/recipe-nutrition` | **Menos llamadas en el detalle de receta (feedback del profesor).** `GET /api/recipes/:id` ahora trae en la misma respuesta los valores nutricionales ya calculados y, si hay sesión (`readOptionalToken`: la ruta sigue siendo pública), `viewer: { isSaved, pantryIngredientIds }`. Antes, al entrar a una receta se pedían además **todo el inventario** del usuario (solo para las etiquetas "Despensa") y **todas sus recetas guardadas** (solo para saber si esta lo estaba): de 4 pedidos a **2** (receta + reseñas). | Feedback (llamadas) |
| 30/09 | `task/recipe-nutrition` | **Fix: `schema.prisma` había vuelto a una versión vieja** en el commit `d204f6f` (rediseño de la landing), probablemente por un `prisma db pull` contra una base desactualizada: faltaban la tabla `follow`, `User.coverUrl` y `User.createdAt`, los `onDelete: Restrict` de ingredientes y el `VarChar(500)` de `image.imageUrl`. Con ese esquema, `npx prisma db push` **borraba la tabla `follow` y las portadas** y `npm run build` no compilaba. Se restauró la versión anterior a ese commit (más `servings`). **No usar `prisma db pull`**: el esquema del repo es la fuente de verdad. | 6.14 |
| 29/09 | `task/fixes-post-feedback` | **Varios del análisis:** `PORT` y `CORS_ORIGINS` salen del `.env` (con los valores de siempre por defecto); scripts `build` y `start` en el backend; `index.html` en español con `meta description`; se sacaron "Explorar" y "Notificaciones" de la sidebar (decisión del equipo: no se van a hacer). | **6.2** ✅, 6.1 (parcial), **7.8** ✅, 7.1 (parcial) |

---

## 1. Resumen ejecutivo

**Lo que está bien:** la base técnica es sólida. Backend en capas (router → middleware →
controller → service → repository) con Prisma + MySQL, validación con `express-validator`,
login JWT con 2 niveles (usuario/admin), rutas protegidas en back y front, frontend React con
rutas protegidas (`ProtectedRoute`), manejo de errores unificado (`apiFetch` + `ApiError`),
estilos SASS mobile-first con los 3 breakpoints. Hay 16 features en el backend y casi todos los
CRUDs funcionan de punta a punta. `npm run lint`, `npm run build` (front) y `tsc --noEmit` (back)
pasan sin errores (verificado el 29/09).

**Lo que falta para AD, en una lista:**

1. ✅ ~~**Listados con filtro que prometimos en la propuesta**~~ (29/09): `/buscar/recetas`
   filtra por categoría y por valoración (y además por tiempo e ingredientes). Ver 5.1.
2. ✅ ~~**Editar una reseña desde la UI**~~ (29/09): botón "Editar" en la reseña propia. Ver 5.2.
3. ✅ ~~**CU "Consultar recetas según ingredientes disponibles"**~~ (29/09): filtro
   "Inventario" del listado de recetas. Ver 5.3.
4. 🟠 **CU / CRUD "Donaciones"** (T-4.3): la tabla existe en el schema, pero no hay backend
   ni frontend (los botones "Donar" muestran *Próximamente*).
5. 🟠 **Tests**: no hay ninguno. Faltan 4 tests de backend (1 por integrante) + 1 de
   integración, 1 test unitario de componente y 1 test E2E.
6. 🟠 **Documentación de la API**: no existe (el [Anexo A](#anexo-a--inventario-de-endpoints-actual)
   está al día y sirve de punto de partida).
7. 🟠 **Deploy** (links + credenciales): no existe. Ya están los scripts `build`/`start` y el
   puerto/CORS por `.env` (29/09, ver 6.1 y 6.2).
8. 🔴 **Documentación que pide la cátedra**: falta el `README.md` en la raíz, `docs/README.md`
   hoy es la consigna (no nuestro índice), faltan minutas, tracking de tareas/issues,
   metodología y links a los PRs en la propuesta.
9. 🟠 **Video demo** + evidencia de ejecución de tests.
10. 🟡 Varias mejoras de código (sección 6 y 7) para llegar prolijos a la defensa.
11. ✅ ~~**Commitear `task/Frontend-Updates` y abrir el PR a `develop`**~~: ya está mergeado
    (PR #19, `5e6c3e5`).
12. ✅ ~~**Commitear "Seguir" + home nueva**~~: ya está mergeado (PR #22, `b29c500`). Recordatorio
    para el equipo: correr `npx prisma db push` (tabla `follow`) y cargar la sección 8 de `demo-seed.sql`.
13. 🟠 **Tests para lo nuevo** (`followService`, `feedService.getTopRecipes`, `formatRelativeTime`):
    ver 9. Y 🟡 recorrer la home y el perfil en celular/tablet y modo claro (ver 5.6).
14. 🟠 **Actualizar la propuesta y el DER** con la tabla `follow` y el alcance nuevo (ver 8.3).
15. ✅ **Feedback del profesor** (29/09, `task/fixes-post-feedback`): menos llamadas al backend
    (carga por pantalla, sin N+1 ni pedidos repetidos), acentos rotos del seed y campos
    obligatorios con asterisco y error por campo. Ver el [registro de avances](#registro-de-avances).

---

## 2. Calendario y plan sugerido

Fechas de la cátedra: **1ª entrega Regularidad/AD 12/10–16/10**, recuperatorio 26/10–30/10,
última instancia 9/11–13/11. Hoy es 29/09: **quedan 2 semanas** para la primera ventana.

| Semana | Objetivo | Qué entra | Estado |
|---|---|---|---|
| **28/09 – 04/10** | Asegurar regularidad | ~~Listado con filtros (categoría + valoración)~~ ✅, ~~editar reseña~~ ✅, README raíz + índice de docs, propuesta actualizada, tablero de tareas + minutas, `.env.example`. ~~Arrancar T-4.2~~ ✅ (hecho completo). Arrancar T-4.3 y la configuración de tests. | 🔄 En curso |
| **05/10 – 11/10** | Completar AD | Donaciones, ~~recetas según inventario~~ ✅, todos los tests, documentación de la API, deploy. | ⏳ |
| **12/10 – 16/10** | Entrega | Video, evidencia de tests, links de deploy + credenciales, formulario de entrega, coordinar defensa. | ⏳ |
| 26/10 – 30/10 | Plan B | Si no llegamos con AD completa, se entrega acá (mejor llegar bien que llegar a medias). | — |

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
| Dependencias en `package.json` | Reg | ✅ | Sí. Ya están `build` y `start` (29/09); falta `test` (ver 6.1). |
| 1 test automatizado por integrante | AD | ❌ | `npm test` es un placeholder. |
| 1 test de integración | AD | ❌ | — |
| Login propio + 2 niveles de acceso | AD | ✅ | JWT + bcrypt, roles Usuario/Admin |
| Rutas protegidas por nivel | AD | ✅ | `verifyToken`, `verifyAdmin`, `verifyOwnerOrAdmin` |
| Ambientes (.env) | AD | ⚠️ | Hay `.env` y desde el 29/09 `PORT` y `CORS_ORIGINS` salen de ahí ([app.ts](../backend/src/app.ts)), pero no hay `.env.example` ni ambiente de test/producción. |

### 3.2 Frontend

| Requisito | Nivel | Estado | Evidencia / qué falta |
|---|:-:|:-:|---|
| Framework de frontend | Reg | ✅ | React 19 + Vite. La cátedra da soporte a Angular: **hay que declararlo en la propuesta** (FAQ). |
| HTML5 | Reg | ✅ | `index.html` con `lang="es"` y `meta description` (29/09). |
| CSS con metodología / preprocesador | Reg | ✅ | SASS con variables y mixins |
| Mobile-first + 3 breakpoints | Reg | ✅ | `respond-to(sm\|md\|lg)` en [_breakpoints.scss](../frontend/src/styles/abstracts/_breakpoints.scss). Revisar a mano cada pantalla en 375 / 768 / 1280 px antes de entregar (incluidas las 3 pantallas nuevas del buscador, **la home nueva con su carrusel y las métricas del perfil**). |
| UX sin manual | Reg | ⚠️ | Mejoró (29/09): el asistente IA funciona, se sacaron "Explorar" y "Notificaciones" de la sidebar y los formularios marcan los obligatorios con `*` y muestran el error debajo de cada campo. Quedan: **Donar** (detalle de receta y perfil) y datos falsos en la landing (ver 7.1 y 7.2). |
| Eventos, errores amigables, reactividad, input/output property | Reg | ✅ | props (input), callbacks `onX` (output), `AlertModal`/`ErrorState` |
| Al menos un servicio | Reg | ✅ | Un `services/` por feature sobre `apiFetch` |
| Modelos con clases/tipos custom | Reg | ⚠️ | Hay modelos en recipe, review, inventory, auth, admin, userRecipe, landing, search, **follow y feed**, y en user solo el de métricas del perfil (`profileMetricsModel.js`); **faltan** el del usuario en sí, category, ingredient, role, etc. (ver 7.6) |
| Patrón de diseño OO (si es posible) | Reg | ✅ | `ApiError extends Error`, Singleton de Prisma, Repository. Preparar cómo explicarlos. |
| 1 test unitario de componente | AD | ❌ | — |
| 1 test E2E | AD | ❌ | — |
| Login + acceso según nivel | AD | ✅ | `ProtectedRoute allow="guest\|user\|admin"` |
| Ambientes (.env) | AD | ⚠️ | `VITE_API_BASE_URL` en `.env`; falta `.env.example` y `.env.production`. |

### 3.3 Requisitos funcionales (4 integrantes)

| Requisito | Nivel | Cuántos | Estado |
|---|:-:|:-:|---|
| CRUD simple por integrante | Reg | 4 | ✅ Usuario, Categoría de receta, Categoría de ingrediente, Rol (+ otros) |
| CRUD dependiente c/2 integrantes | Reg | 2 | ✅ Ingrediente y Valoración (editar reseña desde el 29/09, ver 5.2) |
| Listado con filtro c/2 integrantes | Reg | 2 | ✅ (29/09) `/buscar/recetas` (por categoría, valoración, tiempo, ingredientes e inventario), `/buscar/categorias` y `/buscar/usuarios` (con/sin recetas). Además la galería del perfil y las tablas de admin. |
| Detalle al seleccionar (request al back, ≥2 clases) | Reg | — | ✅ `/recetas/:id` muestra receta + creador + ingredientes + pasos + reseñas. Todas las cards de los listados de búsqueda llevan ahí (o al perfil `/usuarios/:id`). |
| CU/Epic c/2 integrantes | Reg | 2 | ✅ Crear y publicar recetas · Reseñar recetas |
| CRUDs de **todas** las clases de negocio | AD | — | ❌ Falta Donación (ver 5.4) |
| 1 CU por integrante, ≥2 relacionados | AD | 4 | ⚠️ **3 de 4** (falta "donaciones"). "Recetas según ingredientes" usa lo que carga Inventario y lo que se carga al Crear recetas → cumple "≥2 relacionados". **Nuevo (29/09):** "Seguir cocineros y ver su actividad" (5.6) es un CU extra que además se alimenta de los otros dos (recetas publicadas y reseñas): sirve de respaldo para "≥2 relacionados" y suma como alcance adicional. Falta decidir quién lo defiende. |

### 3.4 Entregas y documentación ([docs.md](docs.md))

| Entregable | Reg | AD | Estado |
|---|:-:|:-:|---|
| Proposal actualizada | X | X | ⚠️ Desactualizada (ver 8.3) |
| Links a los PR | X | X | ❌ No están en la propuesta |
| Instrucciones de instalación (en el README) | X | X | ⚠️ Existe [guia-profesor.md](guia-profesor.md) pero **no hay `README.md` en la raíz** que lo enlace |
| Minutas de reunión y avance | X | X | ❌ |
| Tracking de features, bugs e issues | X | X | ⚠️ Este documento tiene un [registro de avances](#registro-de-avances), pero falta el tablero (GitHub Project) con issues y el estado en [tasks-division.md](tasks-division.md) |
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
| CRUD Valoración (dep.) | ✅ | Crear, listar, editar (29/09) y borrar desde el detalle de la receta |
| CRUD Ingrediente (dep.) | ✅ | Panel admin, con foto y valores nutricionales (entidad débil) en el mismo formulario |
| Listado recetas filtrado por categoría → detalle | ✅ | (29/09) `/buscar/recetas?categoria=ID`, o click en una categoría desde el buscador. Muestra nombre y descripción → detalle `/recetas/:id`. Mira **todas** las categorías de la receta (no solo la primera). |
| Listado recetas filtrado por valoración (con nombre del creador) → detalle | ✅ | (29/09) Filtro "Valoración" (3, 4 o 4,5 estrellas o más) y orden "Mejor puntuadas". La card muestra nombre, descripción, valoración y creador → detalle con los datos completos de la receta y del creador. |
| CU Crear y publicar recetas | ✅ | |
| CU Reseñar recetas de otros | ✅ | Impide reseñar la propia y reseñar dos veces |
| CU Consultar recetas según ingredientes disponibles | ✅ | (29/09) Filtro "Inventario" en `/buscar/recetas`, "Recetas guardadas" y el perfil (ver 5.3). |
| CU Sistema de donaciones | ❌ | T-4.3 |
| *Adicional:* listado por tiempo de preparación | ✅ | (29/09) Filtro "Tiempo de preparación" + orden "Menor tiempo". |
| *Adicional:* top 10 mejor valoradas en un plazo | ✅ | (29/09) `GET /api/feed/top-recipes?days=N&limit=10`: el promedio se calcula solo con las reseñas del plazo. La home muestra el de los últimos 7 días ("Top 10 de la semana", en carrusel) y cada card abre el detalle con los datos completos de la receta y del creador. |
| *Adicional:* filtro por necesidades nutricionales | ✅ | (30/09) Grupo "Necesidades nutricionales" en `/buscar/recetas`: alta en proteínas, baja en calorías, carbohidratos, grasas o sodio y alta en fibra, **por porción**. La card muestra nombre, descripción y el valor de esos nutrientes → detalle con la tabla de valores por porción. |
| *Adicional:* ChatBot IA | ✅ | (29/09, PR #21) Chefcito Bot sugiere recetas con el inventario del usuario (Google Gemini). Se abre desde el banner del buscador y de los listados de recetas. Ver [asistente-ia.md](asistente-ia.md). |
| **Extra no prometido y ya hecho** | ✅ | CRUD Rol + asignación a usuarios, Inventario, Valor nutricional, Pasos, Imágenes (subida real con multer), Recetas guardadas, Dashboard admin con métricas, fotos de perfil y portada, **buscador global con resultados rápidos, página de resultados y listados de categorías y perfiles**, métricas del usuario en su perfil (29/09), **seguir a otros usuarios (tabla `follow`), home con recetas y reseñas de amigos y top 10 de la semana** (29/09, ver 5.6). **Agregarlos a la propuesta**: suman como alcance adicional. |

---

## 5. Funcionalidades (detalle)

### 5.1 ✅ Listados de recetas con filtros (listados 1 y 2 de la propuesta) — 29/09

Se resolvió dentro del buscador en vez de con una página `/explorar` aparte:

- **Backend** (feature `search`): `GET /api/search/recipes` con `q`, `categoryId`, `maxTime`,
  `minTime`, `minRating`, `ingredientIds`, `pantry`, `sort` y `page`, validados con
  `express-validator` (`query(...)`). Lo que se puede filtrar en SQL va al `where` de Prisma
  (texto, categoría, tiempo, ingredientes); la valoración promedio se calcula con **una sola**
  consulta `review.groupBy` y se filtra/ordena en el service; después se piden las cards completas
  solo de las 12 recetas de la página. Un listado vacío responde `200` (no 404).
- **Frontend:** `/buscar/recetas` ([SearchListingPage](../frontend/src/features/search/pages/SearchListingPage.jsx)
  → [RecipeListing](../frontend/src/features/search/components/RecipeListing.jsx)). Filtros en la
  URL (`?categoria=2&valoracion=4&tiempo=30…`), así se puede recargar, compartir y volver atrás.
  Estados de carga, vacío ("No encontramos recetas con estos filtros" + "Limpiar filtros") y
  error con `ErrorState`. Reutiliza `RecipeCard` (también en la vista en lista).
- También quedaron `/buscar/categorias` y `/buscar/usuarios` (listados de categorías y perfiles
  con filtro "con/sin recetas" y orden), y la página de resultados `/buscar?q=`.

**Pendiente relacionado:**
- ✅ (29/09) "Explorar" se sacó de la sidebar (decisión del equipo). Para descubrir recetas de
  gente que no seguís queda el buscador: `/buscar/recetas` sin texto lista todas.
- 🟡 Recorrer las pantallas nuevas (buscador, listados, perfil **y home**) en 375 / 768 px y en
  modo claro: se fueron ajustando en escritorio y modo oscuro, pero no en celular/tablet ni en
  modo claro.

### 5.2 ✅ Editar reseña — 29/09

La reseña propia tiene un botón "Editar" al lado de "Eliminar"
([ReviewItem.jsx](../frontend/src/features/review/components/ReviewItem.jsx)). Abre el mismo
[ReviewModal](../frontend/src/features/review/components/ReviewModal.jsx) con el puntaje y el
comentario cargados y, al guardar, llama a `updateReview` (`PATCH`). Borrar el comentario lo deja
vacío (`null`). Con esto el CRUD Valoración queda completo en la app.

### 5.3 ✅ CU "Consultar recetas según ingredientes disponibles" (T-4.2) — 29/09

- **Cómo se usa:** en `/buscar/recetas`, en `/guardadas` y en la galería del perfil, el botón
  **"Inventario"** (`?despensa=1` en la URL). Se combina con el texto buscado y con los demás
  filtros. Para probarlo con datos de demo: `juanperez` (le alcanza para 2 recetas completas).
- **Backend:** mismo endpoint `GET /api/search/recipes?pantry=true` (en el perfil, además
  `authorId`); la despensa es siempre la
  del usuario del token. La lógica de cruce está aislada en
  [pantryMatchService.ts](../backend/src/features/search/services/pantryMatchService.ts)
  (funciones puras, sin base de datos):
  - Un ingrediente cuenta como "lo tenés" si está en el inventario con cantidad > 0 y, cuando la
    receta y el inventario tienen cantidad cargada, alcanza la requerida (si no, figura como
    "Te queda poco").
  - Orden: primero las recetas completas, después mayor porcentaje de ingredientes y, a igual
    porcentaje, menos faltantes. Se excluyen las que no usan ningún ingrediente del usuario.
- **Frontend:** aviso arriba del listado ("Tenés todo para N recetas" / "Estas son las que más se
  acercan" / "Tu despensa está vacía" con link a Inventario; ⚪ esos textos todavía dicen "despensa",
  igual que la página de Inventario: unificar el nombre) y, en cada card, "Tenés X de Y
  ingredientes", barra de progreso y "Te falta: …".
- **Relación con otros CU:** usa lo que se carga en Inventario y en Crear recetas → cumple
  "≥2 CU relacionados".

**Pendiente relacionado:**
- 🟠 Test unitario de `computePantryMatch` / `comparePantryMatches` (ver 9): ya se probaron a
  mano los casos borde (completa, falta cantidad, cantidad en 0, no tiene, receta sin
  ingredientes) y dan lo esperado; falta dejarlo como test automatizado.
- ⚪ Un acceso directo desde "Mi inventario" (ej. botón "¿Qué puedo cocinar?" →
  `/buscar/recetas?despensa=1`).

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
- **Frontend:** reemplazar los *Próximamente* de "Donar" en
  [RecipeDetailPage.jsx](../frontend/src/features/recipe/pages/RecipeDetailPage.jsx) y
  [ProfilePage.jsx](../frontend/src/features/user/pages/ProfilePage.jsx) por un `DonationModal`
  (monto, moneda, confirmación con `ConfirmModal`, "pago simulado" explícito en la UI). Página
  "Mis donaciones" (enviadas/recibidas) y, si da el tiempo, sección en el admin.
- Es la entidad ideal para contar en la defensa como "CRUD dependiente" (depende de 2 usuarios).

### 5.5 ✅ ChatBot IA (adicional, T-5.1/T-5.2) — 29/09

Integrado en el PR #21: el banner de Chefcito Bot del buscador
([AssistantBanner.jsx](../frontend/src/features/search/components/AssistantBanner.jsx)) abre el
chat, y en la landing el botón flotante le pide al visitante que inicie sesión. Cómo funciona,
cómo probarlo y sus límites (cuota gratuita de Gemini) están en [asistente-ia.md](asistente-ia.md).

### 5.6 ✅ Seguir a otros usuarios y home social (feed de amigos) — 29/09

Era algo que no estaba en la propuesta ni en el análisis: se sumó porque el botón "Seguir" del
perfil ajeno estaba como *Próximamente* (7.1) y la home necesitaba contenido propio de cada
usuario. "Amigos" son las personas que seguís (relación de **un solo sentido**, como en una red
social: no hace falta que te sigan de vuelta).

- **Backend, `follow`:** tabla `follow` (PK `idFollower + idFollowed`) y
  `GET` / `POST` / `DELETE /api/users/:userId/follow`. Reglas en el service (con el patrón
  `{ ok, reason }` de siempre): no seguirse a uno mismo (400), no seguir dos veces (409), solo
  usuarios activos (404). Cada respuesta devuelve el estado nuevo (`isFollowing`, seguidores y
  seguidos), así el botón y los contadores se actualizan sin otro pedido.
- **Backend, `feed`:** `GET /api/feed/friends/recipes`, `/friends/reviews` (`?limit`) y
  `/top-recipes` (`?days`, `limit`). El top calcula el promedio **solo con las reseñas del plazo**
  (una consulta `review.groupBy`), desempata por cantidad de reseñas, saltea a los usuarios dados
  de baja y, si una receta queda afuera por eso, se completa con la siguiente. Las secciones
  vacías responden `200` con `items: []` y `followingCount`, para que la UI distinga "no seguís
  a nadie" de "tus amigos no publicaron nada".
- **Frontend:** `features/follow` (servicio, modelo y hook `useFollow`) y `features/feed`
  (una sección por componente; cada una carga por separado con `useSearchListing`, con sus estados
  de carga, error con reintento y vacío). El carrusel del top usa el hook `useDragScroll` de `core`
  (arrastre, flechas y `scroll-snap`) y decide cuántas cards muestran según el ancho con
  `@container`. Los seguidores y seguidos se ven en las métricas del perfil.
- **Para probarlo:** cargar la sección 8 de `demo-seed.sql` (ver [guía](guia-profesor.md)) y
  entrar como `juanperez`: sigue a María, Carlos y Lucía, y **no** sigue a Martín → entrar al
  perfil de Martín y tocar "Seguir".
- **Relación con otros CU:** usa las recetas publicadas y las reseñas → cumple "≥2 CU
  relacionados" (ver 3.3).

**Pendiente relacionado:**
- 🟠 Tests: `followService` (self-follow, duplicado, usuario inexistente) y
  `feedService.getTopRecipes` (orden, desempate, plazo, usuario dado de baja). Ver 9.
- 🟡 Recorrer la home y el perfil en 375 / 768 px y en modo claro (ver 5.1).
- 🟡 **La demo se queda sin Top 10 pasada una semana:** las fechas del seed son relativas al
  momento en que se corre, y el top cuenta solo los últimos 7 días. Correr la sección 8 el día
  de la demo, del video y de la carga en el deploy (ver 11).
- ⚪ Hoy solo hay **contadores** de seguidores y seguidos: no hay listado de quiénes son (ni
  endpoint para pedirlo).
- ⚪ La home usa `@container` y `:has()`: alcanza con navegadores actuales (la guía ya lo pide),
  pero conviene probarla en el que se use en la defensa.

---

## 6. Mejoras en el backend

| # | Prio | Qué | Dónde | Cómo |
|:-:|:-:|---|---|---|
| 6.1 | 🟠 | 🔄 **Parcial (29/09).** ✅ `build` (`prisma generate && tsc`), `start` (`node ./dist/app.js`) y `"main"`. Falta el script de tests | [package.json](../backend/package.json) | `"test": "vitest run"` cuando se configuren los tests (ver 9). Completar `"description"`. |
| 6.2 | ✅ | **Resuelto (29/09).** `PORT` y `CORS_ORIGINS` (separados por comas) salen del `.env`; si no están, se usan el 3000 y los orígenes de Vite en local | [app.ts](../backend/src/app.ts) | — |
| 6.3 | 🟠 | `app.ts` hace `listen` al importarse: no se puede testear con Supertest | [app.ts](../backend/src/app.ts) | Separar: `app.ts` arma y **exporta** `app`; nuevo `server.ts` hace `app.listen`. Actualizar el script `dev`. |
| 6.4 | 🟡 | 🔄 **Parcial (29/09).** `handleValidationErrors` sigue copiado en **15 archivos** (con `search`), y con dos formatos distintos: auth responde `{ errores }` y el resto `{ message, errors }`. **Ya existe la versión única** en [validationMiddleware.ts](../backend/src/core/middleware/validationMiddleware.ts) y la usan las features nuevas (`follow`, `feed`) | `features/*/middleware/*ValidationMiddleware.ts` | Falta migrar las 15 copias: borrar cada `handleValidationErrors` local e importar el de `core` (mismo formato `{ message, errors: [{ campo, mensaje }] }`; el front ya acepta los dos, así que no rompe nada). |
| 6.5 | 🟡 | 11 controllers vuelven a llamar `validationResult` aunque el middleware ya lo hizo | `features/*/controllers/*.ts` | Borrar ese bloque duplicado (código muerto; en la defensa pueden preguntar por qué está). El controller de `search` ya no lo hace. |
| 6.6 | ✅ | **Resuelto (29/09, `task/fixes-post-feedback`).** `GET /api/recipes` ya trae `averageRating`/`reviewCount` (una consulta `groupBy` en `recipeService`) y se borró el N+1 del front. Descripción original: las recetas de `GET /api/recipes` no traen su promedio de valoración → el front hace **1 request por receta** (N+1) en el perfil, el dashboard admin y la sección "Recetas sugeridas" de `/buscar` (✅ la home ya no: el feed trae la valoración calculada en el backend con `groupBy`) | `recipeRepository.ts`, [useRecipeReviewStats.js](../frontend/src/features/review/hooks/useRecipeReviewStats.js), [useProfileData.js](../frontend/src/features/user/hooks/useProfileData.js), [useAdminDashboard.js](../frontend/src/features/admin/hooks/useAdminDashboard.js) | El listado `/api/search/recipes` ya lo resuelve con `review.groupBy` (ver `searchRepository.findReviewStats`): reutilizar esa misma consulta en `recipeService` y agregar `averageRating`/`reviewCount` a cada receta, así se puede borrar el N+1. |
| 6.7 | 🟡 | `recipe.saveCount` **nunca se actualiza** (solo tiene el valor del seed) → ya no se muestra en el perfil (se quitaron las métricas), pero sigue sin actualizarse | `userRecipeService.ts` | Incrementar/decrementar en la misma transacción al guardar/desguardar, o calcularlo con `_count` y dejar de usar la columna. (El orden "Más populares" del buscador ya cuenta los guardados reales con `userrecipe.groupBy`, no usa esta columna.) |
| 6.8 | 🟡 | Dos caminos a la BD: el health check usa un pool `mysql2` aparte ([database.ts](../backend/src/database.ts)) y devuelve `error.message` crudo al cliente | `features/database/`, `database.ts` | Usar ``prisma.$queryRaw`SELECT 1` `` y borrar `database.ts`. Así se puede quitar `mysql2` y las variables `DB_HOST/PORT/USER/PASSWORD/NAME`: el `.env` queda solo con `DATABASE_URL` y `JWT_SECRET` (más simple para el profe y para el deploy). |
| 6.9 | 🟡 | Listados vacíos responden **404** en vez de `200 []` | category, ingredient, ingredientCategory, recipe, rol, user controllers | Un listado vacío no es "no encontrado". Devolver `200 []`. `fetchListOrEmpty` del front sigue funcionando igual. Los endpoints nuevos de `search` ya responden `200` con la lista vacía. |
| 6.10 | 🟡 | Las recetas de usuarios dados de baja siguen apareciendo en `GET /api/recipes` | `recipeRepository.findAll` | Agregar `where: { user: { deletedAt: null } }` en los listados públicos. El buscador ya las excluye. |
| 6.11 | ⚪ | Una ruta `/api/xxx` inexistente o un error inesperado devuelven HTML de Express | [app.ts](../backend/src/app.ts) | Al final: un middleware 404 JSON y un error handler `(err, req, res, next)` que responda `500 { message }`. |
| 6.12 | ⚪ | El chequeo "dueño o admin" está reimplementado a mano en inventario y en recetas guardadas | `inventoryRouter.ts`, `userRecipeController.ts` | Parametrizar `verifyOwnerOrAdmin(paramName = 'id')` en `authMiddleware.ts`. |
| 6.13 | ⚪ | `GET /api/categories` pide token, a diferencia de los demás catálogos (públicos) | [categoryRouter.ts](../backend/src/features/category/routes/categoryRouter.ts) | Hacerlo público si la landing lo necesita sin sesión (el buscador es solo para usuarios logueados, así que no lo necesita). |
| 6.14 | ⚪ | Se usa `prisma db push` sin migraciones. **Cada cambio de esquema (como la tabla `follow` del 29/09) obliga a todo el equipo a correr `db push`**: no hay otro aviso que el PR | `prisma/` | Para el deploy alcanza con `db push`. Si hay tiempo, `prisma migrate dev --name init` deja historial versionado. Mientras tanto, avisar en la descripción de cada PR que toque `schema.prisma`. |
| 6.15 | ⚪ | La consulta "promedio y cantidad de reseñas por receta" está escrita tres veces: `searchRepository.findReviewStats`, `feedRepository.findReviewStats` (esta admite plazo y lista de recetas) y `recipeRepository.findReviewStats` (29/09, para 6.6) | `features/search/repository/`, `features/feed/repository/` | Dejar una sola en un lugar compartido (ej. `review/repository`) y que `search` y `feed` la usen. También sirve para resolver 6.6. |
| 6.16 | ⚪ | `feedService.getTopRecipes` pide las cards de **todas** las recetas con reseñas en el plazo (para completar el top si alguna es de un usuario dado de baja) | [feedService.ts](../backend/src/features/feed/services/feedService.ts) | Con pocas recetas no se nota. Si crece: pedir solo las primeras `limit + margen` del ranking. |

---

## 7. Mejoras en el frontend

| # | Prio | Qué | Dónde | Cómo |
|:-:|:-:|---|---|---|
| 7.1 | 🔴 | 🔄 **Parcial (29/09).** Botones *Próximamente*. ✅ Las tarjetas de búsqueda e IA de la home ya no están. ✅ **Seguir** funciona (feature `follow`). ✅ El asistente IA funciona (PR #21). ✅ "Explorar" y "Notificaciones" se sacaron de la sidebar. Queda solo **Donar** (detalle de receta y perfil) | [RecipeDetailPage.jsx](../frontend/src/features/recipe/pages/RecipeDetailPage.jsx), [ProfilePage.jsx](../frontend/src/features/user/pages/ProfilePage.jsx) | Se resuelve con 5.4. Si no se llega, sacar el botón antes de entregar. |
| 7.2 | 🟡 | La landing muestra **recetas inventadas** ([landingMockData.js](../frontend/src/features/landing/models/landingMockData.js)) | `ExploreSection`, `WeeklyRecipe`, `CommunitySection` | `GET /api/recipes` es público: mostrar recetas reales (ej. las mejor valoradas). Si nos preguntan "¿de dónde salen estos datos?", la respuesta tiene que ser "del backend". |
| 7.3 | 🟡 | Cambio de contraseña sin UI: [changePasswordService.js](../frontend/src/features/user/services/changePasswordService.js) no se usa en ningún lado | `EditProfileModal.jsx` | Agregar sección "Cambiar contraseña" (actual + nueva + confirmación) o borrar el servicio. |
| 7.4 | ✅ | ~~El filtro por categoría del perfil solo miraba la primera categoría de cada receta~~ (29/09): la galería del perfil ahora usa el listado del buscador (`authorId`), que filtra por cualquiera de las categorías, y las opciones del filtro salen de todas. | [ProfileRecipeGallery.jsx](../frontend/src/features/user/components/ProfileRecipeGallery.jsx) | — |
| 7.5 | 🟡 | `CategoryFormModal` duplicado (category/ e ingredientCategory/) y las tablas admin de categorías casi idénticas (239 líneas cada una) | `features/category/`, `features/ingredientCategory/`, `features/admin/components/` | Un solo modal/tabla genérica en `core/components/` que reciba título y servicio por props. |
| 7.6 | 🟡 | Faltan modelos (requisito de la cátedra + CLAUDE.md §7) | `features/user/models/` (solo tiene el de métricas del perfil), category, ingredient, role, nutritionalValue, image, step | Factory functions simples, ej. `createUserFromApi(raw)` y `toUpdateUserPayload(form)`, y que los servicios mapeen la respuesta cruda al modelo (como hace `search`: `searchModel.js` / `searchListingModel.js`). |
| 7.7 | 🟡 | Componentes > 200 líneas (CLAUDE.md §6), medido de nuevo el 29/09 después de los cambios del feedback. ✅ `AdminPage` bajó de 286 a 78 (cada sección del panel es su propio componente) | `EditProfileModal` 313 · `AdminUsersTable` 290 (era 353; la fila pasó a `AdminUserRow`) · `RecipeEditorPage` 279 · `InventoryPage` 260 · `AdminIngredientsTable` 244 (era 286; fila en `AdminIngredientRow`) · `AdminRecipeCategoriesTable` 239 · `AdminIngredientCategoriesTable` 239 · `ProfilePage` 213 · `RecipePage` 202. ✅ 30/09: se borraron `NutritionalValuePanel` y `SearchUsersForm`, y `RegisterForm` bajó a 85 (campos en `RegisterFields`) | Extraer subcomponentes (filas, paginación, formularios) y hooks. `RecipeEditorPage` orquesta la carga, el guardado y el layout (la validación ya se pasó a `useRecipeValidation`). Varios crecieron un poco por los labels y errores por campo del feedback. |
| 7.8 | ✅ | ~~`index.html` con `lang="en"`~~ (29/09): `lang="es"`, título "Chefcito" y `<meta name="description">`. | [index.html](../frontend/index.html) | — |
| 7.9 | ⚪ | Archivos y código sin uso | `src/assets/react.svg`, `vite.svg`, `hero.png`; `.gitkeep` en carpetas que ya tienen archivos (`auth/styles`, `user/styles`, `user/models`, `styles/`); `MasonryGrid` (core) quedó sin uso desde que la galería del perfil pasó a la grilla pareja del buscador (también lo nombra `CLAUDE.md`); desde el 29/09 también `getSavedRecipesByUser` + `savedRecipeFromApi` ([userRecipeService.js](../frontend/src/features/userRecipe/services/userRecipeService.js)), porque "Recetas guardadas" ahora usa el listado del buscador. ✅ (29/09) Ya se borraron `RecipeCarouselSection` y `HomeRecipeCard`, que la home nueva dejó sin uso | Borrar lo que queda (el endpoint `GET /saved-recipes/:idUser` del backend puede quedar: no molesta y sigue documentado). |
| 7.10 | ⚪ | Sin `.env.example` | `frontend/` | Crear `frontend/.env.example` con `VITE_API_BASE_URL=http://localhost:3000/api` (este sí se commitea). |
| 7.11 | ⚪ | SPA con `BrowserRouter`: al recargar `/admin` o `/buscar/recetas` en el deploy da 404 | raíz del frontend | Según el hosting: `vercel.json` con un rewrite a `/index.html`, o `public/_redirects` en Netlify. |
| 7.12 | ⚪ | El bundle de JS pasó los 500 kB (504 kB el 29/09) y Vite avisa al hacer `build` (es solo una advertencia) | `frontend/` | Cargar las páginas grandes recién al entrar a su ruta (`React.lazy` + `Suspense` en `App.jsx`, empezando por el panel admin). Opcional. |

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
  (`Closes #N`). Poner el link en `docs/tracking.md`. Mientras tanto, el
  [registro de avances](#registro-de-avances) de este documento sirve de historial.
- **Minutas:** desde ahora, una minuta breve por reunión (fecha, presentes, qué se hizo, qué se
  decidió, quién hace qué). Para lo ya hecho, un resumen honesto por fase basado en las fechas
  reales de los PRs #1–#18 — **no inventar reuniones que no existieron**.
- **Metodología:** escribir cuál usamos de verdad (por ejemplo Kanban con fases/sprints de la
  task-division) y cómo es el flujo de ramas y revisiones.

### 8.3 [proposal.md](proposal.md)

- **Declarar el stack** (lo exige el FAQ para tecnologías distintas a las de la cátedra):
  React + Vite (en lugar de Angular), TypeScript en el backend, Express 5, Prisma, MySQL.
- **Actualizar el DER**: el de la imagen es anterior a cambios del schema (tablas `role`/`userrole`,
  `ingredientcategoryingredient` N:M, **`follow`** —relación N:M de `User` con `User`, nueva del
  29/09— etc.). Mejor un `erDiagram` de Mermaid versionado en el repo
  (docs.md lo recomienda) que una imagen suelta en `user-attachments` + Google Drive.
- **Reclasificar CRUD Receta** como dependiente (depende de Usuario y Categoría).
- **Agregar el alcance extra ya hecho** (Rol, Inventario, Valor nutricional, Pasos, Imágenes,
  Recetas guardadas, Dashboard admin, **buscador con listados de categorías y perfiles**,
  **seguir a otros usuarios y la home con recetas y reseñas de amigos**).
- **Agregar la sección de links a los PRs** (obligatoria en ambas entregas).
- Marcar como hechos los listados adicionales "por tiempo de preparación" y **"top 10 mejor
  valoradas en un plazo"** (este último, nuevo del 29/09) y decidir qué pasa con el ChatBot y el
  listado por necesidades nutricionales.

### 8.4 [CLAUDE.md](../CLAUDE.md)

- ✅ (29/09) Ya menciona las rutas del buscador (`/buscar`, `/buscar/recetas|categorias|usuarios`).
- Dice que el 422 devuelve `{ errores: [...] }`; en realidad casi todo devuelve
  `{ message, errors: [{ campo, mensaje }] }` (solo auth usa `errores`). Corregir cuando se
  unifique (6.4).
- ✅ (29/09) Ya dice `tasks-division.md` (antes `task-division.md`) y describe `CurrentUserContext`,
  las piezas de formulario de `core` (`RequiredMark`, `RequiredFieldsNote`, `FieldError`) y las
  variables `PORT`/`CORS_ORIGINS`.
- Ejemplos con `.tsx` (`RecipeCard.tsx`) y "React en TypeScript y JavaScript": el front es solo
  JS/JSX.
- Referencia al "IDE Antigravity": quitar o generalizar.

### 8.5 [backend/README.md](../backend/README.md)

- ✅ (29/09) Ya lista las features `search/`, `follow/`, `feed/` y `assistant/`,
  `core/middleware/validationMiddleware.ts`, la tabla `follow`, los scripts `build`/`start` y las
  variables `PORT`/`CORS_ORIGINS`.
- Describe `database/` como "endpoint de inicialización/seed (solo dev)"; es solo un health check.
- El ejemplo de `handleValidationErrors` no coincide con el formato real.
- Dice que los handlers llevan prefijo `handle`; los controllers se llaman `searchX`, `createX`,
  `getXById`, etc.
- La checklist de AD (§13) hay que ir tildándola a medida que avancen los tests.

### 8.6 [tasks-division.md](tasks-division.md)

- Agregar una columna **Estado** (✅ / 🔄 / ⏳) a cada T-X.X. Hoy: T-4.1 ✅, **T-4.2 ✅** y
  **T-4.4 🔄** (filtros por tiempo y valoración ✅, guardar recetas ✅, recomendaciones 🔄: la
  home ya muestra recetas de amigos y el top de la semana, pero no hay "recomendadas para vos"),
  T-4.3 ⏳, Fase 5 ⏳.
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
| Backend × 4 (1 por integrante) | Unitario | **Los más fáciles de arrancar** (funciones puras, sin mocks): `computeRecipeNutrition` de [recipeNutritionService.ts](../backend/src/features/recipe/services/recipeNutritionService.ts) (suma por ingrediente, división por porciones, sin porciones = total, ingrediente sin cantidad o sin tabla → `missingIngredients`, unidad distinta → no se cuenta, nutriente que falta en un ingrediente → `isComplete: false`), y `computePantryMatch` y `comparePantryMatches` de [pantryMatchService.ts](../backend/src/features/search/services/pantryMatchService.ts) (funciones puras, no hace falta mockear nada; casos: completa, falta cantidad, cantidad en 0, no la tiene, receta sin ingredientes, orden). Además, services con el repository mockeado (`vi.mock`): `reviewService.createReview` (rechaza reseñar la propia / duplicada), `recipeService.updateRecipe` (403 si no es dueño), `authService.login` (credenciales inválidas, `isAdmin`), `searchService.listRecipes` (filtro por valoración y orden), reglas de donación, **`followService`** (no seguirse a uno mismo, no seguir dos veces, usuario inexistente, dejar de seguir sin seguirlo) y **`feedService.getTopRecipes`** (orden por promedio, desempate por cantidad de reseñas, solo reseñas del plazo, receta de un usuario dado de baja) | `vitest` |
| Backend × 1 | Integración | Con Supertest sobre `app` (requiere 6.3) contra una BD de test (`.env.test` con otra `DATABASE_URL`): login → token → `GET` de ruta protegida (200) y sin token (401), o crear receta y encontrarla con `GET /api/search/recipes?q=` | `supertest`, `@types/supertest` |
| Frontend × 1 | Unitario de componente | `ErrorState` (muestra el mensaje y llama `onRetry` al hacer click), `StarRating`, `ConfirmModal` o `SearchPagination` (deshabilita "anterior" en la página 1 y llama `onPageChange`); o `RatingBadge` / `UserAvatar` (nuevos, muy simples: cae a las iniciales si la foto falla). Además, sin componentes: `formatRelativeTime` es una función pura fácil de probar ("hace 5 minutos", "ayer", "hace 2 semanas", fecha pasado un mes) | `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` |
| Frontend × 1 | E2E | Con back y front levantados y el seed cargado: login con `juanperez` → buscar "fideos" → abrir la receta; o crear receta → aparece en "Mis recetas"; o login admin → redirige a `/admin` | `@playwright/test` |

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
- Punto de partida: el inventario de endpoints del [Anexo A](#anexo-a--inventario-de-endpoints-actual)
  (al día al 29/09, incluye los endpoints de búsqueda).
- Documentar el formato común de errores (`{ message }`, `{ message, errors: [{ campo, mensaje }] }`)
  y el header `Authorization: Bearer <token>`.

---

## 11. Deploy (🟠 AD)

| Parte | Opciones | A tener en cuenta |
|---|---|---|
| Base de datos | MySQL gestionado: Railway, Aiven (free), Clever Cloud, TiDB Serverless (compatible con MySQL) | Correr `npx prisma db push` contra esa URL y cargar `demo-seed.sql`. ⚠️ **La sección 8 del seed usa fechas relativas y el Top 10 cuenta solo los últimos 7 días:** volver a cargarla justo antes de la demo / del video / de la entrega (se puede correr sola, ver 5.6) o la home queda sin ranking. ⚠️ El buscador confía en que la collation de MySQL no distinga mayúsculas ni tildes ("maria" encuentra "María"): verificar que la BD en la nube use la misma (ej. `utf8mb4_0900_ai_ci`). El seed ya fija `SET NAMES utf8mb4` (29/09), así que los acentos se cargan bien con cualquier cliente. |
| Backend | Render o Railway | 6.1 (`build`/`start`) y 6.2 (`PORT`/`CORS_ORIGINS`) ya están (29/09). Variables: `DATABASE_URL`, `JWT_SECRET` (**uno nuevo**, no el de la guía, que es público en el repo), `CORS_ORIGINS`, `PORT`. |
| Frontend | Vercel o Netlify | `VITE_API_BASE_URL` apuntando al backend deployado. Rewrites para la SPA (7.11). |
| Imágenes | — | ⚠️ Las fotos se guardan en `backend/uploads/` (disco local). En Render free el disco se borra en cada redeploy → las fotos subidas se pierden. Opciones: Railway con volumen persistente, o aceptar que en la demo se usen links externos. Decidirlo antes de elegir hosting. |

Después: `docs/deploy.md` con los links y las credenciales de demo (admin + un usuario común).

---

## 12. Reparto sugerido

Actualizado el 29/09. **5.1, 5.3 y 5.6 ya están hechos**, así que sale de la lista lo que eran
T-4.2 y T-4.4 (y el "Seguir" que estaba como *Próximamente*). Lo que sigue importando para la cátedra es que **cada integrante tenga su propio test y
pueda defender un CU** (aunque no lo haya programado él: en la defensa tiene que saber
explicarlo). Es una propuesta: ajustarla en la próxima reunión.

| Integrante | Funcionalidad pendiente | Test propio (backend) | Otras tareas | CU que defiende |
|---|---|---|---|---|
| **Stéfano** (Dev A) | Deploy completo (6.3, 7.11, 11; 6.1 y 6.2 ✅) · ~~editar reseña (5.2)~~ ✅ · ~~commitear "Seguir" + home nueva~~ ✅ (PR #22) · PR de `task/fixes-post-feedback` | Integración (Supertest) + unitario de `reviewService` | README raíz, índice de docs, propuesta, GitHub Project, revisar PRs | Reseñar recetas |
| **Elías** (Dev B) | Documentación de la API (10) · ~~quitar el N+1 de valoraciones (6.6)~~ ✅ hecho el 29/09 | Unitario de `pantryMatchService` (despensa) | Revisar a mano las pantallas del buscador en los 3 breakpoints | Consultar recetas según ingredientes |
| **Juan** (Dev C) | T-4.3 Donaciones (5.4) | Unitario de `donationService` | Test E2E con Playwright (T-5.3) · el "Donar" que queda en 7.1 se resuelve con 5.4 | Donar a creadores |
| **Gastón** (Dev D) | Landing con datos reales (7.2) (~~conectar "Explorar"~~: se sacó de la sidebar) | Unitario de `recipeService` (permisos) o de `searchService.listRecipes` | Test unitario de componente (front) · minutas | Crear y publicar recetas (+ listados) |

**Sin dueño todavía:** el CU nuevo "Seguir cocineros y ver su actividad" (5.6). Definirlo en la
próxima reunión (y quién escribe sus tests: `followService` y `feedService`).

Las mejoras 🟡/⚪ de las secciones 6 y 7 se reparten al final, entre quien tenga tiempo.

**Sobre la participación en git.** La cátedra evalúa "los aportes que haya realizado cada
integrante" mirando el historial. Al 28/09 (`git shortlog --no-merges`, sin contar los commits
del template) la distribución estaba despareja: Stéfano 25, Juan 6, Gastón 6, Elías 3. Para lo que
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
  `verifyAdmin` / `verifyOwnerOrAdmin`, por qué `idUser` sale del token y no del body (también la
  despensa del buscador), por qué Prisma previene SQL injection, baja lógica de usuarios.
- **Frontend:** `ProtectedRoute` y los 3 niveles, `apiFetch` y el evento de sesión expirada,
  mobile-first con `respond-to`, input/output properties (props y callbacks `onX`), estados de
  carga/error/vacío.
- **Buscador:** por qué hay debounce (300 ms) y cómo se descartan respuestas viejas
  (`useQuickSearch`), por qué los filtros viven en la URL, por qué el listado de recetas se arma
  en dos pasos (filtrar/ordenar con datos mínimos y después pedir solo las 12 cards de la página),
  y cómo se calcula el filtro "Inventario".
- **Seguir y la home:** qué es la tabla `follow` (relación N:M de usuario con usuario, PK
  compuesta, un solo sentido), por qué quien sigue sale del token, cómo se arma el Top 10 de la
  semana (promedio solo con las reseñas del plazo, una consulta agrupada) y por qué cada sección
  de la home carga por separado (si una falla, las otras se ven).
- **Tests:** qué prueba el suyo y cómo se corre.

---

## 14. Checklist final de entrega AD

Formulario: https://kutt.to/DSWEntregaSistemaFinal

- [x] Listados con filtro (categoría y valoración) + detalle — 29/09
- [x] Editar reseña en la UI — 29/09
- [x] CU Recetas según ingredientes — 29/09
- [x] Seguir usuarios + home con recetas y reseñas de amigos y Top 10 de la semana — 29/09 (PR #22)
- [x] Chefcito Bot (asistente IA) — 29/09 (PR #21)
- [x] Correcciones del feedback del profesor: llamadas al backend, acentos, campos obligatorios — 29/09
- [ ] CRUD + CU Donaciones
- [ ] Sin botones *Próximamente* ni datos falsos en la UI (quedan Donar y la landing)
- [ ] 4 tests unitarios backend + 1 integración, pasando
- [ ] 1 test de componente + 1 E2E en el front, pasando
- [ ] Evidencia de tests en `docs/tests.md`
- [ ] Documentación de la API
- [ ] `.env.example` en back y front
- [ ] Deploy funcionando (back + front + BD en la nube) y probado desde un celular
- [ ] Credenciales de demo en la entrega
- [ ] Cargar la sección 8 de `demo-seed.sql` justo antes de grabar el video y de entregar (si no, el Top 10 de la semana queda vacío)
- [ ] `README.md` raíz con instalación y link a `docs/README.md`
- [ ] `docs/README.md` como índice
- [ ] Propuesta actualizada con stack, DER y links a los PRs
- [ ] Minutas, metodología y tracking (GitHub Project)
- [ ] Video demo (recorrer los 4 CU, los CRUDs, el buscador y el panel admin)
- [ ] PR `develop` → `main` para la entrega
- [ ] Coordinar la fecha de defensa con los docentes

---

## Anexo A — Inventario de endpoints actual

Al día al 29/09. Base: `/api`. **Público** = sin token · **Token** = cualquier usuario logueado ·
**Dueño/Admin** = el propio usuario o un admin · **Admin** = solo admin.

| Recurso | Método y ruta | Acceso |
|---|---|---|
| Auth | `POST /auth/register` (usuario o email repetido → 409 con el campo en `errores`) · `POST /auth/login` | Público |
| Usuarios | `GET /users` (`?inactive=true` solo admin) · `GET /users/:id` | Token |
| | `POST /users` · `PATCH /users/:id/restore` | Admin |
| | `PATCH /users/:id` · `PATCH /users/:id/password` · `DELETE /users/:id` (baja lógica) | Dueño/Admin |
| | `PATCH` / `DELETE /users/:id/avatar` · `PATCH` / `DELETE /users/:id/cover` (foto de perfil y portada, archivo multipart en `image`) | Dueño/Admin |
| Inventario | `GET`, `POST /users/:userId/inventory` · `PATCH`, `DELETE /users/:userId/inventory/:ingredientId` | Dueño/Admin |
| Roles | `GET`, `POST /roles` · `GET`, `PATCH`, `DELETE /roles/:id` · `GET /roles/users` (roles de todos los usuarios) · `GET /roles/users/:userId` · `GET`, `POST /roles/:id/users` · `DELETE /roles/:id/users/:userId` | Admin |
| Categorías de receta | `GET /categories` · `GET /categories/name/:name` | Token |
| | `POST /categories` · `PATCH`, `DELETE /categories/:id` | Admin |
| Categorías de ingrediente | `GET /ingredient-categories` · `GET /ingredient-categories/:id` | Público |
| | `POST` · `PATCH`, `DELETE /:id` | Admin |
| Panel admin | `GET /admin/summary` (cifras del dashboard) · `GET /admin/users?status=all\|active\|inactive&q=&page=` (página de 6 usuarios con roles, recetas y valoraciones) | Admin |
| Ingredientes | `GET /ingredients` · `GET /ingredients/:id` (cada uno trae sus categorías, `nutritionalvalue` y `_count.recipeingredient`) | Público |
| | `POST` · `PATCH`, `DELETE /:id` (`POST`/`PATCH` aceptan `nutritionalValues`, que reemplaza el set) · `PATCH`, `DELETE /:id/image` (foto, multipart en `image`) | Admin |
| Valores nutricionales | `GET /ingredients/:idIngredient/nutritional-values` · `GET .../:num` | Público |
| | `POST` · `PATCH`, `DELETE .../:num` | Admin |
| Recetas | `GET /recipes` (`?userId=N`; cada receta trae `averageRating` y `reviewCount`) · `GET /recipes/:id` (detalle: suma `nutrition` —valores por porción— y, si viene un token, `viewer: { isSaved, pantryIngredientIds }`) | Público |
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
| Búsqueda rápida | `GET /search?q=texto` (primeras coincidencias + total de categorías, recetas —con su valoración— y usuarios) | Token |
| Listados de búsqueda | `GET /search/recipes` (`?q`, `categoryId`, `authorId`, `maxTime`, `minTime`, `minRating`, `ingredientIds`, `nutrition`, `pantry`, `savedOnly`, `sort`, `page`) · `GET /search/categories` y `GET /search/users` (`?q`, `onlyWithRecipes`, `sort`, `page`) | Token (la despensa y las guardadas son las del usuario del token) |
| Seguir | `GET /users/:userId/follow` (¿lo sigo? + seguidores y seguidos) · `POST` (seguir) · `DELETE` (dejar de seguir) | Token (el que sigue es el usuario del token) |
| Feed de la home | `GET /feed/friends/recipes` y `GET /feed/friends/reviews` (`?limit`) · `GET /feed/top-recipes` (`?days`, `limit`) | Token ("amigos" = a quienes sigue el usuario del token) |
| Asistente IA | `POST /assistant/chat` (Chefcito Bot; 503 si no hay `GEMINI_API_KEY`) | Token |
| Salud | `GET /database/health` | Público |
| Archivos | `GET /uploads/recipes/<archivo>` · `GET /uploads/users/<archivo>` (estático, fuera de `/api`) | Público |
| **Donaciones** | — | **No existe todavía** |

## Anexo B — Verificaciones hechas para este análisis

**28/09 (primer análisis, commit `f3080a3`):**
- `frontend`: `npm run lint` → sin errores · `npm run build` → OK (JS 431 kB / 116 kB gzip).
- `backend`: `npx tsc --noEmit` → sin errores.
- Búsquedas en el código: servicios/modelos sin uso, `Próximamente`, `TODO`, datos mock,
  `handleValidationErrors` duplicados, listados que responden 404, uso de `saveCount`, tamaño de
  componentes, historial de git.
- No se levantó la app ni se probó contra la base de datos: lo funcional se dedujo leyendo el
  código.

**29/09 (esta actualización, `aad0e47` + buscador sin commitear):**
- `frontend`: `npm run lint` → sin errores · `npm run build` → OK.
- `backend`: `npx tsc --noEmit` → sin errores.
- Endpoints de búsqueda probados **contra la base con el seed** (usuario `juanperez`):
  búsqueda rápida (incluye mayúsculas, tildes y nombre + apellido), los tres listados con cada
  filtro y orden, modo despensa, y los 401/422 de validación.
- Lógica de la despensa probada a mano con casos borde (ver 5.3).
- Se volvieron a revisar en el código: usos de `updateReview`, `Próximamente`, `.env.example`,
  `README.md` raíz, scripts de `package.json`, `PORT`/CORS, `handleValidationErrors` y
  `validationResult` duplicados, listados que responden 404, modelos por feature y tamaño de
  componentes.
- **La UI del buscador no se recorrió en el navegador**: pendiente (ver 5.1).

**29/09 (cierre de `task/Frontend-Updates`: perfil, filtro "Inventario" y ajustes visuales):**
- `frontend`: `npm run lint` → sin errores · `npm run build` → OK.
- `backend`: `npx tsc --noEmit` → sin errores. El esquema de la base **no cambió**: la feature
  `search` solo lee columnas que ya existían y que carga `demo-seed.sql`, así que la
  [guía de instalación](guia-profesor.md) y el script siguen funcionando igual (al script solo se
  le sumaron 2 ingredientes al inventario de `juanperez`).
- `GET /api/search/recipes?authorId=` probado contra la base con el seed (por autor, con
  inventario, por categoría, orden y el 422 con un `authorId` inválido).
- La UI del perfil, el buscador y las cards se revisó en el navegador en escritorio y modo oscuro.

**29/09 (Seguir + home nueva + métricas del perfil, sobre `develop` `5e6c3e5`, sin commitear):**
- `frontend`: `npm run lint` → sin errores · `npm run build` → OK. `backend`: `npx tsc --noEmit` → sin errores.
- **El esquema cambió** (tabla `follow`): `npx prisma db push` aplicado en la base local. La sección 8
  de `demo-seed.sql` se cargó en esa base y se comprobó que corre sola sobre una base ya cargada
  (`ON DUPLICATE KEY` para las recetas que ya estaban guardadas).
- Endpoints probados **contra la base con el seed** (usuario `juanperez`, backend levantado):
  - `feed`: los tres devuelven lo esperado (3 seguidos; top de 10 ordenado por promedio y
    desempate por cantidad de reseñas; recetas de amigos con su valoración); `limit=50` y
    `days=0` → 422; sin token → 401.
  - `follow`: estado (200), seguir (201), seguir de nuevo (409), dejar de seguir (200), dejar de
    seguir sin seguirlo (404), seguirse a uno mismo (400), usuario inexistente (404), id no
    numérico (422). Se dejó la base como estaba.
- La UI se fue ajustando mirando el navegador en escritorio y modo oscuro. **No se recorrió en
  celular/tablet ni en modo claro** (ver 5.1 y 5.6). No hay tests automáticos de lo nuevo (ver 9).

**29/09 (`task/fixes-post-feedback`: feedback del profesor, sobre `develop` `b29c500`):**
- `frontend`: `npm run lint` → sin errores · `npm run build` → OK (JS 504 kB, ver 7.12).
  `backend`: `npx tsc --noEmit` → sin errores. El esquema de la base **no cambió**.
- Endpoints probados **contra la base con el seed**: `GET /recipes` y `?userId=` con
  `averageRating`/`reviewCount` (coinciden con `/recipes/:id/reviews`), `GET /roles/users` (200 como
  admin, 403 como usuario común, 401 sin token), búsqueda rápida con valoración, `PATCH` de una
  reseña (se dejó como estaba), 409 de usuario/email repetido y 422 del registro con el campo, y
  `PORT`/`CORS_ORIGINS` levantando una segunda instancia en otro puerto.
- **Acentos:** se reprodujo el problema cargando el seed en una base temporal con un cliente en
  latin1 (29 filas rotas) y se comprobó el arreglo con el mismo cliente (0 filas). La base
  temporal se borró.
- **UI revisada en el navegador** (Chrome sin ventana, con capturas) en escritorio, celular, modo
  claro y oscuro: modal de registro (vacío, con errores y en celular), formularios de ingrediente,
  categoría y alta de usuario del admin, editor de recetas, agregar al inventario y editar perfil.
  **No se recorrieron en el navegador:** editar una reseña, el mensaje de cuenta creada, el login,
  la carga por pantalla de la home y del panel admin (se verificó leyendo el código y con los
  endpoints) ni la sidebar actualizándose al editar el perfil.
