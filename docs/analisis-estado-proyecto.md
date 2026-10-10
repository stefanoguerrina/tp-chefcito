# Análisis del estado del proyecto

Última actualización: 10/10/2026, sobre `develop` (`0df2f28`) más los cambios de documentación de
esta fecha.

Para qué sirve: saber qué falta para la Aprobación Directa (AD) según la
[consigna de la cátedra](consigna-catedra.md) (partes 1 a 3)
y en qué orden hacerlo. Solo figura lo pendiente; lo terminado queda en [tracking.md](tracking.md).
La preparación de la defensa está en [guia-defensa.md](guia-defensa.md).

| Marca | Significado |
|:-:|---|
| 🔴 | Obligatorio en cualquier entrega (regularidad y AD): sin esto no se puede entregar. |
| 🟠 | Obligatorio para la AD. |
| 🟡 | No bloquea la entrega, pero conviene hacerlo antes del video y la defensa. |
| ✅ | Hecho. |
| ❌ | Falta. |

## 1. Resumen

**El código está terminado.** Todo lo de la propuesta está implementado, más el alcance
adicional que figura en [proposal.md](proposal.md). **La documentación que se puede hacer sin
tests ni deploy también está:**

| | Hecho | Dónde |
|:-:|---|---|
| ✅ | Propuesta con tecnologías, DER, alcance adicional y links a los 29 PRs | [proposal.md](proposal.md) |
| ✅ | Instrucciones de instalación y ejecución | [README.md](../README.md) raíz |
| ✅ | Índice de la documentación | [docs/README.md](README.md) |
| ✅ | Ambientes: `.env.example` en back y front | `backend/`, `frontend/` |
| ✅ | Documentación de la API | [api.md](api.md) |
| ✅ | Metodología y flujo de git | [metodologia.md](metodologia.md) |
| ✅ | Solo los documentos que pide la cátedra en `docs/` (se borraron los que venían del fork y los internos que ya no se usan) | [docs/README.md](README.md) |
| ✅ | Tracking de tareas, bugs e issues | [tracking.md](tracking.md) |
| ✅ | Avance por fase y devoluciones de los profesores | [minutas.md](minutas.md) |

**Lo que falta:**

| # | Prio | Qué falta | Ver | Quién (sugerido, sección 5) |
|:-:|:-:|---|:-:|---|
| 1 | 🔴 | **Minutas** de las reuniones a partir de ahora | 3.1 | Quien coordine cada reunión |
| 2 | 🟠 | **Tests**: 1 unitario por integrante + 1 de integración (back), 1 de componente + 1 E2E (front) | 3.2 | Cada uno el suyo |
| 3 | 🟠 | **Evidencia** de los tests en `docs/tests.md` | 3.2 | Stéfano |
| 4 | 🟠 | **Base de datos de test** aparte (completa "definir ambientes") | 3.2 | Quien haga el test de integración |
| 5 | 🟠 | **Deploy** de back, front, base y fotos, con `docs/deploy.md` (links y credenciales) | 3.3 | Gastón |
| 6 | 🟠 | **Video** mostrando el funcionamiento | 3.4 | Juan + todos |
| 7 | 🔴 | **PR `develop` → `main`** y sumarlo, junto con los PRs nuevos, a la tabla de la propuesta | 3.5 | Stéfano |
| 8 | 🔴 | **Formulario** de entrega con todo lo anterior + contacto para la defensa | 3.5 | Stéfano |
| 9 | 🟡 | Recorrido visual en 375 / 768 px y modo claro | 4 | Juan |

> **Avisos para el equipo** al bajar `develop`: volver a correr `npm run dev` en los dos paquetes,
> correr `npx prisma db push` si cambió `schema.prisma` y **nunca** `prisma db pull` (el esquema
> del repo es la fuente de verdad). Un ícono nuevo de Material Symbols hay que agregarlo a
> `icon_names=` en `frontend/index.html`.

## 2. Qué pide la cátedra y qué falta

### 2.1 Requisitos técnicos y funcionales

Todo lo de regularidad y AD está cumplido (Express con middlewares, API REST, MySQL + Prisma,
capas, validación con errores claros, login JWT con 2 niveles, rutas protegidas en back y
front, React + SASS mobile-first con 3 breakpoints, servicios, modelos, 1 CU por integrante con
2 relacionados) **salvo esto:**

| Requisito | Nivel | Qué falta |
|---|:-:|---|
| Dependencias de test registradas en `package.json` | 🔴 | ❌ `npm test` del back es un placeholder y el front no tiene script de test |
| 1 test automatizado por integrante + 1 de integración (back) | 🟠 | ❌ No hay ninguno |
| 1 test unitario de componente + 1 E2E (front) | 🟠 | ❌ No hay ninguno |
| Definir ambientes | 🟠 | ❌ Hay `.env` y `.env.example`; falta la base de test aparte |

### 2.2 Entregables

