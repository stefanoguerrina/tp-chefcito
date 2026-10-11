# Deploy

Qué es el deploy de Chefcito, qué pide la cátedra, qué opción de hosting conviene, los pasos en
orden, los riesgos y, al final, los links y las credenciales de la aplicación publicada.

## 1. Qué es hacer el deploy

Hoy Chefcito funciona solo en la computadora de cada uno: MySQL local, el backend en
`localhost:3000` y el frontend en `localhost:5173`. Hacer el deploy es poner esas mismas piezas
en servidores de internet, para que cualquiera (los profesores) entre desde un link, sin
instalar nada.

El código no cambia: cambia **dónde corre** cada parte y **cómo se configura**. Lo que en local
está en los `.env`, en el deploy se carga como variables de entorno en el panel de cada
hosting.

```mermaid
flowchart LR
    U[Navegador del usuario] -->|HTML, JS y CSS| F[Frontend<br>build estático de Vite]
    U -->|pedidos /api con el token| B[Backend<br>Express + Prisma]
    U -->|fotos /uploads| B
    B --> D[(MySQL gestionado)]
    B --> V[[Disco persistente<br>backend/uploads]]
    B --> MP[Mercado Pago]
    B --> G[Google Gemini]
```

| Pieza | En local | En el deploy |
|---|---|---|
| Base de datos | MySQL instalado en la PC | Un MySQL "gestionado": el proveedor lo mantiene encendido y con backups |
| Backend | `npm run dev` (compila y reinicia en cada cambio) | `npm run build` una vez y `npm start` (el build de producción en `dist/`) |
| Fotos subidas | Carpeta `backend/uploads/` | Un disco que sobreviva a los reinicios del backend (ver sección 4) |
| Frontend | Servidor de desarrollo de Vite | `npm run build` genera archivos estáticos (`frontend/dist/`) que sirve un hosting estático |

## 2. Qué pide la cátedra

Ver [consigna-catedra.md](consigna-catedra.md):

- Para la Aprobación Directa se entregan **"Links de Deploy"** y **"Credenciales para utilizar
  la aplicación deployada"** (sección 3.3 de la consigna). Esos datos van al final de este
  documento y en el formulario de entrega.
- La base de datos **"no debe requerir ejecutarse en local"** (FAQ, bases de datos): tiene que
  ser un servicio al que el backend se conecte por red. Un MySQL gestionado lo cumple.
- "Definir ambientes" ya está cumplido con los `.env`: el deploy es un ambiente más
  (producción), con sus propias variables.

La consigna no exige un proveedor en particular. Lo que importa es que la app funcione desde el
link el día que la prueben los profesores, con los datos de demo cargados.

## 3. Qué necesita cada parte de Chefcito

El código ya está preparado para el deploy:

| Ya está | Dónde |
|---|---|
| `npm run build` y `npm start` en el backend (incluye `prisma generate`) | `backend/package.json` |
| El puerto se toma de `PORT` (lo define el hosting) | `backend/src/server.ts` |
| Orígenes permitidos por CORS configurables con `CORS_ORIGINS` | `backend/src/app.ts` |
| La vuelta desde Mercado Pago usa `FRONTEND_URL`; con `https` vuelve sola al sitio (`auto_return`) | `features/donation` |
| El frontend lee la URL del backend de `VITE_API_BASE_URL` | `frontend/src/shared/config/config.js` |
| Las fotos se guardan como ruta (`/uploads/...`) y el frontend le antepone el dominio del backend | `shared/utils/imageUrl.js` |
| Chequeo de salud con la base: `GET /api/database/health` | `features/database` |
| Las fotos de los datos de demo son links externos (`placehold.co`), no archivos | `docs/demo-seed.sql` |

Lo que **falta** agregar al repositorio (cambios chicos, en un PR de deploy):

| Falta | Por qué |
|---|---|
| `frontend/vercel.json` con una regla que mande todas las rutas a `/index.html` (en Netlify sería `frontend/public/_redirects`) | React Router resuelve las rutas en el navegador. Sin la regla, entrar directo a `/admin` o recargar `/recetas/3` le pide ese archivo al hosting, que no existe, y da 404 |
| `"engines": { "node": ">=22" }` en los dos `package.json` | Vite 8 y TypeScript 6 piden un Node reciente; así el hosting no usa uno viejo |

## 4. La decisión importante: dónde guardar las fotos

