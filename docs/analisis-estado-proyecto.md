# Análisis del estado del proyecto — Chefcito

> **Última actualización:** 29/09/2026 · **Rama analizada:** `task/Frontend-Updates` (sobre
> `develop`, commit `aad0e47`, PR #18) con el buscador, los listados con filtros y el rediseño del
> perfil, listos para commitear (ver [Registro de avances](#registro-de-avances)).
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
2. 🔴 **Editar una reseña desde la UI**: el backend tiene `PATCH`, pero el frontend no lo usa
   (el CRUD Valoración está incompleto en la app).
3. ✅ ~~**CU "Consultar recetas según ingredientes disponibles"**~~ (29/09): filtro
   "Inventario" del listado de recetas. Ver 5.3.
4. 🟠 **CU / CRUD "Donaciones"** (T-4.3): la tabla existe en el schema, pero no hay backend
   ni frontend (los botones "Donar" muestran *Próximamente*).
5. 🟠 **Tests**: no hay ninguno. Faltan 4 tests de backend (1 por integrante) + 1 de
   integración, 1 test unitario de componente y 1 test E2E.
6. 🟠 **Documentación de la API**: no existe (el [Anexo A](#anexo-a--inventario-de-endpoints-actual)
   está al día y sirve de punto de partida).
7. 🟠 **Deploy** (links + credenciales): no existe; además faltan scripts `build`/`start` y el
   puerto/CORS están hardcodeados.
8. 🔴 **Documentación que pide la cátedra**: falta el `README.md` en la raíz, `docs/README.md`
   hoy es la consigna (no nuestro índice), faltan minutas, tracking de tareas/issues,
   metodología y links a los PRs en la propuesta.
9. 🟠 **Video demo** + evidencia de ejecución de tests.
10. 🟡 Varias mejoras de código (sección 6 y 7) para llegar prolijos a la defensa.
11. 🔴 **Commitear `task/Frontend-Updates` y abrir el PR a `develop`** (todo lo del 29/09:
    buscador, listados, filtro "Inventario" y rediseño del perfil).

---

## 2. Calendario y plan sugerido

Fechas de la cátedra: **1ª entrega Regularidad/AD 12/10–16/10**, recuperatorio 26/10–30/10,
última instancia 9/11–13/11. Hoy es 29/09: **quedan 2 semanas** para la primera ventana.

| Semana | Objetivo | Qué entra | Estado |
|---|---|---|---|
| **28/09 – 04/10** | Asegurar regularidad | ~~Listado con filtros (categoría + valoración)~~ ✅, editar reseña, README raíz + índice de docs, propuesta actualizada, tablero de tareas + minutas, `.env.example`. ~~Arrancar T-4.2~~ ✅ (hecho completo). Arrancar T-4.3 y la configuración de tests. | 🔄 En curso |
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
| HTML5 | Reg | ✅ | `index.html` tiene `lang="en"` → cambiar a `es` (7.8). |
| CSS con metodología / preprocesador | Reg | ✅ | SASS con variables y mixins |
| Mobile-first + 3 breakpoints | Reg | ✅ | `respond-to(sm\|md\|lg)` en [_breakpoints.scss](../frontend/src/styles/abstracts/_breakpoints.scss). Revisar a mano cada pantalla en 375 / 768 / 1280 px antes de entregar (incluidas las 3 pantallas nuevas del buscador). |
| UX sin manual | Reg | ⚠️ | Mejoró: ya no están las tarjetas *Próximamente* de búsqueda e IA en la home. Quedan: **Donar** (detalle de receta y perfil), **Seguir** (perfil de otro usuario), "Explorar" y "Notificaciones" deshabilitados en la sidebar, el botón del asistente IA en el buscador y datos falsos en la landing (ver 7.1 y 7.2). |
| Eventos, errores amigables, reactividad, input/output property | Reg | ✅ | props (input), callbacks `onX` (output), `AlertModal`/`ErrorState` |
| Al menos un servicio | Reg | ✅ | Un `services/` por feature sobre `apiFetch` |
| Modelos con clases/tipos custom | Reg | ⚠️ | Hay modelos en recipe, review, inventory, auth, admin, userRecipe, landing y search, y en user solo el de métricas del perfil (`profileMetricsModel.js`); **faltan** el del usuario en sí, category, ingredient, role, etc. (ver 7.6) |
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
| Listado con filtro c/2 integrantes | Reg | 2 | ✅ (29/09) `/buscar/recetas` (por categoría, valoración, tiempo, ingredientes e inventario), `/buscar/categorias` y `/buscar/usuarios` (con/sin recetas). Además la galería del perfil y las tablas de admin. |
| Detalle al seleccionar (request al back, ≥2 clases) | Reg | — | ✅ `/recetas/:id` muestra receta + creador + ingredientes + pasos + reseñas. Todas las cards de los listados de búsqueda llevan ahí (o al perfil `/usuarios/:id`). |
| CU/Epic c/2 integrantes | Reg | 2 | ✅ Crear y publicar recetas · Reseñar recetas |
| CRUDs de **todas** las clases de negocio | AD | — | ❌ Falta Donación (ver 5.4) |
| 1 CU por integrante, ≥2 relacionados | AD | 4 | ⚠️ **3 de 4** (falta "donaciones"). "Recetas según ingredientes" usa lo que carga Inventario y lo que se carga al Crear recetas → cumple "≥2 relacionados". |

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
| CRUD Valoración (dep.) | ⚠️ | Crear, listar y borrar sí; **editar no** en la UI |
| CRUD Ingrediente (dep.) | ✅ | Panel admin, con valores nutricionales anidados |
| Listado recetas filtrado por categoría → detalle | ✅ | (29/09) `/buscar/recetas?categoria=ID`, o click en una categoría desde el buscador. Muestra nombre y descripción → detalle `/recetas/:id`. Mira **todas** las categorías de la receta (no solo la primera). |
| Listado recetas filtrado por valoración (con nombre del creador) → detalle | ✅ | (29/09) Filtro "Valoración" (3, 4 o 4,5 estrellas o más) y orden "Mejor puntuadas". La card muestra nombre, descripción, valoración y creador → detalle con los datos completos de la receta y del creador. |
| CU Crear y publicar recetas | ✅ | |
| CU Reseñar recetas de otros | ✅ | Impide reseñar la propia y reseñar dos veces |
| CU Consultar recetas según ingredientes disponibles | ✅ | (29/09) Filtro "Inventario" en `/buscar/recetas`, "Recetas guardadas" y el perfil (ver 5.3). |
| CU Sistema de donaciones | ❌ | T-4.3 |
| *Adicional:* listado por tiempo de preparación | ✅ | (29/09) Filtro "Tiempo de preparación" + orden "Menor tiempo". |
| *Adicional:* top 10 mejor valoradas en un plazo | ❌ | Opcional. Parte del trabajo ya está (orden "Mejor puntuadas"); faltaría filtrar las reseñas por fecha. |
| *Adicional:* filtro por necesidades nutricionales | ❌ | Opcional |
| *Adicional:* ChatBot IA | ❌ | Opcional. El banner de Chefcito Bot quedó armado en el buscador con el botón sin acción: si no se hace, pasarlo a "trabajo futuro" y sacar los botones (7.1). |
| **Extra no prometido y ya hecho** | ✅ | CRUD Rol + asignación a usuarios, Inventario, Valor nutricional, Pasos, Imágenes (subida real con multer), Recetas guardadas, Dashboard admin con métricas, fotos de perfil y portada, **buscador global con resultados rápidos, página de resultados y listados de categorías y perfiles**, métricas del usuario en su perfil (29/09). **Agregarlos a la propuesta**: suman como alcance adicional. |

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
- ⚪ Conectar el ítem "Explorar" de la sidebar ([Sidebar.jsx](../frontend/src/features/user/components/Sidebar.jsx),
  hoy deshabilitado) a `/buscar/recetas` (sin texto lista todas las recetas).
- 🟡 Recorrer las pantallas nuevas (buscador, listados y perfil) en 375 / 768 px y en modo
  claro: se revisaron en escritorio y modo oscuro, pero no en celular/tablet ni en modo claro.

### 5.2 🔴 Editar reseña

`updateReview` y `updateReviewPayload` existen en
[reviewService.js](../frontend/src/features/review/services/reviewService.js) y
[reviewModel.js](../frontend/src/features/review/models/reviewModel.js) pero ningún componente
los usa (verificado el 29/09). Agregar un botón "Editar" en `ReviewList` (solo para la reseña
propia) que abra `ReviewModal` precargado con `rating` y `comment`, y que en modo edición llame a
`updateReview`.

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

### 5.5 ⚪ ChatBot IA (adicional, T-5.1/T-5.2)

Solo si sobra tiempo después de todo lo anterior. Estado actual: la tarjeta "Consultá a la IA"
de la home ya no está (29/09), pero quedan el `FloatingAssistantButton` de la landing y el banner
de Chefcito Bot en el buscador ([AssistantBanner.jsx](../frontend/src/features/search/components/AssistantBanner.jsx),
botón visible sin acción, decisión del 29/09). Si **no** se hace: sacarlos antes de entregar y
pasar el ChatBot a "trabajo futuro" en la propuesta.

---

## 6. Mejoras en el backend

| # | Prio | Qué | Dónde | Cómo |
|:-:|:-:|---|---|---|
| 6.1 | 🟠 | Faltan scripts para producción y tests | [package.json](../backend/package.json) | `"build": "prisma generate && tsc"`, `"start": "node dist/app.js"`, `"test": "vitest run"`. Corregir `"main"` y `"description"`. |
| 6.2 | 🟠 | `PORT` y orígenes CORS hardcodeados | [app.ts](../backend/src/app.ts) | `const PORT = Number(process.env.PORT) \|\| 3000;` y `CORS_ORIGINS` separado por comas en el `.env`. Sin esto el deploy no funciona. |
| 6.3 | 🟠 | `app.ts` hace `listen` al importarse: no se puede testear con Supertest | [app.ts](../backend/src/app.ts) | Separar: `app.ts` arma y **exporta** `app`; nuevo `server.ts` hace `app.listen`. Actualizar el script `dev`. |
| 6.4 | 🟡 | `handleValidationErrors` copiado en **15 archivos** (se sumó el de `search`, con el mismo formato que el resto), y con dos formatos distintos: auth responde `{ errores }` y el resto `{ message, errors }` | `features/*/middleware/*ValidationMiddleware.ts` | Mover uno solo a `core/middleware/validationMiddleware.ts` con un único formato (`{ message, errors: [{ campo, mensaje }] }`). El front ya acepta los dos, así que no rompe nada. |
| 6.5 | 🟡 | 11 controllers vuelven a llamar `validationResult` aunque el middleware ya lo hizo | `features/*/controllers/*.ts` | Borrar ese bloque duplicado (código muerto; en la defensa pueden preguntar por qué está). El controller de `search` ya no lo hace. |
| 6.6 | 🟡 | 🔄 **Parcial (29/09).** Las recetas de `GET /api/recipes` no traen su promedio de valoración → el front hace **1 request por receta** (N+1) en la home, el perfil, el dashboard admin y la sección "Recetas sugeridas" de `/buscar` | `recipeRepository.ts`, [useRecipeReviewStats.js](../frontend/src/features/review/hooks/useRecipeReviewStats.js), [useProfileData.js](../frontend/src/features/user/hooks/useProfileData.js), [useAdminDashboard.js](../frontend/src/features/admin/hooks/useAdminDashboard.js) | El listado `/api/search/recipes` ya lo resuelve con `review.groupBy` (ver `searchRepository.findReviewStats`): reutilizar esa misma consulta en `recipeService` y agregar `averageRating`/`reviewCount` a cada receta, así se puede borrar el N+1. |
| 6.7 | 🟡 | `recipe.saveCount` **nunca se actualiza** (solo tiene el valor del seed) → ya no se muestra en el perfil (se quitaron las métricas), pero sigue sin actualizarse | `userRecipeService.ts` | Incrementar/decrementar en la misma transacción al guardar/desguardar, o calcularlo con `_count` y dejar de usar la columna. (El orden "Más populares" del buscador ya cuenta los guardados reales con `userrecipe.groupBy`, no usa esta columna.) |
| 6.8 | 🟡 | Dos caminos a la BD: el health check usa un pool `mysql2` aparte ([database.ts](../backend/src/database.ts)) y devuelve `error.message` crudo al cliente | `features/database/`, `database.ts` | Usar ``prisma.$queryRaw`SELECT 1` `` y borrar `database.ts`. Así se puede quitar `mysql2` y las variables `DB_HOST/PORT/USER/PASSWORD/NAME`: el `.env` queda solo con `DATABASE_URL` y `JWT_SECRET` (más simple para el profe y para el deploy). |
| 6.9 | 🟡 | Listados vacíos responden **404** en vez de `200 []` | category, ingredient, ingredientCategory, recipe, rol, user controllers | Un listado vacío no es "no encontrado". Devolver `200 []`. `fetchListOrEmpty` del front sigue funcionando igual. Los endpoints nuevos de `search` ya responden `200` con la lista vacía. |
| 6.10 | 🟡 | Las recetas de usuarios dados de baja siguen apareciendo en `GET /api/recipes` | `recipeRepository.findAll` | Agregar `where: { user: { deletedAt: null } }` en los listados públicos. El buscador ya las excluye. |
| 6.11 | ⚪ | Una ruta `/api/xxx` inexistente o un error inesperado devuelven HTML de Express | [app.ts](../backend/src/app.ts) | Al final: un middleware 404 JSON y un error handler `(err, req, res, next)` que responda `500 { message }`. |
| 6.12 | ⚪ | El chequeo "dueño o admin" está reimplementado a mano en inventario y en recetas guardadas | `inventoryRouter.ts`, `userRecipeController.ts` | Parametrizar `verifyOwnerOrAdmin(paramName = 'id')` en `authMiddleware.ts`. |
| 6.13 | ⚪ | `GET /api/categories` pide token, a diferencia de los demás catálogos (públicos) | [categoryRouter.ts](../backend/src/features/category/routes/categoryRouter.ts) | Hacerlo público si la landing lo necesita sin sesión (el buscador es solo para usuarios logueados, así que no lo necesita). |
| 6.14 | ⚪ | Se usa `prisma db push` sin migraciones | `prisma/` | Para el deploy alcanza con `db push`. Si hay tiempo, `prisma migrate dev --name init` deja historial versionado. |

---

## 7. Mejoras en el frontend

| # | Prio | Qué | Dónde | Cómo |
|:-:|:-:|---|---|---|
| 7.1 | 🔴 | 🔄 **Parcial (29/09).** Botones *Próximamente*. ✅ Las tarjetas de búsqueda e IA de la home ya no están (las reemplazó el buscador). Quedan: **Donar** (detalle de receta y perfil), **Seguir** (perfil de otro usuario, agregado el 29/09 a la espera de su funcionalidad), "Explorar" y "Notificaciones" en la sidebar, el `FloatingAssistantButton` de la landing y el botón del asistente IA en el buscador | [RecipeDetailPage.jsx](../frontend/src/features/recipe/pages/RecipeDetailPage.jsx), [ProfilePage.jsx](../frontend/src/features/user/pages/ProfilePage.jsx), [Sidebar.jsx](../frontend/src/features/user/components/Sidebar.jsx), `FloatingAssistantButton`, [AssistantBanner.jsx](../frontend/src/features/search/components/AssistantBanner.jsx) | Donar se resuelve con 5.4; "Explorar" se conecta a `/buscar/recetas` (5.1); "Seguir" necesita su tabla y sus endpoints (seguidores). Lo que no se haga, se saca de la UI antes de entregar. |
| 7.2 | 🟡 | La landing muestra **recetas inventadas** ([landingMockData.js](../frontend/src/features/landing/models/landingMockData.js)) | `ExploreSection`, `WeeklyRecipe`, `CommunitySection` | `GET /api/recipes` es público: mostrar recetas reales (ej. las mejor valoradas). Si nos preguntan "¿de dónde salen estos datos?", la respuesta tiene que ser "del backend". |
| 7.3 | 🟡 | Cambio de contraseña sin UI: [changePasswordService.js](../frontend/src/features/user/services/changePasswordService.js) no se usa en ningún lado | `EditProfileModal.jsx` | Agregar sección "Cambiar contraseña" (actual + nueva + confirmación) o borrar el servicio. |
| 7.4 | ✅ | ~~El filtro por categoría del perfil solo miraba la primera categoría de cada receta~~ (29/09): la galería del perfil ahora usa el listado del buscador (`authorId`), que filtra por cualquiera de las categorías, y las opciones del filtro salen de todas. | [ProfileRecipeGallery.jsx](../frontend/src/features/user/components/ProfileRecipeGallery.jsx) | — |
| 7.5 | 🟡 | `CategoryFormModal` duplicado (category/ e ingredientCategory/) y las tablas admin de categorías casi idénticas (239 líneas cada una) | `features/category/`, `features/ingredientCategory/`, `features/admin/components/` | Un solo modal/tabla genérica en `core/components/` que reciba título y servicio por props. |
| 7.6 | 🟡 | Faltan modelos (requisito de la cátedra + CLAUDE.md §7) | `features/user/models/` (solo tiene el de métricas del perfil), category, ingredient, role, nutritionalValue, image, step | Factory functions simples, ej. `createUserFromApi(raw)` y `toUpdateUserPayload(form)`, y que los servicios mapeen la respuesta cruda al modelo (como hace `search`: `searchModel.js` / `searchListingModel.js`). |
| 7.7 | 🟡 | Componentes > 200 líneas (CLAUDE.md §6) — medido el 29/09 | `AdminUsersTable` 353 · `AdminPage` 286 · `AdminIngredientsTable` 286 · `EditProfileModal` 279 · `NutritionalValuePanel` 262 · `RecipeEditorPage` 261 · `InventoryPage` 260 · `AdminRecipeCategoriesTable` 239 · `AdminIngredientCategoriesTable` 239 · `SearchUsersForm` 236 · `RecipePage` 209 | Extraer subcomponentes (filas, paginación, formularios) y hooks. `NutritionalValuePanel` está en `pages/` pero es un panel dentro de un modal → moverlo a `components/`. `RecipeEditorPage` ya se partió en secciones (PR #18) pero sigue arriba de 200 porque orquesta la carga, el guardado y el layout. Ningún componente del buscador ni del perfil nuevo pasa de 200 (`ProfilePage` 193). |
| 7.8 | ⚪ | `index.html` con `lang="en"` y título "chefcito" | [index.html](../frontend/index.html) | `lang="es"`, `<title>Chefcito</title>` y `<meta name="description">`. |
| 7.9 | ⚪ | Archivos y código sin uso | `src/assets/react.svg`, `vite.svg`, `hero.png`; `.gitkeep` en carpetas que ya tienen archivos (`auth/styles`, `user/styles`, `user/models`, `styles/`); `MasonryGrid` (core) quedó sin uso desde que la galería del perfil pasó a la grilla pareja del buscador (también lo nombra `CLAUDE.md`); desde el 29/09 también `getSavedRecipesByUser` + `savedRecipeFromApi` ([userRecipeService.js](../frontend/src/features/userRecipe/services/userRecipeService.js)), porque "Recetas guardadas" ahora usa el listado del buscador | Borrarlos (el endpoint `GET /saved-recipes/:idUser` del backend puede quedar: no molesta y sigue documentado). |
| 7.10 | ⚪ | Sin `.env.example` | `frontend/` | Crear `frontend/.env.example` con `VITE_API_BASE_URL=http://localhost:3000/api` (este sí se commitea). |
| 7.11 | ⚪ | SPA con `BrowserRouter`: al recargar `/admin` o `/buscar/recetas` en el deploy da 404 | raíz del frontend | Según el hosting: `vercel.json` con un rewrite a `/index.html`, o `public/_redirects` en Netlify. |

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
  `ingredientcategoryingredient` N:M, etc.). Mejor un `erDiagram` de Mermaid versionado en el repo
  (docs.md lo recomienda) que una imagen suelta en `user-attachments` + Google Drive.
- **Reclasificar CRUD Receta** como dependiente (depende de Usuario y Categoría).
- **Agregar el alcance extra ya hecho** (Rol, Inventario, Valor nutricional, Pasos, Imágenes,
  Recetas guardadas, Dashboard admin, **buscador con listados de categorías y perfiles**).
- **Agregar la sección de links a los PRs** (obligatoria en ambas entregas).
- Marcar como hecho el listado adicional "por tiempo de preparación" y decidir qué pasa con el
  ChatBot y los otros dos listados adicionales.

### 8.4 [CLAUDE.md](../CLAUDE.md)

- ✅ (29/09) Ya menciona las rutas del buscador (`/buscar`, `/buscar/recetas|categorias|usuarios`).
- Dice que el 422 devuelve `{ errores: [...] }`; en realidad casi todo devuelve
  `{ message, errors: [{ campo, mensaje }] }` (solo auth usa `errores`). Corregir cuando se
  unifique (6.4).
- Menciona `task-division.md`; el archivo se llama `tasks-division.md`.
- Ejemplos con `.tsx` (`RecipeCard.tsx`) y "React en TypeScript y JavaScript": el front es solo
  JS/JSX.
- Referencia al "IDE Antigravity": quitar o generalizar.

### 8.5 [backend/README.md](../backend/README.md)

- ✅ (29/09) Ya lista la feature `search/` en el árbol de carpetas.
- Describe `database/` como "endpoint de inicialización/seed (solo dev)"; es solo un health check.
- El ejemplo de `handleValidationErrors` no coincide con el formato real.
- Dice que los handlers llevan prefijo `handle`; los controllers se llaman `searchX`, `createX`,
  `getXById`, etc.
- La checklist de AD (§13) hay que ir tildándola a medida que avancen los tests.

### 8.6 [tasks-division.md](tasks-division.md)

- Agregar una columna **Estado** (✅ / 🔄 / ⏳) a cada T-X.X. Hoy: T-4.1 ✅, **T-4.2 ✅** y
  **T-4.4 🔄** (filtros por tiempo y valoración ✅, guardar recetas ✅, recomendaciones ⏳),
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
| Backend × 4 (1 por integrante) | Unitario | **El más fácil de arrancar:** `computePantryMatch` y `comparePantryMatches` de [pantryMatchService.ts](../backend/src/features/search/services/pantryMatchService.ts) (funciones puras, no hace falta mockear nada; casos: completa, falta cantidad, cantidad en 0, no la tiene, receta sin ingredientes, orden). Además, services con el repository mockeado (`vi.mock`): `reviewService.createReview` (rechaza reseñar la propia / duplicada), `recipeService.updateRecipe` (403 si no es dueño), `authService.login` (credenciales inválidas, `isAdmin`), `searchService.listRecipes` (filtro por valoración y orden), reglas de donación | `vitest` |
| Backend × 1 | Integración | Con Supertest sobre `app` (requiere 6.3) contra una BD de test (`.env.test` con otra `DATABASE_URL`): login → token → `GET` de ruta protegida (200) y sin token (401), o crear receta y encontrarla con `GET /api/search/recipes?q=` | `supertest`, `@types/supertest` |
| Frontend × 1 | Unitario de componente | `ErrorState` (muestra el mensaje y llama `onRetry` al hacer click), `StarRating`, `ConfirmModal` o `SearchPagination` (deshabilita "anterior" en la página 1 y llama `onPageChange`) | `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` |
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
| Base de datos | MySQL gestionado: Railway, Aiven (free), Clever Cloud, TiDB Serverless (compatible con MySQL) | Correr `npx prisma db push` contra esa URL y cargar `demo-seed.sql`. ⚠️ El buscador confía en que la collation de MySQL no distinga mayúsculas ni tildes ("maria" encuentra "María"): verificar que la BD en la nube use la misma (ej. `utf8mb4_0900_ai_ci`). |
| Backend | Render o Railway | Necesita 6.1 y 6.2. Variables: `DATABASE_URL`, `JWT_SECRET` (**uno nuevo**, no el de la guía, que es público en el repo), `CORS_ORIGINS`, `PORT`. |
| Frontend | Vercel o Netlify | `VITE_API_BASE_URL` apuntando al backend deployado. Rewrites para la SPA (7.11). |
| Imágenes | — | ⚠️ Las fotos se guardan en `backend/uploads/` (disco local). En Render free el disco se borra en cada redeploy → las fotos subidas se pierden. Opciones: Railway con volumen persistente, o aceptar que en la demo se usen links externos. Decidirlo antes de elegir hosting. |

Después: `docs/deploy.md` con los links y las credenciales de demo (admin + un usuario común).

---

## 12. Reparto sugerido

Actualizado el 29/09. **5.1 y 5.3 ya están hechos**, así que sale de la lista lo que eran T-4.2 y
T-4.4. Lo que sigue importando para la cátedra es que **cada integrante tenga su propio test y
pueda defender un CU** (aunque no lo haya programado él: en la defensa tiene que saber
explicarlo). Es una propuesta: ajustarla en la próxima reunión.

| Integrante | Funcionalidad pendiente | Test propio (backend) | Otras tareas | CU que defiende |
|---|---|---|---|---|
| **Stéfano** (Dev A) | Deploy completo (6.1, 6.2, 6.3, 7.11, 11) · editar reseña (5.2) · commitear `task/Frontend-Updates` y abrir el PR a `develop` | Integración (Supertest) + unitario de `reviewService` | README raíz, índice de docs, propuesta, GitHub Project, revisar PRs | Reseñar recetas |
| **Elías** (Dev B) | Documentación de la API (10) · quitar el N+1 de valoraciones (6.6) | Unitario de `pantryMatchService` (despensa) | Revisar a mano las pantallas del buscador en los 3 breakpoints | Consultar recetas según ingredientes |
| **Juan** (Dev C) | T-4.3 Donaciones (5.4) | Unitario de `donationService` | Test E2E con Playwright (T-5.3) · sacar los *Próximamente* que queden (7.1) | Donar a creadores |
| **Gastón** (Dev D) | Conectar "Explorar" de la sidebar (5.1) · landing con datos reales (7.2) | Unitario de `recipeService` (permisos) o de `searchService.listRecipes` | Test unitario de componente (front) · minutas | Crear y publicar recetas (+ listados) |

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
- **Tests:** qué prueba el suyo y cómo se corre.

---

## 14. Checklist final de entrega AD

Formulario: https://kutt.to/DSWEntregaSistemaFinal

- [x] Listados con filtro (categoría y valoración) + detalle — 29/09
- [ ] Editar reseña en la UI
- [x] CU Recetas según ingredientes — 29/09
- [ ] CRUD + CU Donaciones
- [ ] Sin botones *Próximamente* ni datos falsos en la UI (quedan Donar, Explorar/Notificaciones, asistente IA y la landing)
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
- [ ] Video demo (recorrer los 4 CU, los CRUDs, el buscador y el panel admin)
- [ ] PR `develop` → `main` para la entrega
- [ ] Coordinar la fecha de defensa con los docentes

---

## Anexo A — Inventario de endpoints actual

Al día al 29/09. Base: `/api`. **Público** = sin token · **Token** = cualquier usuario logueado ·
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
| Búsqueda rápida | `GET /search?q=texto` (primeras coincidencias + total de categorías, recetas y usuarios) | Token |
| Listados de búsqueda | `GET /search/recipes` (`?q`, `categoryId`, `authorId`, `maxTime`, `minTime`, `minRating`, `ingredientIds`, `pantry`, `savedOnly`, `sort`, `page`) · `GET /search/categories` y `GET /search/users` (`?q`, `onlyWithRecipes`, `sort`, `page`) | Token (la despensa y las guardadas son las del usuario del token) |
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