| Entregable | Reg | AD | Estado |
|---|:-:|:-:|---|
| Propuesta actualizada con links a los PRs | X | X | ✅ Hecho; sumar los PRs nuevos hasta la entrega |
| Instrucciones de instalación en el README | X | X | ✅ Hecho |
| Documentación en `docs/` con índice | X | X | ✅ Hecho |
| Minutas de reunión y avance | X | X | ✅ Avance por fase hecho; ❌ faltan las minutas de las próximas reuniones |
| Tracking de features, bugs e issues | X | X | ✅ Hecho; mantenerlo al día |
| Metodología | X | X | ✅ Hecho |
| Documentación de la API | | X | ✅ Hecho; actualizarla si cambia un endpoint |
| Evidencia de la ejecución de los tests | | X | ❌ Falta (depende de los tests) |
| Video | | X | ❌ Falta |
| Links de deploy + credenciales | | X | ❌ Falta |
| Contacto para coordinar la defensa | | X | ❌ Va en el formulario |

### 2.3 Fechas

Ventanas de la cátedra: 12/10 a 16/10, recuperatorio 26/10 a 30/10 y última instancia 9/11 a
13/11. Sin tests ni deploy, la del 12/10 no es realista para la AD. **Propuesta: apuntar al 26/10**
y decidirlo en la próxima reunión (que quede en la primera minuta).

| Semana | Objetivo | Qué entra |
|---|---|---|
| 10/10 a 16/10 | Base y decisiones | Primera minuta (fecha, reparto, dependencias de test, hosting). Configurar Vitest en back y front. |
| 17/10 a 25/10 | Completar AD | Los 7 tests + `docs/tests.md`. Deploy probado desde un celular, con una donación de prueba. Recorrido visual. |
| 26/10 a 30/10 | Entrega | Recargar el seed en la base del deploy, grabar el video, PR `develop` → `main`, formulario y defensa. |

**Decisiones de grupo que bloquean lo demás:**

1. Fecha de entrega.
2. Dependencias de test (agregar dependencias requiere acuerdo): propuesta Vitest (back y
   front), Supertest (integración), Testing Library + jsdom (componente) y Playwright (E2E).
3. Hosting y fotos: las fotos se guardan en `backend/uploads/`. En Render gratis se borran en
   cada redeploy; Railway con volumen persistente las conserva.
4. Quién defiende cada CU (fila "Integrante" de [guia-defensa.md](guia-defensa.md)).

## 3. Detalle de cada pendiente

### 3.1 Minutas 🔴

En [minutas.md](minutas.md) está el avance por fase (con las fechas reales de los PRs) y las
devoluciones de los profesores. A partir de la próxima reunión, registrar cada una con la
plantilla del final del archivo: fecha, presentes, qué se hizo, qué se decidió y quién hace qué.
**No inventar reuniones pasadas.**

Participación (la cátedra mira los aportes de cada uno): desde julio, sin contar merges,
Stéfano 31 commits, Gastón 8, Juan 8 y Elías 3. Conviene que cada uno commitee y abra desde su
cuenta los PRs de sus tests y tareas pendientes.

### 3.2 Tests 🟠

| Test | Tipo | Candidatos |
|---|---|---|
| Backend x 4 (1 por integrante) | Unitario | Funciones puras, sin mocks: `computeRecipeNutrition` ([recipeNutritionService.ts](../backend/src/features/recipe/services/recipeNutritionService.ts)), `computePantryMatch`/`comparePantryMatches` ([pantryMatchService.ts](../backend/src/features/search/services/pantryMatchService.ts)), `statusFromPayments`/`buildHistorySide` de donaciones. Services con el repository mockeado: `reviewService.createReview` (receta propia o reseña duplicada), `followService.followUser` (seguirse a sí mismo o dos veces), `recipeService.updateRecipe` (403 si no es el dueño). |
| Backend x 1 | Integración | Supertest sobre `app` (ya se exporta sin levantar el servidor). Sin base: ruta inexistente → 404 JSON, JSON roto → 400, ruta protegida sin token → 401, login vacío → 422 con errores por campo. Con base de test (`.env.test` con otra `DATABASE_URL`): login → token → ruta protegida. |
| Frontend x 1 | Componente | `ErrorState` (muestra el mensaje y llama a `onRetry`), `EmptyState`, `ConfirmModal` o `UserAvatar` (cae a las iniciales si falla la foto). |
| Frontend x 1 | E2E | Con back, front y seed: login de `juanperez` → buscar "fideos" → abrir la receta. |

- Scripts `"test"` en los dos `package.json` y `"test:e2e"` en el front, y agregarlos a la tabla
  de scripts del README raíz.
- La base de test **no** puede ser la de desarrollo, porque los tests escriben datos. Agregar
  `.env.test` al `.gitignore` y un `.env.test.example`.
- Evidencia en `docs/tests.md`: cómo se corren, la salida de la consola y una captura del reporte
  de Playwright. Sumarlo al índice de `docs/README.md`.

### 3.3 Deploy y credenciales 🟠