Las fotos de recetas, perfiles e ingredientes se guardan como archivos en `backend/uploads/`
(la base solo guarda la ruta). Eso define el hosting del backend:

- En un hosting **sin disco persistente** (por ejemplo, el plan gratis de Render), cada
  reinicio arranca con el disco vacío: **las fotos subidas desaparecen** y la app muestra
  imágenes rotas. En el plan gratis de Render el backend además se apaga tras 15 minutos sin
  uso, y al volver a encenderse pierde los archivos.
- En un hosting **con volumen persistente** (Railway, o Render pago), la carpeta `uploads`
  vive en un disco aparte que sobrevive a reinicios y redeploys.

Pasar las fotos a un servicio externo (Cloudinary, S3) también lo resolvería, pero implica
cambiar código y agregar una dependencia a días de la entrega: no conviene ahora.

## 5. Opciones de hosting y recomendación

| | Opción A (recomendada) | Opción B (todo gratis) |
|---|---|---|
| Frontend | Vercel (gratis) | Vercel (gratis) |
| Backend | Railway, con un volumen para `uploads` | Render, plan gratis |
| Base de datos | MySQL de Railway, en el mismo proyecto | Aiven, MySQL gratis |
| Costo | Plan Hobby de Railway: US$5 por mes (unos US$1,25 cada uno) | US$0 |
| Fotos subidas | Se conservan | Se pierden cada vez que el backend se apaga o se redeploya |
| Primer pedido después de un rato sin uso | Inmediato | Hasta 1 minuto (el backend "se despierta") |
| Revisión de donaciones vencidas cada 10 min (`server.ts`) | Corre siempre | Solo mientras el backend está encendido |
| Base | Siempre encendida | Aiven puede apagarla si no se usa (avisa por mail y se reenciende desde el panel) |
| Configuración | Base y backend en un mismo panel; el backend se conecta a la base por red interna | Tres cuentas y tres paneles |

**Recomendación: opción A.** Por US$5 en total, la app que ven los profesores funciona igual que
en local: rápida, con las fotos que suban y con la base siempre disponible. La opción B sirve si
no se quiere pagar, aceptando que hay que avisar en las credenciales que el primer ingreso tarda
y que las fotos subidas no se conservan.

Notas sobre los planes (verificar los valores al crear las cuentas, cambian seguido):

- Railway da un crédito único de US$5 para probar. Puede alcanzar para armar el deploy, pero si
  se agota la app se apaga: para las semanas de entrega y defensa conviene el plan Hobby y darlo
  de baja después.
- Vercel gratis alcanza de sobra para un frontend estático.
- Render gratis: 750 horas por mes, se apaga a los 15 minutos sin tráfico, disco temporal.
- Aiven gratis: MySQL de 1 nodo, 1 GB de RAM y 1 GB de disco, sin vencimiento.
- La base gratis de Render es PostgreSQL y vence a los 30 días: no sirve (el proyecto usa MySQL).

Desde qué rama se publica: **`main`**. Primero se hace el PR `develop` → `main` (el código ya
está terminado) y se conectan los hostings a `main`. Así lo publicado es exactamente lo
entregado, y cada merge a `main` vuelve a publicar solo.

## 6. Paso a paso (opción A)

El orden importa: el backend necesita la URL de la base, el frontend la del backend, y el
backend a su vez la del frontend (CORS y Mercado Pago). Por eso el backend se configura dos
veces.

### 6.1 Base de datos

1. Crear un proyecto en Railway conectado al repositorio de GitHub y agregarle un servicio
   **MySQL**.
2. Revisar el juego de caracteres de la base (desde MySQL Workbench o la consola de Railway):
   `SELECT @@character_set_database, @@collation_database;` tiene que dar `utf8mb4` y
   `utf8mb4_0900_ai_ci`. Si no, `ALTER DATABASE <base> CHARACTER SET utf8mb4 COLLATE
   utf8mb4_0900_ai_ci;` **antes** de crear las tablas. Sin esto el buscador distingue tildes y
   mayúsculas, y pueden romperse los acentos.
3. Crear las tablas desde una PC del equipo, apuntando a la URL **pública** de la base
   (`MYSQL_PUBLIC_URL` en Railway), sin guardarla en ningún archivo del repositorio:

   ```powershell
   cd backend
   $env:DATABASE_URL="mysql://usuario:contraseña@host-publico:puerto/base"; npx prisma db push
   ```

   Una variable ya definida en la terminal tiene prioridad sobre el `backend/.env` (el mismo
   mecanismo que usa `npm run test:db`), así que la base local no se toca. Cerrar esa terminal
   al terminar.
