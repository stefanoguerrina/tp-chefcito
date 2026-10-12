# Análisis del estado del proyecto

Última actualización: 10/10/2026, sobre `develop` (`0df2f28`) más la documentación y los tests
automatizados de esta fecha.

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
adicional que figura en [proposal.md](proposal.md). **Los tests y la documentación que se puede
hacer sin deploy también están:**

| | Hecho | Dónde |
|:-:|---|---|
| ✅ | Propuesta con tecnologías, DER, alcance adicional y links a los 32 PRs | [proposal.md](proposal.md) |
| ✅ | Instrucciones de instalación y ejecución | [README.md](../README.md) raíz |
| ✅ | Índice de la documentación | [docs/README.md](README.md) |
| ✅ | Ambientes: `.env.example` en back y front | `backend/`, `frontend/` |
| ✅ | Documentación de la API | [api.md](api.md) |
| ✅ | Metodología y flujo de git | [metodologia.md](metodologia.md) |
| ✅ | Solo los documentos que pide la cátedra en `docs/` (se borraron los que venían del fork y los internos que ya no se usan) | [docs/README.md](README.md) |
| ✅ | Tracking de tareas, bugs e issues | [tracking.md](tracking.md) |
| ✅ | Avance por fase y devoluciones de los profesores | [minutas.md](minutas.md) |
| ✅ | Tests: 4 unitarios + 1 de integración (back), 1 de componente + 1 E2E (front), con su evidencia | [tests.md](tests.md) |
| ✅ | Ambientes: base de test aparte (`.env.test`) | `backend/.env.test.example` |

**Lo que falta:**

| # | Prio | Qué falta | Ver | Quién (sugerido, sección 5) |
|:-:|:-:|---|:-:|---|
| 1 | 🔴 | **Minutas** de las reuniones a partir de ahora | 3.1 | Quien coordine cada reunión |
| 2 | 🟠 | **Deploy** de back, front, base y fotos, con `docs/deploy.md` (links y credenciales) | 3.3 | Gastón |
| 3 | 🟠 | **Video** mostrando el funcionamiento | 3.4 | Juan + todos |
| 4 | 🔴 | **PR `develop` → `main`** y sumarlo, junto con los PRs nuevos (deploy), a la tabla de la propuesta | 3.5 | Stéfano |
| 5 | 🔴 | **Formulario** de entrega con todo lo anterior + contacto para la defensa | 3.5 | Stéfano |
| 6 | 🟡 | Recorrido visual en 375 / 768 px y modo claro | 4 | Juan |

> **Avisos para el equipo** al bajar `develop`: volver a correr `npm run dev` en los dos paquetes,
> correr `npx prisma db push` si cambió `schema.prisma` y **nunca** `prisma db pull` (el esquema
> del repo es la fuente de verdad). Un ícono nuevo de Material Symbols hay que agregarlo a
> `icon_names=` en `frontend/index.html`.

## 2. Qué pide la cátedra y qué falta

### 2.1 Requisitos técnicos y funcionales

Todo lo de regularidad y AD está cumplido (Express con middlewares, API REST, MySQL + Prisma,
capas, validación con errores claros, login JWT con 2 niveles, rutas protegidas en back y
front, React + SASS mobile-first con 3 breakpoints, servicios, modelos, 1 CU por integrante con
2 relacionados), **incluidos los tests:**

| Requisito | Nivel | Estado |
|---|:-:|---|
| Dependencias de test registradas en `package.json` | 🔴 | ✅ Vitest y Supertest (back); Vitest, Testing Library, jsdom y Playwright (front) |
| 1 test automatizado por integrante + 1 de integración (back) | 🟠 | ✅ 4 unitarios + 1 de integración ([tests.md](tests.md)) |
| 1 test unitario de componente + 1 E2E (front) | 🟠 | ✅ `ErrorState` + login → búsqueda → detalle de receta |
| Definir ambientes | 🟠 | ✅ `.env` (desarrollo) y `.env.test` (base de test aparte) |

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
| Evidencia de la ejecución de los tests | | X | ✅ [tests.md](tests.md) |
| Video | | X | ❌ Falta |
| Links de deploy + credenciales | | X | ❌ Falta |
| Contacto para coordinar la defensa | | X | ❌ Va en el formulario |

### 2.3 Fechas

Ventanas de la cátedra: 12/10 a 16/10, recuperatorio 26/10 a 30/10 y última instancia 9/11 a
13/11. Con el código, los tests y la documentación terminados, solo falta el deploy, el video y
la entrega. **Propuesta: apuntar a la primera ventana (12/10 a 16/10)**, enviar el formulario
el 15/10 y dejar el 16/10 de margen. Si el 14/10 el deploy todavía no funciona, se pasa al
26/10 con todo lo demás listo. Decidirlo en la próxima reunión (que quede en la primera minuta)
y confirmar con los profesores si la ventana es para enviar el formulario o para la defensa.

| Días | Objetivo | Qué entra |
|---|---|---|
| ✅ 10/10 | Tests | Los 7 tests, la base de test y `docs/tests.md`. |
| 11/10 a 12/10 | Decisiones y deploy | Primera minuta (fecha, deploy gratis con Cloudinary, quién defiende cada CU). Fotos en Cloudinary; base, backend y frontend deployados. |
| 13/10 a 14/10 | Deploy probado | Probado desde un celular, con una donación de prueba. `docs/deploy.md` con links y credenciales. Recorrido visual. |
| 15/10 | Entrega | Recargar el seed en la base del deploy, grabar el video, PR `develop` → `main`, tabla de PRs de la propuesta y formulario. |
| 16/10 | Margen | Por si algo falla. Coordinar la defensa. |

**Decisiones de grupo que bloquean lo demás:**