| Parte | Opciones | A tener en cuenta |
|---|---|---|
| Base de datos | Railway, Aiven, Clever Cloud o TiDB (MySQL gestionado) | `npx prisma db push` contra esa URL y cargar `demo-seed.sql`. Las secciones 8 y 10 del seed usan fechas relativas (Top 10 de los últimos 7 días, donaciones): recargarlas antes del video y de la entrega. La intercalación tiene que ignorar mayúsculas y tildes (`utf8mb4_0900_ai_ci`). |
| Backend | Render o Railway | `build`, `start`, `PORT` y `CORS_ORIGINS` ya están. Variables: `DATABASE_URL`, un `JWT_SECRET` nuevo, `CORS_ORIGINS` y `FRONTEND_URL` (la URL del front), `GEMINI_API_KEY` y `MERCADOPAGO_ACCESS_TOKEN`, nunca en el repo. |
| Frontend | Vercel o Netlify | `VITE_API_BASE_URL` apuntando al backend. Redirigir todas las rutas a `/index.html` (`vercel.json` o `public/_redirects`): sin eso, recargar `/admin` da 404. |
| Fotos | | Ver la decisión 3 de 2.3 antes de elegir hosting. |

Después, `docs/deploy.md` con los links y las credenciales: admin (`admindemo`), un usuario
común (`juanperez`) y el comprador de prueba de Mercado Pago con la tarjeta de prueba. Sumarlo
al índice. Probarlo desde un celular, con una donación incluida.

### 3.4 Video 🟠

Guion: landing → registro y login → crear y publicar una receta (CU) → inventario y recetas
que se pueden hacer con él (CU) → reseñar una receta de otro (CU) → donar con el comprador de
prueba (CU) → buscador y listados con filtros → perfil, seguir y el inicio → Chefcito Bot →
panel de administración. Recargar el seed antes de grabar. El plan gratis de Gemini permite 20
consultas por día y por modelo: no gastarlas probando el mismo día.

### 3.5 Entrega 🔴

1. PR `develop` → `main` (hoy `main` sigue en la estructura inicial del 06/07).
2. Sumar a la tabla de [proposal.md](proposal.md#pull-requests) los PRs de tests, deploy y el de
   `develop` → `main`.
3. Formulario: https://kutt.to/DSWEntregaSistemaFinal, con la propuesta, el README, el video, la
   documentación de la API, la evidencia de tests, los links de deploy, las credenciales y el
   contacto.

## 4. Calidad (no bloquea la AD) 🟡

| Qué | Por qué o cómo |
|---|---|
| Recorrido visual en 375 / 768 px y modo claro | Lo último se ajustó en escritorio y modo oscuro: revisar modales de categorías y de contraseña, lista de seguidores, desplegables de orden y del calendario, modal de editar cantidad del inventario y el panel de administración. Probar también en el navegador de la defensa (se usan `:has()` y `@container`). |
| Migraciones de Prisma | Hoy se usa `db push`. Pasar a `migrate` obliga a cada uno a marcar la migración inicial como aplicada en su base: decidirlo en grupo y, mientras tanto, avisar en cada PR que toque `schema.prisma`. |
| Webhook de Mercado Pago | Con el deploy en https permitiría confirmar el pago al instante aunque el usuario cierre todo. Solo si sobra tiempo. |

## 5. Reparto sugerido

Lo que importa para la cátedra: cada integrante con su propio test y capaz de defender un CU,
aunque no lo haya programado. La "Parte" es la de [guia-defensa.md](guia-defensa.md).

| Integrante | Pendiente | Test propio | CU que defiende (Parte) |
|---|---|---|---|
| Stéfano | Minutas, `docs/tests.md`, revisar PRs, PR a `main`, formulario | Integración (Supertest) + unitario de `reviewService` | Reseñar recetas (+ Seguir), D |
| Elías | Mantener [api.md](api.md) al día | Unitario de `pantryMatchService` | Recetas según ingredientes, C |
| Juan | Recorrido visual, test E2E, video | Unitario de `recipeNutritionService` | Crear y publicar recetas, B |
| Gastón | Deploy con Mercado Pago, `docs/deploy.md`, test de componente | Unitario de las funciones de donaciones | Donar a creadores, A |

## 6. Checklist de entrega AD

- [x] Propuesta con tecnologías, DER, alcance adicional y links a los PRs
- [x] `README.md` raíz con instalación y link a `docs/README.md`
- [x] `.env.example` en back y front
- [x] Documentación de la API
- [x] Metodología, tracking y avance por fase
- [ ] Fecha decidida y primera minuta
- [ ] 4 tests unitarios de backend + 1 de integración, pasando
- [ ] 1 test de componente + 1 E2E en el front, pasando
- [ ] `docs/tests.md` con la evidencia
- [ ] Deploy funcionando y probado desde un celular, con una donación
- [ ] `docs/deploy.md` con links y credenciales
- [ ] Recorrido visual en 375 / 768 px y modo claro
- [ ] Seed recargado justo antes del video y de la entrega
- [ ] Video
- [ ] PR `develop` → `main` y tabla de PRs de la propuesta al día
- [ ] Formulario enviado y defensa coordinada