4. Cargar [demo-seed.sql](demo-seed.sql) en esa base (MySQL Workbench conectado a la URL
   pública, o `mysql ... < docs/demo-seed.sql`).

### 6.2 Backend

1. Agregar al proyecto de Railway un servicio desde el repositorio, con **Root Directory
   `backend`**, comando de build `npm run build` y de inicio `npm start`.
2. Agregarle un **volumen** montado en la carpeta `uploads` del backend (con Root Directory
   `backend` suele ser `/app/uploads`; confirmarlo subiendo una foto y reiniciando el servicio).
3. Cargar las variables (sección 7). `DATABASE_URL` se toma de la URL **interna** de la base
   (en Railway, una referencia a la variable `MYSQL_URL` del servicio MySQL), más rápida y sin
   salir a internet. `CORS_ORIGINS` y `FRONTEND_URL` se completan en el paso 6.4.
4. Generar el dominio público del servicio y probar
   `https://<backend>/api/database/health`: tiene que responder 200.

### 6.3 Frontend

1. En Vercel, importar el repositorio con **Root Directory `frontend`**. Detecta Vite solo:
   build `npm run build`, carpeta de salida `dist`.
2. Variable `VITE_API_BASE_URL=https://<backend>/api`. Vite la **copia dentro del build**: si se
   cambia, hay que volver a publicar el frontend para que tome efecto.
3. Elegir un nombre de proyecto claro (por ejemplo `chefcito`), que define la URL
   `https://chefcito.vercel.app` (o la que quede libre).

### 6.4 Cerrar el círculo

1. En el backend: `CORS_ORIGINS=https://<frontend>` y `FRONTEND_URL=https://<frontend>`, sin
   barra al final. El backend se reinicia solo al guardar.
2. Probar todo con la lista de la sección 9.

## 7. Variables de entorno

Ninguna de estas va en el repositorio: se cargan en el panel de cada hosting.

| Servicio | Variable | Valor | Secreta |
|---|---|---|:-:|
| Backend | `DATABASE_URL` | URL interna de la base | Sí |
| Backend | `JWT_SECRET` | Texto largo y aleatorio, **distinto** del de desarrollo | Sí |
| Backend | `CORS_ORIGINS` | `https://<frontend>` | No |
| Backend | `FRONTEND_URL` | `https://<frontend>` | No |
| Backend | `GEMINI_API_KEY` | Clave de Google AI Studio | Sí |
| Backend | `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL` | Opcionales, los mismos valores que en `.env.example` | No |
| Backend | `MERCADOPAGO_ACCESS_TOKEN` | Access Token **de prueba** de la cuenta vendedora | Sí |
| Backend | `PORT` | No se carga: lo define el hosting | |
| Frontend | `VITE_API_BASE_URL` | `https://<backend>/api` | No |

No definir `NODE_ENV=production` en el backend antes del build: npm saltearía las
`devDependencies`, entre ellas TypeScript, y `npm run build` fallaría.

## 8. Riesgos y cómo cubrirlos

| Riesgo | Qué pasa | Cómo se cubre |
|---|---|---|
| Fotos en un disco temporal | Las fotos subidas desaparecen | Volumen persistente (opción A) |
| Rutas del frontend sin redirigir | Recargar o entrar directo a `/admin` da 404 | `frontend/vercel.json` (sección 3) |
| CORS mal configurado | El frontend carga pero ningún dato: "error de conexión" | `CORS_ORIGINS` igual a la URL del frontend, con `https` y sin barra final. Las URLs de vista previa de Vercel son otras: probar siempre en la de producción |
| URL del backend con `http` | El navegador bloquea los pedidos y las fotos desde una página `https` | Usar siempre la URL `https` del backend |
| `VITE_API_BASE_URL` cambiada sin volver a publicar | El frontend sigue llamando a la URL vieja | Redeploy del frontend después de cambiarla |
| Base con otra intercalación | El buscador distingue tildes y mayúsculas, o acentos rotos | Paso 6.1.2, antes de `prisma db push` |
| Datos de demo con fechas relativas | El Top 10 de la semana y las donaciones de demo "envejecen" y quedan vacíos | Recargar la base antes del video y de la entrega (sección 10) |
| Credenciales públicas (`123456`) | Cualquiera con el link puede entrar como admin y borrar datos | Recargar la base justo antes de la entrega y tener la recarga a mano para antes de la defensa |
| Secretos subidos a GitHub | Cualquiera usa la clave de Gemini o firma tokens | Solo en el panel del hosting; nunca un `.env` de producción en el repo |
| Cuota gratis de Gemini (20 consultas por día y por modelo) | El bot responde que no está disponible | No gastar consultas probando el día del video o de la defensa |
| Plan del hosting vencido o sin crédito | La app se apaga cuando la prueban los profesores | Mantener el plan activo hasta cerrar la nota (las instancias llegan hasta el 13/11, más la defensa) |
| Primer pedido lento (solo opción B) | El primer ingreso tarda hasta 1 minuto | Avisarlo junto a las credenciales y abrir la app un rato antes de la defensa |

