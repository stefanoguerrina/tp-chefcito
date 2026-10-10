# Análisis del estado del proyecto — Chefcito

> **Última actualización:** 09/10/2026 · **Rama:** `task/Correcciones-Front-Back` (sobre
> `develop` `40f3b70`, todavía sin PR).
> **Para qué sirve:** saber qué nos falta para la **Aprobación Directa (AD)** según la cátedra
> ([README.md](README.md) §3.3, [docs.md](docs.md), [FAQ.md](FAQ.md)) y en qué orden hacerlo.
> Solo figura lo pendiente: lo resuelto se borra de acá y queda, con cómo se verificó, en
> [registro-sesiones.md](registro-sesiones.md). La preparación de la defensa está en
> [guia-defensa.md](guia-defensa.md).

| Marca | Significado |
|:-:|---|
| 🔴 | Obligatorio en cualquier entrega (regularidad y AD): sin esto no se puede entregar. |
| 🟠 | Obligatorio para la AD. |
| 🟡 | No bloquea la entrega, pero conviene hacerlo antes del video y la defensa. |

---

## 1. Resumen

**El código está terminado.** Todo lo de la propuesta (CRUDs, listados con detalle, los 4 casos
de uso, los 3 listados adicionales y el ChatBot) está implementado, más bastante alcance extra
(ver 4.1). La rama actual además dejó la API siempre en JSON, modelos en todas las features,
componentes de menos de 200 líneas, sin código muerto, y la app y el panel admin cargan rápido
(precarga de páginas y secciones). `tsc`, `lint` y `build` pasan sin errores.

**Lo que falta es todo lo que la cátedra pide "alrededor" del código, y no arrancó ninguno:**

| # | Prio | Qué falta | Ver | Quién (propuesta, 6) |
|:-:|:-:|---|:-:|---|
| 1 | 🔴 | **Propuesta actualizada**: stack distinto al de la cátedra, DER nuevo, alcance extra y **links a los PRs** | 4.1 | Stéfano |
| 2 | 🔴 | **`README.md` en la raíz** con instrucciones de instalación, y **`docs/README.md` como índice** | 4.2 | Stéfano |
| 3 | 🔴 | **Metodología, minutas y tracking** (GitHub Project) | 4.3 | Stéfano + todos |
| 4 | 🟠 | **Tests**: 1 unitario por integrante + 1 de integración (back), 1 de componente + 1 E2E (front), y su evidencia | 4.4 | Cada uno el suyo |
| 5 | 🟠 | **Documentación de la API** | 4.5 | Elías |
| 6 | 🟠 | **Ambientes**: `.env.example` en back y front, y una base de test aparte | 4.2, 4.4 | Quien tenga menos carga |
| 7 | 🟠 | **Deploy** (back + front + BD + fotos) y **credenciales de demo** | 4.6 | Gastón |
| 8 | 🟠 | **Video** mostrando el funcionamiento | 4.7 | Juan + todos |
| 9 | 🟠 | Formulario de entrega con todo lo anterior + **contacto para la defensa** | 4.8 | Stéfano |
| 10 | 🟡 | Recorrido visual en 375 / 768 px y modo claro | 5 | Juan |

> **Avisos para el equipo** (al bajar esta rama): cortar y volver a correr `npm run dev` en los
> dos paquetes (cambió el arranque del back a `dist/server.js` y la config de Vite); correr
> `npx prisma db push --accept-data-loss` (se sacó `recipe.saveCount`); **nunca** `prisma db
> pull` (el esquema del repo es la fuente de verdad); un ícono nuevo de Material Symbols hay
> que agregarlo a `icon_names=` en `frontend/index.html` o se ve como texto.

---

## 2. Qué pide la cátedra y qué nos falta

### 2.1 Requisitos técnicos y funcionales

Todo lo de regularidad y AD está cumplido (Express con middlewares, API REST, MySQL + Prisma,
capas, validación con errores claros, login JWT con 2 niveles, rutas protegidas en back y front,
React + SASS mobile-first con 3 breakpoints, eventos, errores amigables, input/output properties,
servicios, modelos, patrones, 1 CU por integrante con 2 relacionados) **salvo esto:**

