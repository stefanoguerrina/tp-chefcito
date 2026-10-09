# Análisis del estado del proyecto — Chefcito

> **Última actualización:** 30/09/2026 · **Rama analizada:** `develop` (commit `c93358f`, incluye
> hasta el PR #27 con las donaciones).
> **Objetivo:** saber dónde estamos parados y qué falta para la **Aprobación Directa (AD)**. Se
> compara lo que pide la cátedra ([README.md](README.md), [FAQ.md](FAQ.md), [docs.md](docs.md)) y
> lo que prometimos en la [propuesta](proposal.md) contra lo que hay hoy en el código.
> Lo que ya se resolvió **se saca** de este documento (queda en el historial de git y en los PRs):
> acá solo figura lo que está pendiente o lo que hay que tener en cuenta.

| Marca | Significado |
|:-:|---|
| 🔴 | Obligatorio ya para la **regularidad** (sin esto no se puede entregar). |
| 🟠 | Obligatorio para la **AD**. |
| 🟡 | Mejora de calidad: nos pueden preguntar o bajar nota en la defensa. |
| ⚪ | Opcional / prolijidad. |

---

## 1. Dónde estamos

**Lo funcional está completo.** Todo lo que prometimos en la propuesta (CRUDs, listados, los 4
casos de uso y los 3 listados adicionales + el ChatBot) está implementado y llega a la UI. Además
se sumó bastante alcance que no estaba prometido (ver 2). En el código no queda ningún botón
*Próximamente*. `tsc --noEmit` (back), `npm run lint` y `npm run build` (front) pasan sin errores
(verificado el 30/09).

**Lo que falta es casi todo "alrededor" del código:** tests, documentación (propuesta, README,
API, minutas, tracking), deploy y video. Eso es justamente lo que más pesa en la entrega AD y
todavía no arrancó.

**Lo que falta para AD, en orden de urgencia:**

| # | Prio | Qué | Ver |
|:-:|:-:|---|:-:|
| 1 | 🔴 | **Propuesta actualizada** (stack, DER nuevo, alcance extra) **con los links a los PRs** | 6.3 |
| 2 | 🔴 | **`README.md` en la raíz** con instalación + **`docs/README.md` como índice** | 6.1 |
| 3 | 🔴 | **Minutas, metodología y tracking** (GitHub Project) | 6.2 |
| 4 | 🟠 | **Tests**: 4 unitarios de backend (1 por integrante) + 1 de integración + 1 de componente + 1 E2E, y la evidencia | 7 |
| 5 | 🟠 | **Deploy** (back + front + BD + fotos) y credenciales de demo | 9 |
| 6 | 🟠 | **Documentación de la API** | 8 |
| 7 | 🟠 | **Listado de donaciones** (enviadas / recibidas / admin), para cerrar el CRUD de Donación | 3.2 |
| 8 | 🟠 | `.env.example` en back y front (instalar sin saber cómo está hecho) | 6.1 |
| 9 | 🟠 | Video demo | 12 |
| 10 | 🟡 | Landing con datos reales (hoy muestra recetas inventadas) | 5 (F1) |
| 11 | 🟡 | Mejoras de código de las secciones 4 y 5, repartidas al final | 4, 5 |

### 1.1 Calendario

Fechas de la cátedra: **1ª entrega Regularidad/AD 12/10–16/10**, recuperatorio 26/10–30/10,
última instancia 9/11–13/11. Hoy es 30/09: **quedan 12 días** para la primera ventana.

| Semana | Objetivo | Qué entra |
|---|---|---|
| **30/09 – 04/10** | Documentación de regularidad + arrancar tests | Propuesta + DER + links a PRs, README raíz e índice, GitHub Project, minutas y metodología, `.env.example`. Configurar Vitest en back y front (acordar las dependencias en el grupo). Listado de donaciones. |
| **05/10 – 11/10** | Completar AD | Todos los tests + evidencia, documentación de la API, deploy funcionando y probado desde el celular, landing con datos reales. |
| **12/10 – 16/10** | Entrega | Cargar el seed justo antes, video, formulario de entrega, PR `develop` → `main`, coordinar la defensa. |
| 26/10 – 30/10 | Plan B | Si no llegamos con la AD completa, se entrega acá (mejor llegar bien que a medias). |

### 1.2 PRs mergeados desde el primer análisis (28/09)

Sirve también para la sección de links a los PRs de la propuesta (6.3).

| PR | Qué trajo |
|---|---|
| #18 | Editor de recetas por secciones, portada del perfil, `onDelete: Restrict` en ingredientes. |
| #19 | Buscador (resultados rápidos + `/buscar`), **listados con filtros** `/buscar/recetas\|categorias\|usuarios`, **filtro "Inventario"** (CU recetas según ingredientes), perfil en 3 pantallas, "Recetas guardadas" con filtros. |
| #21 | **Chefcito Bot** (asistente IA con Gemini). |
| #22 | **Seguir usuarios** (tabla `follow`) y **home** con recetas/reseñas de amigos y **Top 10 de la semana**. |
| #23 | Feedback del profesor: sin N+1 ni pedidos repetidos, acentos del seed, campos obligatorios con `*` y error por campo, **editar reseña**, `PORT`/`CORS_ORIGINS` por `.env`. |
| #24 | Panel admin rediseñado: sin "Actualizar", alta de usuarios desde la tabla, `/admin/summary` y `/admin/users` paginado, foto y valores nutricionales de ingredientes, recetas de usuarios dados de baja ocultas. |
| #25 | Landing rediseñada (todavía con datos de ejemplo, ver F1). |
| #26 | **Valores nutricionales por porción** en el detalle (`recipe.servings`), **listado por necesidades nutricionales**, detalle de receta en 2 pedidos, restauración de `schema.prisma`. |
| #27 | **Donaciones con Mercado Pago** (ver 3). |

> ⚠️ Después de bajar `develop`: correr `npx prisma db push` (el esquema cambió en #22, #24 y
> #26) y cargar las secciones 8 y 9 de `demo-seed.sql` si la base es anterior. **No usar
> `prisma db pull`**: el esquema del repo es la fuente de verdad (en #25 volvió a una versión vieja,
> probablemente por un `db pull`, y hubo que restaurarlo en #26).

---

## 2. Requisitos: qué está cumplido y qué no

### 2.1 Propuesta vs. implementado

| Ítem de la propuesta | Estado | Dónde |
|---|:-:|---|
| CRUD Usuario, Categoría-Ingrediente, Categoría-Receta | ✅ | Registro/perfil + panel admin |
| CRUD Receta | ✅ | "Mis recetas" + editor. En la propuesta figura como *simple*, pero depende de Usuario y Categoría → es *dependiente* (corregirlo, 6.3). |
| CRUD Valoración (dep.) · CRUD Ingrediente (dep.) | ✅ | Detalle de receta · panel admin (con foto y valores nutricionales) |
| Listado por categoría → detalle | ✅ | `/buscar/recetas?categoria=` → `/recetas/:id` |
| Listado por valoración (con creador) → detalle | ✅ | Filtro "Valoración" + orden "Mejor puntuadas" |
| CU Crear y publicar recetas · CU Reseñar recetas | ✅ | |
| CU Recetas según ingredientes disponibles | ✅ | Filtro "Inventario" (listados, guardadas, perfil) |
| CU Sistema de donaciones | ✅ | Botón "Donar" en detalle y perfil ajeno. Falta el listado (ver 3.2). |
| *Adicional:* listado por tiempo de preparación | ✅ | Filtro "Tiempo" + orden "Menor tiempo" |
| *Adicional:* top 10 semanal | ✅ | "Top 10 de la semana" en la home: promedio con las reseñas de los últimos 7 días. En la propuesta quedó como listado **semanal** (30/09). |
| *Adicional:* listado por necesidades nutricionales | ✅ | Grupo "Necesidades nutricionales" en `/buscar/recetas` (por porción) |
| *Adicional:* CU recetas por categoría · CU mejor valoradas de la semana | ✅ | `/buscar/categorias` → recetas de la categoría · Top 10 de la home |
| *Adicional:* ChatBot IA | ✅ | Chefcito Bot, botón flotante en todas las secciones ([asistente-ia.md](asistente-ia.md)) |

**Hecho y no prometido** (agregarlo a la propuesta como alcance adicional, suma nota): CRUD Rol +
asignación, Inventario, Valor nutricional (entidad débil) y cálculo por porción, Pasos, Imágenes
con subida real, Recetas guardadas, dashboard admin con métricas, fotos de perfil/portada,
buscador global con listados de categorías y perfiles, métricas del perfil, **seguir usuarios** y
home con feed de amigos, modo claro/oscuro, pagos reales (sandbox) con Mercado Pago.

### 2.2 Requisitos de la cátedra

Solo se listan los que **no** están completos. El resto (Express con middlewares, API REST, MySQL
con Prisma, capas, validación con errores claros, login JWT con 2 niveles, rutas protegidas en
back y front, React + SASS mobile-first con 3 breakpoints, eventos, errores amigables, input/output
properties, servicios, patrones OO) está cumplido.

| Requisito | Nivel | Estado | Qué falta |
|---|:-:|:-:|---|
| Declarar tecnologías distintas a las de la cátedra | Reg | ❌ | React en lugar de Angular, TypeScript, Prisma, MySQL: **tiene que estar en la propuesta** (FAQ). |
| Modelos con clases/tipos custom (front) | Reg | ⚠️ | Faltan en category, ingredientCategory, image, step, nutritionalValue, recipeIngredient y el usuario en sí (F3). |
| UX sin manual / sin datos falsos | Reg | ⚠️ | La landing muestra recetas inventadas (F1). |
| Dependencias de test registradas | Reg | ❌ | `npm test` es un placeholder; no hay dependencias de test (7). |
| 1 test por integrante + 1 de integración (back) | AD | ❌ | Ver 7. |
| 1 test de componente + 1 E2E (front) | AD | ❌ | Ver 7. |
| Ambientes (.env) | AD | ⚠️ | Hay `.env` y el back lee `PORT`, `CORS_ORIGINS`, `FRONTEND_URL`, etc., pero **no hay `.env.example`** ni ambiente de test (BD aparte) ni de producción. |
| CRUDs de **todas** las clases de negocio | AD | ⚠️ | Donación solo tiene alta y consulta de una (3.2). El resto, completo. |
| 1 CU por integrante, ≥2 relacionados | AD | ✅ | 4 de 4. "Recetas según ingredientes" usa Inventario + Crear recetas; "Donar" se hace desde las recetas y perfiles de los creadores. "Seguir" es un CU extra. |

### 2.3 Entregables y documentación ([docs.md](docs.md))

| Entregable | Reg | AD | Estado |
|---|:-:|:-:|---|
| Propuesta actualizada + links a los PRs | X | X | ❌ Desactualizada y sin links (6.3) |
| Instrucciones de instalación en el README | X | X | ⚠️ Están en [guia-profesor.md](guia-profesor.md), pero **no hay `README.md` en la raíz** |
| Minutas de reunión y avance | X | X | ❌ |
| Tracking de features, bugs e issues | X | X | ❌ No hay GitHub Project ni estado en [tasks-division.md](tasks-division.md) |
| Metodología ágil usada | X | X | ❌ No está escrita |
| `docs/README.md` como índice, enlazado desde el README raíz | X | X | ❌ Hoy `docs/README.md` es la consigna |
| Documentación de la API | | X | ❌ (hay una parte en [donaciones.md](donaciones.md) y el [Anexo A](#anexo-a--endpoints)) |
| Evidencia de ejecución de tests | | X | ❌ |
| Video demo | | X | ❌ |
| Deploy + credenciales | | X | ❌ |
| Contacto para la defensa | | X | ❌ (va en el formulario) |

---

## 3. Donaciones (PR #27): revisión

### 3.1 Qué se hizo y qué está bien

La cátedra **no pide nada específico sobre pagos**: la consigna y el FAQ no mencionan pasarelas
ni medios de pago; lo único es nuestro CU "Sistema de donaciones a creadores" de la propuesta, y
la [división de tareas](tasks-division.md) (T-4.3) hablaba de una *simulación* de transacción.
Usar **Mercado Pago Checkout Pro con cuentas de prueba** (vendedor y comprador de prueba, como
recomendó el profesor) va más allá de eso y suma en "innovación y desafíos asumidos".

Lo que está bien resuelto (y conviene saber explicar en la defensa):

- **Montos fijos en el backend** ("Un cafecito" $1.000 … "Un asado" $10.000,
  [donationModel.ts](../backend/src/features/donation/models/donationModel.ts)): el front manda
  solo el id, así que nadie cambia el precio desde el navegador.
- **El estado nunca se toma de la URL**: siempre se le consulta a Mercado Pago (por `payment_id` o
  por `external_reference`).
- **No depende del "Volver al sitio"** (que en local no aparece): el modal abre el checkout en otra
  pestaña y consulta el estado cada 4 s.
- **Pendientes que vencen**: el link de pago dura 30 min y cada 10 min el backend cierra las
  pendientes (`completed` si se pagó sin volver, `expired` si no).
- Reglas: no donarse a uno mismo, solo a usuarios activos, solo el donante consulta su donación
  (las ajenas responden 404, sin revelar que existen). Sin Mercado Pago configurado → 503 con un
  mensaje claro y el resto de la app anda igual.
- Sigue la estructura de siempre (router → validación → controller → service → repository),
  services con `{ ok, reason }`, y sin SDK: `fetch` directo a la API de Mercado Pago.
- Está documentado en [donaciones.md](donaciones.md) (flujo en Mermaid, endpoints, configuración
  y limitaciones).

### 3.2 Qué falta o se puede mejorar

| # | Prio | Qué | Cómo |
|:-:|:-:|---|---|
| D1 | 🟠 | **No hay ningún listado de donaciones.** Solo existe "crear" y "consultar una por su referencia", y nadie ve lo donado: ni el donante, ni el creador que la recibe, ni el admin. Para la AD ("CRUDs de todas las clases de negocio") es lo que más flojo queda. | Backend: `GET /api/donations/sent` y `/received` (del usuario del token) y `GET /api/admin/donations?status=` (admin, paginado como `/admin/users`). Front: sección "Donaciones" en el perfil propio (enviadas / recibidas, con estado) y una tabla en el panel admin (sirve además como otro listado con filtro). Opcional: "Donaciones recibidas" en las métricas del perfil y en `/admin/summary`. |
| D2 | 🟠 | **Justificar el "U" y el "D" del CRUD.** Una donación es un registro de pago: no tiene sentido editar el monto ni borrarla. | Decirlo así en la propuesta y en la defensa: el estado lo actualiza Mercado Pago (U) y no se borra para no falsear el historial. Si el grupo quiere un "D" explícito: que el admin pueda **anular una donación `pending`** (queda `cancelled`). |
| D3 | 🟠 | **La guía del profesor no dice cómo probar las donaciones.** Sin `MERCADOPAGO_ACCESS_TOKEN` el profe solo ve "falta configurar Mercado Pago". | En el deploy, el token va en las variables del hosting y en la entrega se pasan las **credenciales del comprador de prueba** + tarjeta de prueba (`APRO`). En [guia-profesor.md](guia-profesor.md), una sección "Donaciones" que enlace a [donaciones.md](donaciones.md). **No commitear el access token**, aunque sea de prueba. |
| D4 | 🟡 | `confirmPayment` puede **pisar una donación `completed`**: si hubo dos intentos (uno rechazado y otro aprobado) y el usuario vuelve con el `payment_id` del rechazado (ej. desde una pestaña vieja), la donación pasa a `rejected`. | En [donationService.ts](../backend/src/features/donation/services/donationService.ts): si la donación ya está `completed`, devolverla sin cambiar el estado. |
| D5 | 🟡 | El `setInterval` que vence las pendientes está en el `listen` de `app.ts`. | Al separar `app.ts` y `server.ts` para los tests (B1), moverlo a `server.ts`, así los tests de integración no arrancan el timer. |
| D6 | 🟡 | Tests. | `toDonationStatus` y `statusFromPayments` son funciones puras (exportarlas y testearlas: aprobado, rechazado, varios intentos, sin pagos) y `createCheckout` con el repository y Mercado Pago mockeados (sin configurar, monto inválido, donarse a sí mismo, usuario dado de baja). |
| D7 | ⚪ | En el deploy (https) conviene un **webhook** (`notification_url`) para confirmar al instante aunque el usuario cierre todo. | Endpoint público `POST /api/donations/webhook` que vuelva a consultar el pago a Mercado Pago (nunca confiar en el body). Solo si sobra tiempo. |
| D8 | ⚪ | `demo-seed.sql` no tiene donaciones: el listado (D1) y el admin arrancarían vacíos. | Sumar unas donaciones `completed` de ejemplo al seed cuando exista D1. |
| D9 | ⚪ | El comentario de `donationFromApi` ([donationModel.js](../frontend/src/features/donation/models/donationModel.js)) lista 3 estados; falta `expired`. | Corregir el comentario. |

**Quién lo hizo / quién lo defiende:** T-4.3 estaba asignada a Juan (Dev C), pero el commit es de
Gastón. Actualizar [tasks-division.md](tasks-division.md) y definir quién defiende el CU (ver 11).

---

## 4. Mejoras pendientes en el backend

| # | Prio | Qué | Cómo |
|:-:|:-:|---|---|
| B1 | 🟠 | `app.ts` hace `listen` al importarse (no se puede testear con Supertest) y no hay script de tests | `app.ts` arma y **exporta** `app`; `server.ts` hace `listen` y arranca el timer de donaciones. Actualizar `dev`/`start` y agregar `"test"` en [package.json](../backend/package.json) (completar también `"description"`). |
| B2 | 🟡 | `handleValidationErrors` copiado en **16 features**, con dos formatos (auth responde `{ errores }`, el resto `{ message, errors }`). Ya existe el único en [validationMiddleware.ts](../backend/src/core/middleware/validationMiddleware.ts) (lo usan follow, feed y donation) | Borrar cada copia local e importar el de `core`. El front acepta los dos formatos, no rompe nada. |
| B5 | 🟡 | Dos caminos a la BD: el health check usa un pool `mysql2` aparte ([database.ts](../backend/src/database.ts)) y devuelve `error.message` crudo | ``prisma.$queryRaw`SELECT 1` `` y borrar `database.ts`: se puede quitar `mysql2` y las `DB_HOST/PORT/USER/PASSWORD/NAME` del `.env` (más simple para el profe y el deploy). |
| B7 | ⚪ | Columna `recipe.saveCount` que nunca se actualiza ni se usa (el orden "Más populares" cuenta los guardados reales) | Sacarla del esquema (`db push`) o dejarla y saber explicarlo. |
| B8 | ⚪ | El chequeo "dueño o admin" está hecho a mano en inventario y recetas guardadas | Parametrizar `verifyOwnerOrAdmin(paramName = 'id')`. |
| B9 | ⚪ | La consulta "promedio y cantidad de reseñas por receta" está 3 veces (search, feed, recipe) | Una sola en `review/repository` y reutilizarla. |
| B10 | ⚪ | `feedService.getTopRecipes` pide las cards de todas las recetas con reseñas en el plazo | Con pocos datos no se nota; si crece, pedir solo `limit + margen`. |
| B11 | ⚪ | `prisma db push` sin migraciones: cada cambio de esquema obliga a todos a correr `db push` | Para el deploy alcanza. Si hay tiempo, `prisma migrate dev --name init`. Mientras tanto, avisarlo en cada PR que toque `schema.prisma`. |

---

## 5. Mejoras pendientes en el frontend

| # | Prio | Qué | Cómo |
|:-:|:-:|---|---|
| F1 | 🟡 | **La landing muestra recetas inventadas** ([landingMockData.js](../frontend/src/features/landing/models/landingMockData.js), `momentRecipes` en "Top recetas"). El rediseño (#25) las mantuvo. Si preguntan "¿de dónde salen estos datos?", la respuesta tiene que ser "del backend". | `GET /api/feed/top-recipes` pide token: agregar una versión pública (ej. `GET /api/recipes/top`, sin datos del usuario) y un `services/` + modelo en `landing`. |
| F2 | 🟡 | **Recorrer todo en 375 / 768 px y en modo claro**: casi todo se ajustó en escritorio y modo oscuro (home, perfil, buscador, panel admin nuevo, landing nueva, modal de donación, tabla nutricional) | Antes de grabar el video. Probar también en el navegador de la defensa (la home usa `@container` y `:has()`). |
| F3 | 🟡 | **Faltan modelos** (requisito de regularidad) en category, ingredientCategory, image, step, nutritionalValue, recipeIngredient y el usuario (`user/models` solo tiene el de métricas) | Factory functions simples (`categoryFromApi`, `userFromApi`, …) y que los servicios mapeen la respuesta, como ya hacen search, feed o donation. |
| F4 | 🟡 | Cambio de contraseña sin UI: [changePasswordService.js](../frontend/src/features/user/services/changePasswordService.js) no se usa | Sección "Cambiar contraseña" en `EditProfileModal` (actual + nueva + confirmación) o borrar el servicio. |
| F5 | 🟡 | Componentes de más de 200 líneas (CLAUDE.md §6): `EditProfileModal` 313 · `RecipeEditorPage` 281 · `InventoryPage` 260 · `AdminUsersTable` 249 · `AdminIngredientsTable` 244 · `AdminRecipeCategoriesTable` 239 · `AdminIngredientCategoriesTable` 239 · `ProfilePage` 228 · `RolePage` 213 · `RecipePage` 202 | Extraer filas, formularios y hooks. Las dos tablas de categorías y los dos `CategoryFormModal` (category/ e ingredientCategory/) son casi iguales: unificarlos en un componente que reciba título y servicio por props baja dos de golpe. |
| F6 | ⚪ | Código y archivos sin uso: `assets/react.svg`, `vite.svg`, `hero.png`; `MasonryGrid` (core); `getSavedRecipesByUser` + `savedRecipeFromApi`; `.gitkeep` en `auth/styles`, `user/models`, `user/styles`, `styles/` | Borrarlos. |
| F7 | ⚪ | Los textos del filtro "Inventario" todavía dicen "despensa" | Unificar el nombre. |
| F8 | ⚪ | Acceso directo "¿Qué puedo cocinar?" desde "Mi inventario" | Botón → `/buscar/recetas?despensa=1`. |
| F9 | ⚪ | Solo hay contadores de seguidores/seguidos, no la lista | Endpoint + modal con la lista. |
| F10 | ⚪ | Bundle de 517 kB (Vite avisa al hacer `build`) | `React.lazy` en `App.jsx`, empezando por el panel admin. |

---

## 6. Documentación y gestión del proyecto (🔴)

### 6.1 README raíz, índice y `.env.example`

La cátedra pide `docs/README.md` como **punto de entrada**, enlazado desde el `README.md` del
proyecto. Hoy no hay README raíz y `docs/README.md` es la consigna. Propuesta:

```
README.md                      ← NUEVO: qué es Chefcito, integrantes, stack, instalación y link a docs/
backend/.env.example           ← NUEVO: todas las variables, sin secretos
frontend/.env.example          ← NUEVO: VITE_API_BASE_URL=http://localhost:3000/api
docs/
├── README.md                  ← NUEVO: índice de toda la documentación
├── consigna/                  ← mover acá README.md, FAQ.md y docs.md de la cátedra (sin tocarlos)
├── proposal.md                ← actualizar (6.3)
├── guia-profesor.md           ← instalación y demo (sumar donaciones, D3)
├── der.md                     ← NUEVO: DER en Mermaid (erDiagram) a partir de schema.prisma
├── metodologia.md, minutas/, tracking.md   ← NUEVOS (6.2)
├── api.md u openapi.yaml      ← NUEVO (8)
├── tests.md                   ← NUEVO: cómo correrlos + evidencia (7)
├── deploy.md                  ← NUEVO: links, credenciales, variables (9)
├── asistente-ia.md, donaciones.md, demo-seed.sql
└── analisis-estado-proyecto.md ← este documento
```

Si se mueven los archivos de la consigna, actualizar las rutas que los mencionan en `CLAUDE.md`.

### 6.2 Minutas, tracking y metodología

- **Tracking:** un **GitHub Project** (Kanban: *Todo / In progress / Review / Done*) con un issue
  por cada pendiente de este documento y por cada bug; cada PR enlaza su issue (`Closes #N`). Link
  en `docs/tracking.md`. Sumar una columna **Estado** a [tasks-division.md](tasks-division.md)
  (Fases 1–4 ✅; T-4.4 ✅ salvo "recomendaciones personalizadas", que se puede dar por cubierta con
  la home de amigos + Top 10 o sacarla; Fase 5: IA ✅, QA ⏳).
- **Minutas:** desde ahora, una por reunión (fecha, presentes, qué se hizo, qué se decidió, quién
  hace qué). Para lo anterior, un resumen honesto por fase con las fechas reales de los PRs —
  **no inventar reuniones que no existieron**.
- **Metodología:** escribir la que usamos de verdad (ej. Kanban por fases de la task-division),
  el flujo de ramas y quién revisa los PRs.
- **Convención de git:** la documentada es `feature/T-X.X-...` y commits `[T-X.X] ...`; en la
  práctica se usa `task/...` y mensajes libres. Elegir una y actualizar
  [tasks-division.md](tasks-division.md) (la cátedra evalúa el uso de git).

### 6.3 [proposal.md](proposal.md)

- **Declarar el stack** (lo exige el FAQ): React + Vite en vez de Angular, TypeScript en el
  backend, Express 5, Prisma, MySQL, Mercado Pago (sandbox) y Gemini.
- **DER nuevo**: el de la imagen es anterior a `role`/`userrole`, la N:M de categorías de
  ingrediente, **`follow`**, `recipe.servings`, las fotos (`avatarUrl`, `coverUrl`,
  `ingredient.imagePath`), etc. Mejor un `erDiagram` de Mermaid en el repo que la imagen suelta.
- **CRUD Receta** como *dependiente* y **Donación** en la tabla de CRUDs de aprobación.
- **Alcance adicional hecho y no prometido** (lista en 2.1).
- ✅ (30/09) El listado y el CU del Top 10 ya dicen **semanal** (antes "en un plazo solicitado").
- **Sección de links a los PRs** (obligatoria en las dos entregas; la tabla de 1.2 sirve de base,
  sumando los anteriores #1–#17).

### 6.4 Otros documentos a corregir

- [CLAUDE.md](../CLAUDE.md): dice que el 422 devuelve `{ errores }` (casi todo devuelve
  `{ message, errors }`, ver B2); ejemplos con `.tsx` y "React en TypeScript y JavaScript" (el
  front es solo JS/JSX); la referencia al "IDE Antigravity".
- [backend/README.md](../backend/README.md): el ejemplo de `handleValidationErrors` no coincide
  con el real; dice que los handlers llevan prefijo `handle` (los controllers se llaman
  `createX`, `getXById`, …); la tabla de features no nombra `donation/` ni `admin/`; tildar la
  checklist de AD a medida que avancen los tests.

---

## 7. Tests (🟠 AD)

> Agregan dependencias de desarrollo: **acordarlo en el grupo antes** (regla de CLAUDE.md).
> Propuesta: **Vitest** en back y front (misma sintaxis, anda con Vite y TypeScript),
> **Supertest** para integración y **Playwright** para E2E.

| Test | Tipo | Candidatos (de más fácil a más difícil) | Dependencias |
|---|---|---|---|
| Backend × 4 (1 por integrante) | Unitario | **Funciones puras, sin mocks:** `computeRecipeNutrition` ([recipeNutritionService.ts](../backend/src/features/recipe/services/recipeNutritionService.ts)), `computePantryMatch` / `comparePantryMatches` ([pantryMatchService.ts](../backend/src/features/search/services/pantryMatchService.ts)), `statusFromPayments` de donaciones (D6). **Services con el repository mockeado** (`vi.mock`): `donationService.createCheckout`, `reviewService.createReview` (propia / duplicada), `followService` (a uno mismo, dos veces, inexistente), `feedService.getTopRecipes` (orden, desempate, plazo), `recipeService.updateRecipe` (403 si no es dueño), `authService.login`. | `vitest` |
| Backend × 1 | Integración | Supertest sobre `app` (requiere B1) contra una **BD de test** (`.env.test` con otra `DATABASE_URL`): login → token → ruta protegida (200) y sin token (401), o crear receta y encontrarla en `GET /api/search/recipes?q=`. | `supertest`, `@types/supertest` |
| Frontend × 1 | Componente | `ErrorState` (muestra el mensaje y llama `onRetry`), `StarRating`, `ConfirmModal`, `UserAvatar` (cae a las iniciales si falla la foto). Sin componentes: `formatRelativeTime`, `formatDonationAmount`. | `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` |
| Frontend × 1 | E2E | Con back, front y seed: login con `juanperez` → buscar "fideos" → abrir la receta; o login admin → redirige a `/admin`. | `@playwright/test` |

- Scripts `"test"` en los dos `package.json` y `"test:e2e"` en el front.
- **Evidencia:** salida de consola + reporte HTML de Playwright (captura) en `docs/tests.md`.
- La BD de test **no** puede ser la de desarrollo (los tests escriben datos): eso también cubre
  "definir ambientes".

---

## 8. Documentación de la API (🟠 AD)

- **Recomendada:** `docs/openapi.yaml` (OpenAPI 3) y, si el grupo acepta la dependencia,
  `swagger-ui-express` en `/api/docs` para probar en vivo.
- **Mínima (sin dependencias):** `docs/api.md` con una tabla por recurso: método, ruta, acceso,
  body, respuestas y códigos de error. [donaciones.md](donaciones.md) ya tiene ese formato para
  su parte.
- Punto de partida: el [Anexo A](#anexo-a--endpoints). Documentar el formato común de errores
  (`{ message }` y `{ message, errors: [{ campo, mensaje }] }`) y el header
  `Authorization: Bearer <token>`.

---

## 9. Deploy (🟠 AD)

| Parte | Opciones | A tener en cuenta |
|---|---|---|
| Base de datos | MySQL gestionado: Railway, Aiven (free), Clever Cloud, TiDB Serverless | `npx prisma db push` contra esa URL y cargar `demo-seed.sql`. ⚠️ **La sección 8 usa fechas relativas y el Top 10 cuenta los últimos 7 días**: volver a cargarla justo antes de la demo, del video y de la entrega. Verificar que la collation no distinga mayúsculas ni tildes (ej. `utf8mb4_0900_ai_ci`), el buscador depende de eso. |
| Backend | Render o Railway | Scripts `build`/`start` y `PORT`/`CORS_ORIGINS` ya están. Variables: `DATABASE_URL`, `JWT_SECRET` (**uno nuevo**: el de la guía es público), `CORS_ORIGINS`, `GEMINI_API_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `FRONTEND_URL` (la URL pública: con https Mercado Pago vuelve solo a la app). |
| Frontend | Vercel o Netlify | `VITE_API_BASE_URL` apuntando al backend. **Rewrite de la SPA** a `/index.html` (`vercel.json` o `public/_redirects`): sin eso, recargar `/admin` o `/buscar/recetas` da 404. |
| Imágenes | — | ⚠️ Se guardan en `backend/uploads/` (disco local). En Render free se borran en cada redeploy. Opciones: Railway con volumen persistente, o que la demo use links externos. **Decidirlo antes de elegir hosting.** |

Después: `docs/deploy.md` con los links y las credenciales de demo (admin, usuario común y el
**comprador de prueba de Mercado Pago** con la tarjeta de prueba, D3).

---

## 10. Preparación de la defensa

Cada integrante tiene que poder explicar, además de su CU:

- **Arquitectura backend:** capas, por qué solo el repository usa Prisma, por qué los services
  devuelven `{ ok, reason }` en vez de tirar excepciones.
- **Patrones:** Repository, Singleton (`prismaClient.ts`), cadena de middlewares (Chain of
  Responsibility), `ApiError extends Error`, Context + `useReducer`.
- **Seguridad:** bcrypt, JWT (payload, expiración, dónde se guarda), `verifyToken` /
  `verifyAdmin` / `verifyOwnerOrAdmin`, por qué el usuario sale del token y no del body, por qué
  Prisma evita SQL injection, baja lógica.
- **Frontend:** `ProtectedRoute` y los 3 niveles, `apiFetch` y la sesión expirada, mobile-first
  con `respond-to`, props y callbacks `onX`, estados de carga/error/vacío.
- **Rendimiento (feedback del profesor):** cómo se evitó el N+1 (`groupBy`), carga por pantalla
  (`useHasBeenVisible`, secciones del admin), conteos en la base (`/admin/summary`, `_count`).
- **Buscador y filtros:** debounce, filtros en la URL, listado en dos pasos (filtrar con datos
  mínimos y después pedir solo las 12 cards), cruce con el inventario y cálculo nutricional por
  porción.
- **Donaciones:** por qué los montos viven en el backend, por qué el estado se le pregunta a
  Mercado Pago y no se toma de la URL, cómo se detecta el pago sin volver del checkout (polling)
  y qué pasa con las pendientes. Que el dinero va a la cuenta de Chefcito (repartirlo a cada
  creador requiere el modelo *marketplace*, fuera del alcance).
- **Seguir y la home:** tabla `follow` (N:M de usuario con usuario, un solo sentido), cómo se arma
  el Top 10 (promedio solo con las reseñas del plazo).
- **Tests:** qué prueba el suyo y cómo se corre.

---

## 11. Reparto sugerido

Actualizado el 30/09. Lo que importa para la cátedra es que **cada integrante tenga su propio test
y pueda defender un CU** (aunque no lo haya programado: tiene que saber explicarlo). Es una
propuesta: ajustarla en la próxima reunión (y dejarlo en la primera minuta).

| Integrante | Pendiente | Test propio | CU que defiende |
|---|---|---|---|
| **Stéfano** (Dev A) | Propuesta + DER + links a PRs, README raíz e índice, GitHub Project, B1 (`app`/`server`), revisar PRs | Integración (Supertest) + unitario de `reviewService` | Reseñar recetas (+ Seguir, el CU extra) |
| **Elías** (Dev B) | Documentación de la API (8), limpieza B2 | Unitario de `pantryMatchService` | Recetas según ingredientes |
| **Juan** (Dev C) | Landing con datos reales (F1, hizo el rediseño), test E2E | Unitario de `recipeNutritionService` | Crear y publicar recetas (+ listados) |
| **Gastón** (Dev D) | Donaciones: D1–D4, deploy (9) con Mercado Pago, test de componente del front | Unitario de `donationService` | Donar a creadores |

Minutas, metodología y `.env.example`: el que tenga una tarea más corta esa semana. Las mejoras
🟡/⚪ de 4 y 5 se reparten al final.

**Participación en git.** La cátedra mira "los aportes de cada integrante" en el historial. Hoy
(`git shortlog --no-merges`, sin los commits del template): Stéfano 33, Gastón 8, Juan 7, Elías 3.
Para lo que queda: **cada uno commitea y abre los PRs de sus tareas desde su propia cuenta**, con
commits chicos y frecuentes.

---

## 12. Checklist de entrega AD

Formulario: https://kutt.to/DSWEntregaSistemaFinal

- [x] CRUDs, listados con detalle y los 4 CU de la propuesta
- [x] Listados adicionales (tiempo, Top 10, necesidades nutricionales) y Chefcito Bot
- [x] Correcciones del feedback del profesor (llamadas, acentos, campos obligatorios, sin "Actualizar")
- [x] Sin botones *Próximamente*
- [ ] Listado de donaciones (D1) y guía para probarlas (D3)
- [ ] Landing con datos reales (F1)
- [ ] 4 tests unitarios de backend + 1 de integración, pasando
- [ ] 1 test de componente + 1 E2E en el front, pasando
- [ ] Evidencia de tests en `docs/tests.md`
- [ ] Documentación de la API
- [ ] `.env.example` en back y front
- [ ] Deploy funcionando (back + front + BD) y probado desde un celular, con donaciones
- [ ] Credenciales de demo (admin, usuario, comprador de prueba de Mercado Pago)
- [ ] `README.md` raíz con instalación y link a `docs/README.md` (índice)
- [ ] Propuesta con stack, DER y links a los PRs
- [ ] Minutas, metodología y tracking (GitHub Project)
- [ ] Recorrido en 375 / 768 px y modo claro (F2)
- [ ] Cargar la sección 8 de `demo-seed.sql` justo antes del video y de la entrega
- [ ] Video demo (los 4 CU, los CRUDs, el buscador, las donaciones y el panel admin)
- [ ] PR `develop` → `main`
- [ ] Coordinar la fecha de defensa

---

## Anexo A — Endpoints

Al día al 30/09. Base: `/api`. **Público** = sin token · **Token** = cualquier usuario logueado ·
**Dueño/Admin** = el propio usuario o un admin · **Admin** = solo admin.

| Recurso | Método y ruta | Acceso |
|---|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` | Público |
| Usuarios | `GET /users` (`?inactive=true` solo admin) · `GET /users/:id` | Token |
| | `POST /users` · `PATCH /users/:id/restore` | Admin |
| | `PATCH /users/:id` · `PATCH /users/:id/password` · `DELETE /users/:id` (baja lógica) · `PATCH`/`DELETE /users/:id/avatar\|cover` (multipart `image`) | Dueño/Admin |
| Inventario | `GET`, `POST /users/:userId/inventory` · `PATCH`, `DELETE /users/:userId/inventory/:ingredientId` | Dueño/Admin |
| Seguir | `GET` (estado + contadores) · `POST` · `DELETE /users/:userId/follow` | Token (el que sigue es el del token) |
| Roles | `GET`, `POST /roles` · `GET`, `PATCH`, `DELETE /roles/:id` · `GET /roles/users` · `GET /roles/users/:userId` · `GET`, `POST /roles/:id/users` · `DELETE /roles/:id/users/:userId` | Admin |
| Panel admin | `GET /admin/summary` · `GET /admin/users?status=&q=&page=` | Admin |
| Categorías de receta | `GET /categories` · `GET /categories/name/:name` | Token |
| | `POST` · `PATCH`, `DELETE /categories/:id` | Admin |
| Categorías de ingrediente | `GET /ingredient-categories` · `GET /ingredient-categories/:id` | Público |
| | `POST` · `PATCH`, `DELETE /:id` | Admin |
| Ingredientes | `GET /ingredients` · `GET /ingredients/:id` (con categorías, valores nutricionales y `_count`) | Público |
| | `POST` · `PATCH`, `DELETE /:id` (aceptan `nutritionalValues`) · `PATCH`, `DELETE /:id/image` | Admin |
| Valores nutricionales | `GET /ingredients/:idIngredient/nutritional-values` · `GET .../:num` | Público |
| | `POST` · `PATCH`, `DELETE .../:num` | Admin |
| Recetas | `GET /recipes` (`?userId=`; con `averageRating`/`reviewCount`) · `GET /recipes/:id` (con `nutrition` y, con token, `viewer: { isSaved, pantryIngredientIds }`) | Público |
| | `POST /recipes` | Token |
| | `PATCH`, `DELETE /recipes/:id` | Dueño/Admin |
| Pasos · Ingredientes de receta | `GET /recipes/:idRecipe/steps\|ingredients` | Público |
| | `PUT /recipes/:idRecipe/steps\|ingredients` (reemplaza la lista) | Dueño/Admin |
| Imágenes | `GET /recipes/:idRecipe/images` | Público |
| | `POST` (multipart `image` o JSON `imageUrl`) · `PATCH`, `DELETE /:id` | Dueño/Admin |
| Reseñas | `GET /recipes/:idRecipe/reviews` | Público |
| | `POST /recipes/:idRecipe/reviews` | Token |
| | `PATCH`, `DELETE /recipes/:idRecipe/reviews/:idReview` | Autor/Admin |
| Guardado | `GET`, `POST`, `PATCH`, `DELETE /recipes/:idRecipe/save` | Token |
| | `GET /saved-recipes/:idUser` | Dueño/Admin |
| Búsqueda | `GET /search?q=` · `GET /search/recipes` (`q`, `categoryId`, `authorId`, `maxTime`, `minTime`, `minRating`, `ingredientIds`, `nutrition`, `pantry`, `savedOnly`, `sort`, `page`) · `GET /search/categories` y `/search/users` (`q`, `onlyWithRecipes`, `sort`, `page`) | Token |
| Feed | `GET /feed/friends/recipes` · `/feed/friends/reviews` (`?limit`) · `/feed/top-recipes` (`?days`, `limit`) | Token |
| Asistente IA | `POST /assistant/chat` (503 sin `GEMINI_API_KEY`) | Token |
| Donaciones | `GET /donations/tiers` · `POST /donations/checkout` · `GET /donations/:transactionRef` · `POST /donations/confirm` (detalle en [donaciones.md](donaciones.md); 503 sin `MERCADOPAGO_ACCESS_TOKEN`) | Token (el donante es el del token) |
| Salud | `GET /database/health` | Público |
| Archivos | `GET /uploads/recipes\|users\|ingredients/<archivo>` (estático, fuera de `/api`) | Público |

## Anexo B — Cómo se hizo este análisis (30/09)

- Sobre `develop` `c93358f`: `npx tsc --noEmit` (back) sin errores · `npm run lint` sin errores ·
  `npm run build` OK (JS 517 kB, ver F10).
- Se leyó el código completo de la feature `donation` (back y front) y su integración en
  `app.ts`, `App.jsx`, el detalle de receta y el perfil.
- Se volvió a revisar en el código cada pendiente del análisis anterior (placeholders,
  `.env.example`, README raíz, scripts, validaciones duplicadas, listados que responden 404,
  modelos por feature, tamaño de componentes, archivos sin uso, landing, Top 10) y se
  sacó lo que ya estaba resuelto.
- No se levantó la app ni se probó un pago contra Mercado Pago: lo de donaciones se evaluó
  leyendo el código y [donaciones.md](donaciones.md).