## 9. Lista de prueba después del deploy

Probar en la URL de producción, desde la computadora **y desde un celular**:

- [ ] La landing muestra el top de recetas (pedido público al backend).
- [ ] Login con `juanperez` y con `admindemo`; el admin entra a `/admin`.
- [ ] Recargar la página estando en `/admin` y en el detalle de una receta: no da 404.
- [ ] Buscar "fideos": aparecen resultados (los acentos se ven bien).
- [ ] Crear una receta con foto, reiniciar el backend desde el panel y verificar que la foto sigue.
- [ ] Una donación con el comprador de prueba de Mercado Pago: vuelve sola al sitio y queda completada.
- [ ] Chefcito Bot responde (una sola consulta, para no gastar la cuota).
- [ ] La sesión se mantiene al recargar y el logout funciona.

## 10. Mantenimiento

- **Publicar cambios:** con los hostings conectados a `main`, cada merge a `main` vuelve a
  publicar backend y frontend. Si un cambio toca `schema.prisma`, correr también
  `npx prisma db push` contra la base del deploy (paso 6.1.3).
- **Recargar los datos de demo** (antes del video, de la entrega y de la defensa): con la URL
  pública de la base, `npx prisma db push --force-reset` (borra todos los datos y vuelve a crear
  las tablas) y después cargar `demo-seed.sql` de nuevo. Se pierde todo lo que se haya cargado
  a mano en el deploy.
- **Logs:** si algo falla, los paneles de Railway (o Render) y Vercel muestran la salida del
  build y del servidor. Los errores del backend responden siempre JSON sin detalles internos, así
  que el motivo real está en esos logs.

## 11. Cómo explicarlo en la defensa

- **¿Dónde corre cada parte?** Frontend estático en Vercel; backend Node y MySQL en Railway;
  Mercado Pago y Gemini son servicios externos que llama solo el backend.
- **¿Cómo se configura cada ambiente?** Con variables de entorno: `.env` en desarrollo,
  `.env.test` para el test de integración y las variables del panel en producción. El código es
  el mismo en los tres.
- **¿Por qué un volumen?** Porque las fotos son archivos en el disco del backend, y en un
  hosting sin disco persistente se borran en cada reinicio.
- **¿Por qué hace falta CORS?** Frontend y backend están en dominios distintos; el backend solo
  acepta pedidos del dominio del frontend.
- **¿Por qué la regla de redirección del frontend?** Porque las rutas las maneja React Router en
  el navegador: el hosting tiene que devolver siempre `index.html`.

## 12. Links y credenciales

A completar cuando el deploy esté funcionando.

| | Link |
|---|---|
| Aplicación (frontend) | _pendiente_ |
| API (backend) | _pendiente_ |

Usuarios de la aplicación (cargados por `demo-seed.sql`):

| Usuario | Contraseña | Rol | Para qué |
|---|---|---|---|
| `admindemo` | `123456` | Administrador | Panel de administración |
| `juanperez` | `123456` | Usuario | El más completo: inventario, seguidos y donaciones recibidas y realizadas |

Para probar una donación (Mercado Pago en modo prueba, sin dinero real):

| Dato | Valor |
|---|---|
| Usuario comprador de prueba de Mercado Pago | _pendiente_ |
| Contraseña | _pendiente_ |
| Tarjeta de prueba | _pendiente_ (titular `APRO` para aprobar el pago) |