| Requisito ([README.md](README.md) §3.1–3.2, [FAQ.md](FAQ.md)) | Nivel | Qué falta |
|---|:-:|---|
| Declarar en la propuesta las tecnologías distintas a las de la cátedra | Reg | React en lugar de Angular, TypeScript, Prisma, MySQL, Mercado Pago y Gemini (4.1). |
| Dependencias de test registradas en `package.json` | Reg | `npm test` del back es un placeholder; el front no tiene script de test (4.4). |
| 1 test automatizado por integrante + 1 de integración (back) | AD | No hay ninguno (4.4). |
| 1 test unitario de componente + 1 E2E (front) | AD | No hay ninguno (4.4). |
| Definir ambientes (`.env`) | AD | Hay `.env` y se leen todas las variables, pero no hay `.env.example` ni base de test aparte (4.2, 4.4). |
| CRUDs de todas las clases de negocio | AD | Completos salvo Donación, que no tiene U ni D: **justificarlo** en la propuesta (4.1). |

### 2.2 Entregables ([docs.md](docs.md) y [README.md](README.md) §3.3)

| Entregable | Reg | AD | Estado |
|---|:-:|:-:|---|
| Propuesta actualizada con links a los PRs | X | X | ❌ Desactualizada y sin links |
| Instrucciones de instalación en el README | X | X | ❌ No hay `README.md` raíz |
| Documentación en `docs/`, con `docs/README.md` como índice enlazado desde el README raíz | X | X | ❌ Hoy `docs/README.md` es la consigna |
| Minutas de reunión y avance | X | X | ❌ ([registro-sesiones.md](registro-sesiones.md) son sesiones de trabajo, no reuniones) |
| Tracking de features, bugs e issues | X | X | ❌ |
| Metodología ágil usada ([README.md](README.md) §4) | X | X | ❌ |
| Documentación de la API | | X | ❌ (solo [donaciones.md](donaciones.md) y el [Anexo](#anexo--endpoints)) |
| Evidencia de la ejecución de los tests | | X | ❌ |
| Video | | X | ❌ |
| Links de deploy + credenciales | | X | ❌ |
| Contacto para coordinar la defensa | | X | ❌ (va en el formulario) |

---

## 3. Cómo seguir

### 3.1 Fecha de entrega

Ventanas de la cátedra: **12/10–16/10**, recuperatorio **26/10–30/10** y última instancia
**9/11–13/11**. Hoy (09/10) no arrancó ningún entregable de la tabla 1, así que la del 12/10 no
es realista para la AD. **Propuesta: apuntar al 26/10** y decidirlo en la próxima reunión (que
quede en la primera minuta).

| Semana | Objetivo | Qué entra |
|---|---|---|
| **09/10 – 16/10** | Base y decisiones | PR de esta rama a `develop`. Primera minuta (fecha, reparto, dependencias de test, hosting). GitHub Project con un issue por fila de la tabla 1. README raíz, `docs/README.md` índice, `.env.example`. Propuesta con stack, DER y links. Configurar Vitest en back y front. |
| **17/10 – 25/10** | Completar AD | Los 7 tests + `docs/tests.md` con la evidencia. Documentación de la API. Deploy probado desde un celular (con una donación de prueba). Recorrido visual (5). |
| **26/10 – 30/10** | Entrega | Recargar el seed en la base del deploy, grabar el video, PR `develop` → `main`, formulario, coordinar la defensa. |

### 3.2 Qué hay que decidir en grupo primero (bloquea lo demás)

1. **Fecha de entrega** (3.1).
2. **Dependencias de test** (agregar dependencias requiere acuerdo, regla de `CLAUDE.md`):
   propuesta **Vitest** (back y front), **Supertest** (integración), **Testing Library + jsdom**
   (componente) y **Playwright** (E2E).
3. **Hosting y fotos**: las fotos se guardan en `backend/uploads/` (disco local). En Render free
   se borran en cada redeploy; Railway con volumen persistente las conserva (4.6).
4. **Convención de git** que se va a declarar (4.3).
5. **Quién defiende cada CU** (completa la fila "Integrante" de [guia-defensa.md](guia-defensa.md)).

---

## 4. Detalle de cada pendiente

### 4.1 Propuesta ([proposal.md](proposal.md)) 🔴

- **Stack** (lo exige el FAQ): React 19 + Vite en lugar de Angular; Node + Express 5 en
  TypeScript; Prisma + MySQL; JWT + bcrypt; Mercado Pago Checkout Pro (sandbox) y Google Gemini.
- **DER nuevo** en Mermaid (`erDiagram`) dentro del repo, en vez de la imagen (que es anterior a
  roles, `follow`, porciones, fotos, etc.). [guia-defensa.md §1.4](guia-defensa.md#14-modelo-de-datos-resumen)
  tiene uno resumido para partir; la fuente es [schema.prisma](../backend/prisma/schema.prisma).
- **CRUDs**: Receta pasa a *dependiente* (depende de Usuario y Categoría) y se suma **Donación**.
  Justificar que no tiene U ni D: el estado lo actualiza Mercado Pago y un registro de pago no se
  borra para no falsear el historial.
- **Alcance adicional hecho y no prometido** (suma en "innovación"): CRUD de roles y asignación,
  inventario, valores nutricionales (entidad débil) con cálculo por porción, pasos e imágenes con
  subida real, recetas guardadas, seguir usuarios con lista de seguidores y home con feed de
  amigos, buscador global con listados de categorías y perfiles, métricas del perfil, panel admin
  con dashboard, fotos de perfil y portada, modo claro/oscuro, cambio de contraseña, pagos reales
  (sandbox) con historial de donaciones (recibidas/realizadas, top 5).
- **Links a los PRs** (obligatorio en las dos entregas). Base: los PRs desde el primer análisis
  (falta sumar #1–#17 y el PR de esta rama):

| PR | Qué trajo |
|---|---|
| #18 | Editor de recetas por secciones, portada del perfil. |
| #19 | Buscador y listados con filtros, filtro "Inventario" (CU recetas según ingredientes), perfil en 3 pantallas, recetas guardadas con filtros. |
| #21 | Chefcito Bot (asistente IA con Gemini). |
| #22 | Seguir usuarios y home con recetas/reseñas de amigos y Top 10 de la semana. |
| #23 | Feedback del profesor: sin N+1, acentos del seed, campos obligatorios con error por campo, editar reseña. |
| #24 | Panel admin rediseñado (resumen y tabla de usuarios paginada en el backend). |
| #25 | Landing rediseñada. |
| #26 | Valores nutricionales por porción y listado por necesidades nutricionales. |
| #27 | Donaciones con Mercado Pago. |
| #28 | Optimización: API siempre JSON, listados vacíos `200 []`, páginas en archivos aparte, historial de donaciones. |

### 4.2 README raíz, índice de `docs/` y `.env.example` 🔴

```
README.md                ← NUEVO: qué es Chefcito, integrantes, stack, instalación paso a paso
                           (MySQL → backend/.env → prisma db push → demo-seed.sql → npm run dev en
                           los dos), usuarios de demo y link a docs/README.md. La guía de
                           instalación anterior se recupera con: git show 40f3b70:docs/guia-profesor.md
backend/.env.example     ← NUEVO: DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGINS, FRONTEND_URL,
                           GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODEL,
                           MERCADOPAGO_ACCESS_TOKEN (sin valores reales)
frontend/.env.example    ← NUEVO: VITE_API_BASE_URL=http://localhost:3000/api
docs/
├── README.md            ← NUEVO: índice (separar lo que se entrega de lo interno)
├── consigna/            ← mover acá README.md, FAQ.md y docs.md de la cátedra, sin tocarlos
├── proposal.md, der.md, metodologia.md, minutas/, tracking.md, api.md, tests.md, deploy.md
├── asistente-ia.md, donaciones.md, demo-seed.sql
└── internos: guia-defensa.md, registro-sesiones.md, analisis-estado-proyecto.md
```

Si se mueve la consigna, actualizar las rutas que la mencionan (`CLAUDE.md` y este documento).

### 4.3 Metodología, minutas y tracking 🔴

- **Metodología** (`docs/metodologia.md`): la que usamos de verdad — Kanban por fases según
  [tasks-division.md](tasks-division.md), ramas desde `develop`, PR con revisión de Stéfano,
  `develop` → `main` al cerrar cada entrega.
- **Tracking**: GitHub Project (Todo / In progress / Review / Done) con un issue por fila de la
  tabla 1 y por cada bug; cada PR cierra su issue (`Closes #N`). Link en `docs/tracking.md` y
  una columna **Estado** en [tasks-division.md](tasks-division.md) (Fases 1–4 ✅; Fase 5: IA ✅,
  QA ⏳).
- **Minutas** (`docs/minutas/`): una por reunión (fecha, presentes, qué se hizo, qué se decidió,
  quién hace qué). Para lo anterior, un resumen honesto por fase con las fechas reales de los PRs:
  **no inventar reuniones**.
- **Convención de git**: la documentada es `feature/T-X.X-...` y commits `[T-X.X] ...`, pero se
  usa `task/...` y mensajes libres. Elegir una y actualizar [tasks-division.md](tasks-division.md).
- **Participación** (la cátedra mira los aportes de cada uno): hoy, sin merges, Stéfano 34
  commits, Gastón 8, Juan 8, Elías 3. Lo que queda: cada uno commitea y abre los PRs de sus
  tareas desde su cuenta, con commits chicos y por tema.

### 4.4 Tests 🟠

| Test | Tipo | Candidatos (de más fácil a más difícil) |
|---|---|---|
| Backend × 4 (1 por integrante) | Unitario | **Funciones puras, sin mocks:** `computeRecipeNutrition` ([recipeNutritionService.ts](../backend/src/features/recipe/services/recipeNutritionService.ts)), `computePantryMatch`/`comparePantryMatches` ([pantryMatchService.ts](../backend/src/features/search/services/pantryMatchService.ts)), `statusFromPayments`/`buildHistorySide` de donaciones. **Services con el repository mockeado:** `reviewService.createReview` (propia / duplicada), `followService.followUser` (a uno mismo, dos veces), `donationService.createCheckout`, `recipeService.updateRecipe` (403 si no es dueño). |
| Backend × 1 | Integración | Supertest sobre `app` (ya se exporta sin levantar el servidor). **Sin base:** ruta inexistente → 404 JSON, JSON roto → 400, ruta protegida sin token → 401, login vacío → 422 con errores por campo, `GET /api/feed/top-recipes` público → 200. **Con base de test** (`.env.test` con otra `DATABASE_URL`): login → token → ruta protegida. |
| Frontend × 1 | Componente | `ErrorState` (muestra el mensaje y llama a `onRetry`), `EmptyState`, `ConfirmModal`, `UserAvatar` (cae a las iniciales si falla la foto). |
| Frontend × 1 | E2E | Con back, front y seed: login de `juanperez` → buscar "fideos" → abrir la receta; o registro → "¡Registro exitoso!" → login. |

- Scripts `"test"` en los dos `package.json` y `"test:e2e"` en el front.
- La base de test **no** puede ser la de desarrollo (los tests escriben datos): eso cubre además
  "definir ambientes".
- **Evidencia** en `docs/tests.md`: cómo se corren, la salida de la consola y una captura del
  reporte de Playwright.

### 4.5 Documentación de la API 🟠

- **Sin dependencias:** `docs/api.md` con una tabla por recurso (método, ruta, acceso, body,
  respuestas y errores), como ya tiene [donaciones.md](donaciones.md).
- **Opcional, si el grupo acepta la dependencia:** `docs/openapi.yaml` + `swagger-ui-express` en
  `/api/docs` para probarla en vivo.
- Partir del [Anexo](#anexo--endpoints) y documentar lo común: header
  `Authorization: Bearer <token>`, errores `{ message }` y `{ message, errors: [{ campo, mensaje }] }`,
  listados vacíos `200 []`, ruta inexistente 404.

### 4.6 Deploy y credenciales 🟠

| Parte | Opciones | A tener en cuenta |
|---|---|---|
| Base de datos | Railway, Aiven, Clever Cloud o TiDB (MySQL gestionado) | `npx prisma db push` contra esa URL y cargar `demo-seed.sql`. Las secciones 8 y 10 del seed usan fechas relativas (Top 10 de los últimos 7 días, donaciones): recargarlas antes del video y de la entrega. La collation tiene que ignorar mayúsculas y tildes (ej. `utf8mb4_0900_ai_ci`): el buscador depende de eso. |
| Backend | Render o Railway | `build`/`start` y `PORT`/`CORS_ORIGINS` ya están. Variables: `DATABASE_URL`, un `JWT_SECRET` **nuevo**, `CORS_ORIGINS` (la URL del front), `FRONTEND_URL`, `GEMINI_API_KEY`, `MERCADOPAGO_ACCESS_TOKEN` (nunca en el repo). |
| Frontend | Vercel o Netlify | `VITE_API_BASE_URL` apuntando al backend. **Rewrite de la SPA** a `/index.html` (`vercel.json` o `public/_redirects`): sin eso, recargar `/admin` da 404. |
| Fotos | — | Ver 3.2: decidir antes de elegir hosting. |

Después, `docs/deploy.md` con los links y las credenciales: admin (`admindemo`), un usuario común
(`juanperez`) y el **comprador de prueba de Mercado Pago** con la tarjeta de prueba. Probarlo
desde un celular, con una donación incluida.

### 4.7 Video 🟠

Guion corto: landing (recetas reales) → registro y login → crear y publicar una receta (CU) →
inventario y "¿Qué puedo cocinar?" (CU) → reseñar una receta de otro (CU) → donar con el
comprador de prueba (CU) → buscador y listados con filtros → perfil, seguir y la home → Chefcito
Bot → panel admin (dashboard, usuarios, ingredientes con valores nutricionales, categorías, roles).
Recargar el seed antes de grabar.

### 4.8 Entrega

Formulario: https://kutt.to/DSWEntregaSistemaFinal — propuesta con links a los PRs, README con
instalación, video, documentación de la API, evidencia de tests, links de deploy, credenciales y
contacto. Antes: PR `develop` → `main`.

---

## 5. Calidad (no bloquea la AD) 🟡

| Qué | Por qué / cómo |
|---|---|
| **Recorrido visual en 375 / 768 px y modo claro** | Casi todo se ajustó en escritorio y modo oscuro, y lo último no se probó a ojo: modales de categorías y de contraseña, lista de seguidores, desplegables de orden y del calendario, modal de editar cantidad del inventario y el panel admin con secciones que quedan montadas. Probar también en el navegador de la defensa (se usan `:has()` y `@container`). |
| Documentos con datos viejos | [CLAUDE.md](../CLAUDE.md): "IDE Antigravity", "React en TypeScript y JavaScript" y el ejemplo `RecipeCard.tsx` (el front es solo JSX). [asistente-ia.md](asistente-ia.md): §1 habla del banner del buscador (hoy es un botón flotante) y §7.1 de un problema ya resuelto. |
| Migraciones de Prisma | Hoy se usa `db push`. Pasar a `migrate` obliga a cada uno a marcar la migración inicial como aplicada en su base: decidirlo en grupo; mientras tanto, avisar en cada PR que toque `schema.prisma`. |
| Webhook de Mercado Pago | En el deploy (https) permitiría confirmar el pago al instante aunque el usuario cierre todo. Solo si sobra tiempo. |

---

## 6. Reparto sugerido

Lo que importa para la cátedra: **cada integrante con su propio test y capaz de defender un CU**
(aunque no lo haya programado). Es una propuesta para la próxima reunión. La "Parte" es la de
[guia-defensa.md](guia-defensa.md).

| Integrante | Pendiente | Test propio | CU que defiende (Parte) |
|---|---|---|---|
| **Stéfano** | Propuesta + DER + links, README raíz e índice, metodología, GitHub Project, revisar PRs, formulario | Integración (Supertest) + unitario de `reviewService` | Reseñar recetas (+ Seguir) — D |
| **Elías** | Documentación de la API | Unitario de `pantryMatchService` | Recetas según ingredientes — C |
| **Juan** | Recorrido visual (5), test E2E, video | Unitario de `recipeNutritionService` | Crear y publicar recetas — B |
| **Gastón** | Deploy con Mercado Pago, credenciales, test de componente | Unitario de `donationService` | Donar a creadores — A |

Minutas y `.env.example`: el que tenga menos carga esa semana.

---

## 7. Checklist de entrega AD

- [ ] Fecha decidida y primera minuta
- [ ] PR de `task/Correcciones-Front-Back` a `develop`
- [ ] Propuesta con stack, DER, CRUD de Donación justificado, alcance extra y links a los PRs
- [ ] `README.md` raíz con instalación y link a `docs/README.md` (índice)
- [ ] `.env.example` en back y front
- [ ] Metodología, minutas y GitHub Project
- [ ] 4 tests unitarios de backend + 1 de integración, pasando
- [ ] 1 test de componente + 1 E2E en el front, pasando
- [ ] `docs/tests.md` con la evidencia
- [ ] Documentación de la API
- [ ] Deploy funcionando y probado desde un celular, con una donación
- [ ] `docs/deploy.md` con links y credenciales (admin, usuario, comprador de prueba)
- [ ] Recorrido visual en 375 / 768 px y modo claro
- [ ] Seed recargado justo antes del video y de la entrega
- [ ] Video
- [ ] PR `develop` → `main`
- [ ] Formulario enviado y defensa coordinada

---

## Anexo — Endpoints

Punto de partida para la documentación de la API (4.5). Base: `/api`. **Público** = sin token ·
**Token** = cualquier usuario logueado · **Dueño/Admin** = el propio usuario o un admin ·
**Admin** = solo admin. Los listados responden `200 []` cuando están vacíos; una ruta inexistente
responde 404 `{ message }`.

| Recurso | Método y ruta | Acceso |
|---|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` | Público |
| Usuarios | `GET /users` (`?inactive=true` solo admin) · `GET /users/:id` | Token |
| | `POST /users` · `PATCH /users/:id/restore` | Admin |
| | `PATCH /users/:id` · `PATCH /users/:id/password` (contraseña actual incorrecta → 400 con el error en `currentPassword`) · `DELETE /users/:id` (baja lógica) · `PATCH`/`DELETE /users/:id/avatar\|cover` (multipart `image`) | Dueño/Admin |
| Inventario | `GET`, `POST /users/:userId/inventory` · `PATCH`, `DELETE /users/:userId/inventory/:ingredientId` | Dueño/Admin |
| Seguir | `GET` (estado + contadores) · `POST` · `DELETE /users/:userId/follow` · `GET /users/:userId/follow/followers\|following` | Token (el que sigue es el del token) |
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
| Feed | `GET /feed/friends/recipes` · `/feed/friends/reviews` (`?limit`) | Token |
| | `GET /feed/top-recipes` (`?days`, `limit`; lo usa también la landing) | Público |
| Asistente IA | `POST /assistant/chat` (503 sin `GEMINI_API_KEY`) | Token |
| Donaciones | `GET /donations` (historial `{ received, sent }`) · `GET /donations/tiers` · `POST /donations/checkout` · `GET /donations/:transactionRef` · `POST /donations/confirm` (detalle en [donaciones.md](donaciones.md); 503 sin `MERCADOPAGO_ACCESS_TOKEN`) | Token (el donante es el del token) |
| Salud | `GET /database/health` (200 o 503, sin detalles del error) | Público |
| Archivos | `GET /uploads/recipes\|users\|ingredients/<archivo>` (estático, fuera de `/api`) | Público |