1. Fecha de entrega.
2. ✅ Dependencias de test: Vitest (back y front), Supertest (integración), Testing Library +
   jsdom (componente) y Playwright (E2E). Ya están agregadas: contarlo en la primera minuta.
3. Hosting y fotos: propuesto en [deploy.md](deploy.md), todo con planes gratis (Vercel,
   Render, Aiven y Cloudinary). Como Render gratis borra el disco en cada reinicio, las fotos
   pasan a subirse a Cloudinary en el PR de deploy. Confirmarlo en la primera minuta.
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

### 3.2 Tests ✅

Hechos: qué prueba cada uno, cómo se corren y la evidencia están en [tests.md](tests.md). Las
instrucciones para correrlos están en la sección "Tests" del [README.md](../README.md).

- Si cambia algo de lo que prueban (cálculo nutricional, inventario, donaciones, reseñas, login,
  `ErrorState`, el login o la búsqueda en la interfaz), volver a correr `npm test` y
  `npm run test:e2e`.
- Antes de la entrega, repetir la corrida y actualizar la evidencia de [tests.md](tests.md).

### 3.3 Deploy y credenciales 🟠

El plan completo (servicios gratis, cambio de las fotos, pasos en orden, variables, riesgos y
lista de prueba) está en [deploy.md](deploy.md). Todo se hace con planes gratis. Resumen:

| Parte | Servicio | A tener en cuenta |
|---|---|---|
| Base de datos | Aiven (MySQL gratis) | `npx prisma db push` contra esa URL y cargar `demo-seed.sql`. Las secciones 8 y 10 del seed usan fechas relativas (Top 10 de los últimos 7 días, donaciones): recargarlas antes del video y de la entrega. La intercalación tiene que ignorar mayúsculas y tildes (`utf8mb4_0900_ai_ci`). |
| Backend | Render (plan gratis) | `build`, `start`, `PORT` y `CORS_ORIGINS` ya están. Variables: `DATABASE_URL`, un `JWT_SECRET` nuevo, `CORS_ORIGINS` y `FRONTEND_URL` (la URL del front), las 3 `CLOUDINARY_*`, `GEMINI_API_KEY` y `MERCADOPAGO_ACCESS_TOKEN`, nunca en el repo. Se apaga a los 15 minutos sin uso: el primer ingreso tarda hasta 1 minuto (avisarlo con las credenciales). |
| Frontend | Vercel | `VITE_API_BASE_URL` apuntando al backend. Redirigir todas las rutas a `/index.html` (`frontend/vercel.json`): sin eso, recargar `/admin` da 404. |
| Fotos | Cloudinary (gratis) | Falta el cambio de código ([deploy.md](deploy.md), sección 4.3): el backend sube cada foto a Cloudinary y guarda el link. Sin las variables `CLOUDINARY_*` (en local) se siguen guardando en `backend/uploads/`. |

Después, completar la sección "Links y credenciales" de [deploy.md](deploy.md) (ya está en el
índice): links, admin (`admindemo`), un usuario común (`juanperez`) y el comprador de prueba de
Mercado Pago con la tarjeta de prueba. Probarlo desde un celular, con una donación incluida.

### 3.4 Video 🟠

Guion: landing → registro y login → crear y publicar una receta (CU) → inventario y recetas
que se pueden hacer con él (CU) → reseñar una receta de otro (CU) → donar con el comprador de
prueba (CU) → buscador y listados con filtros → perfil, seguir y el inicio → Chefcito Bot →
panel de administración. Recargar el seed antes de grabar. El plan gratis de Gemini permite 20
consultas por día y por modelo: no gastarlas probando el mismo día.

### 3.5 Entrega 🔴

1. PR `develop` → `main` (hoy `main` sigue en la estructura inicial del 06/07).
2. Sumar a la tabla de [proposal.md](proposal.md#pull-requests) los PRs de deploy y el de
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

Lo que importa para la cátedra: cada integrante capaz de explicar un test y de defender un CU,
aunque no los haya programado. Los tests están en [tests.md](tests.md). La "Parte" es la de [guia-defensa.md](guia-defensa.md).

| Integrante | Pendiente | Test que explica en la defensa | CU que defiende (Parte) |
|---|---|---|---|
| Stéfano | Minutas, revisar PRs, PR a `main`, formulario | Integración (Supertest) + unitario de `reviewService` | Reseñar recetas (+ Seguir), D |
| Elías | Mantener [api.md](api.md) al día | Unitarios de `pantryMatchService` y `recipeNutritionService` | Recetas según ingredientes, C |
| Juan | Recorrido visual, video | Componente (`ErrorState`) + E2E | Crear y publicar recetas, B |
| Gastón | Deploy con Mercado Pago, `docs/deploy.md` | Unitario de las funciones de donaciones | Donar a creadores, A |

## 6. Checklist de entrega AD

- [x] Propuesta con tecnologías, DER, alcance adicional y links a los PRs
- [x] `README.md` raíz con instalación y link a `docs/README.md`
- [x] `.env.example` en back y front
- [x] Documentación de la API
- [x] Metodología, tracking y avance por fase
- [ ] Fecha decidida y primera minuta
- [x] 4 tests unitarios de backend + 1 de integración, pasando
- [x] 1 test de componente + 1 E2E en el front, pasando
- [x] `docs/tests.md` con la evidencia
- [x] Base de test aparte (`.env.test`)
- [ ] Deploy funcionando y probado desde un celular, con una donación
- [ ] `docs/deploy.md` con links y credenciales
- [ ] Recorrido visual en 375 / 768 px y modo claro
- [ ] Seed recargado justo antes del video y de la entrega
- [ ] Video
- [ ] PR `develop` → `main` y tabla de PRs de la propuesta al día
- [ ] Formulario enviado y defensa coordinada
