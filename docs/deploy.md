# Deploy

Qué es el deploy de Chefcito, qué pide la cátedra, qué servicios se usan (todos con plan
gratis), cómo se resuelven las fotos, los pasos en orden, los riesgos y, al final, los links y
las credenciales de la aplicación publicada.

## 1. Qué es hacer el deploy

Hoy Chefcito funciona solo en la computadora de cada uno: MySQL local, el backend en
`localhost:3000` y el frontend en `localhost:5173`. Hacer el deploy es poner esas mismas piezas
en servidores de internet, para que cualquiera (los profesores) entre desde un link, sin
instalar nada.

El código casi no cambia: cambia **dónde corre** cada parte y **cómo se configura**. Lo que en
local está en los `.env`, en el deploy se carga como variables de entorno en el panel de cada
servicio. El único cambio de código es dónde se guardan las fotos (sección 4).

```mermaid
flowchart LR
    U[Navegador del usuario] -->|HTML, JS y CSS| F[Frontend en Vercel<br>build estático de Vite]
    U -->|pedidos /api con el token| B[Backend en Render<br>Express + Prisma]
    U -->|fotos, link https| C[(Cloudinary<br>fotos subidas)]
    B --> D[(MySQL en Aiven)]
    B -->|sube y borra fotos| C
    B --> MP[Mercado Pago]
    B --> G[Google Gemini]
```

| Pieza | En local | En el deploy |
|---|---|---|
| Base de datos | MySQL instalado en la PC | MySQL "gestionado" en Aiven: el proveedor lo mantiene encendido y con backups |
| Backend | `npm run dev` (compila y reinicia en cada cambio) | En Render: `npm run build` una vez y `npm start` (el build de producción en `dist/`) |
| Fotos subidas | Carpeta `backend/uploads/` | Cloudinary, un servicio externo de imágenes (sección 4) |
| Frontend | Servidor de desarrollo de Vite | En Vercel: `npm run build` genera archivos estáticos (`frontend/dist/`) |

## 2. Qué pide la cátedra

Ver [consigna-catedra.md](consigna-catedra.md):

- Para la Aprobación Directa se entregan **"Links de Deploy"** y **"Credenciales para utilizar
  la aplicación deployada"** (sección 3.3 de la consigna). Esos datos van al final de este
  documento y en el formulario de entrega.
- La base de datos **"no debe requerir ejecutarse en local"** (FAQ, bases de datos): tiene que
  ser un servicio al que el backend se conecte por red. El MySQL de Aiven lo cumple.
- "Definir ambientes" ya está cumplido con los `.env`: el deploy es un ambiente más
  (producción), con sus propias variables.

La consigna no exige un proveedor en particular ni que sea pago. Lo que importa es que la app
funcione desde el link el día que la prueben los profesores, con los datos de demo cargados.

## 3. Servicios: todo con plan gratis

La facultad no da recursos para hosting, así que todo el deploy usa planes gratis.

| Parte | Servicio | Qué da el plan gratis | Limitación que hay que aceptar |
|---|---|---|---|
| Frontend | [Vercel](https://vercel.com) (Hobby) | Hosting de sitios estáticos con `https` | Ninguna para este uso |
| Backend | [Render](https://render.com) (Free) | Un servicio Node con `https`, 750 horas por mes (alcanza para tenerlo todo el mes) | Se apaga a los 15 minutos sin uso y tarda hasta 1 minuto en volver a encenderse. Su disco es temporal: se borra en cada reinicio |
| Base de datos | [Aiven](https://aiven.io) (Free MySQL) | MySQL 8 de 1 nodo, 1 GB de RAM y 1 GB de disco, sin vencimiento | Si no se usa por un tiempo puede apagarla: avisa por mail y se vuelve a encender desde el panel |
| Fotos | [Cloudinary](https://cloudinary.com) (Free) | 25 créditos por mes. Cada crédito equivale a 1 GB guardado, 1 GB descargado o 1000 transformaciones | Ninguna para este uso: las fotos ya llegan comprimidas (WebP, 1280 px) |

Ninguno pide tarjeta para el plan gratis. Los límites cambian seguido: confirmarlos al crear
cada cuenta.

Conviene crear las cuentas con un mail del equipo al que tengan acceso todos (o con la cuenta de
GitHub de quien haga el deploy) y guardar las contraseñas en un lugar compartido del grupo,
fuera del repositorio.

Desde qué rama se publica: **`main`**. Primero se hace el PR `develop` → `main` y se conectan
Render y Vercel a `main`. Así lo publicado es exactamente lo entregado, y cada merge a `main`
vuelve a publicar solo.

## 4. Las fotos: por qué Cloudinary

### 4.1 El problema

Las fotos de recetas, perfiles e ingredientes hoy se guardan como archivos en
`backend/uploads/` (la base solo guarda la ruta, por ejemplo `/uploads/recipes/x.webp`). En
Render gratis el disco es temporal: cada vez que el backend se apaga por falta de uso, se
reinicia o se vuelve a publicar, arranca con la carpeta vacía y **las fotos subidas
desaparecen**. Un profesor que suba una foto al probar la app la vería rota un rato después.

### 4.2 La solución

El backend sube cada foto a **Cloudinary**, un servicio de almacenamiento de imágenes, y en la
base guarda el link `https` que devuelve Cloudinary (por ejemplo
`https://res.cloudinary.com/<cuenta>/image/upload/v123/chefcito/recipes/x.webp`). Las fotos
ya no dependen del disco del backend.

Es el mismo patrón que ya se usa con Mercado Pago y Gemini: un servicio externo que llama solo
el backend, con `fetch` (sin SDK ni dependencias nuevas) y con las claves en variables de
entorno.

```mermaid
sequenceDiagram
    participant N as Navegador
    participant B as Backend (Render)
    participant C as Cloudinary
    participant D as MySQL (Aiven)
    N->>B: PATCH /api/users/5/avatar (archivo "image")
    Note over B: multer valida tipo y tamaño (hasta 2 MB)<br>y deja el archivo en memoria
    B->>C: POST /image/upload (archivo + firma)
    C-->>B: secure_url (link https)
    B->>D: guarda el link en User.avatarUrl
    B->>C: borra la foto anterior (si había)
    B-->>N: 200 usuario con el link nuevo
    N->>C: GET de la foto (directo, sin pasar por el backend)
```

Por qué conviene:

- **El frontend no cambia.** `resolveImageUrl`
  ([imageUrl.js](../frontend/src/shared/utils/imageUrl.js)) ya muestra tal cual cualquier link
  `http(s)`; solo le antepone el dominio del backend a las rutas `/uploads/...`.
- **La base no cambia.** Las columnas (`image.imageUrl`, `User.avatarUrl`, `User.coverUrl`,
  `ingredient.imagePath`) ya guardan texto: una ruta o un link.
- **El desarrollo local no cambia.** Si las variables `CLOUDINARY_*` no están cargadas, las
  fotos se siguen guardando en `backend/uploads/` como hoy (igual que Gemini, que sin su clave
  simplemente no se usa). Nadie del equipo necesita una cuenta de Cloudinary para programar y
  los tests no cambian.
- **Las fotos de los datos de demo ya son links externos** (`placehold.co`), así que no se
  tocan.

Alternativas que se descartaron:

| Alternativa | Por qué no |
|---|---|
| Pagar un hosting con disco persistente (Railway, Render pago) | Cuesta dinero |
| Supabase Storage (gratis, 1 GB) | El proyecto gratis se pausa tras una semana sin uso: puede pasar entre la entrega y la defensa |
| Cloudflare R2 o Amazon S3 | Piden tarjeta, y su firma de pedidos es bastante más compleja |
| Guardar las fotos dentro de la base | La base gratis tiene 1 GB, y va contra lo que ya se decidió: en la base se guarda la ruta, no la imagen |
| Un servidor propio gratis (Oracle Cloud) | Pide tarjeta y hay que administrar un servidor Linux (https, reinicios, actualizaciones) |

### 4.3 Qué cambia en el código

Va en el PR de deploy, solo en el backend:

| Archivo | Cambio |
|---|---|
| [fileStorage.ts](../backend/src/core/fileStorage.ts) | Dos funciones nuevas. **Subir**: si hay credenciales de Cloudinary, manda el archivo a Cloudinary y devuelve su link `https`; si no, lo escribe en `backend/uploads/<carpeta>/` y devuelve `/uploads/...` como hoy. **Borrar**: si el link es de Cloudinary, le pide a Cloudinary que la borre; si es `/uploads/...`, borra el archivo del disco como hoy; cualquier otro link se ignora |
| `imageUploadMiddleware.ts`, `ingredientImageUploadMiddleware.ts`, `userImageUploadMiddleware.ts` | multer pasa de `diskStorage` a `memoryStorage`: valida igual que ahora, pero deja el archivo en memoria (`req.file.buffer`) en vez de escribirlo en el disco |
| `imageController.ts`, `ingredientController.ts`, `userController.ts` | En lugar de armar la ruta con `toPublicPath`, llaman a la función de subir y guardan el link que devuelve. Si la operación falla después de subir, borran la foto (como hoy borran el archivo huérfano) |
| Services que hoy llaman a `deleteLocalUpload` (receta, imagen, ingrediente, usuario) | Llaman a la función de borrar, que entiende los dos tipos de link |
| `backend/.env.example` | Las 3 variables nuevas, comentadas como opcionales |

Cómo se llama a Cloudinary sin SDK (su API de subida firmada):

- **Subir:** `POST https://api.cloudinary.com/v1_1/<cloud_name>/image/upload`, un `FormData`
  con `file`, `folder` (por ejemplo `chefcito/recipes`), `timestamp`, `api_key` y `signature`.
  Responde `secure_url` (el link que se guarda) y `public_id`.
- **Borrar:** `POST https://api.cloudinary.com/v1_1/<cloud_name>/image/destroy` con
  `public_id`, `timestamp`, `api_key` y `signature`. El `public_id` se saca del link guardado
  (lo que sigue a `/upload/v<número>/`, sin la extensión).
- **Firma:** SHA-1 (módulo `crypto`, que viene con Node) de los parámetros ordenados
  alfabéticamente (`folder=...&timestamp=...`) seguidos del `API Secret`. Así Cloudinary sabe
  que el pedido viene del backend sin que el secreto viaje nunca.

## 5. Qué más falta agregar al repositorio

El resto del código ya está preparado para el deploy:

| Ya está | Dónde |
|---|---|
| `npm run build` y `npm start` en el backend (incluye `prisma generate`) | `backend/package.json` |
| El puerto se toma de `PORT` (lo define Render) | `backend/src/server.ts` |
| Orígenes permitidos por CORS configurables con `CORS_ORIGINS` | `backend/src/app.ts` |
| La vuelta desde Mercado Pago usa `FRONTEND_URL`; con `https` vuelve sola al sitio (`auto_return`) | `features/donation` |
| La revisión de donaciones vencidas corre al arrancar y cada 10 minutos, así que se pone al día cada vez que Render enciende el backend | `backend/src/server.ts` |
| El frontend lee la URL del backend de `VITE_API_BASE_URL` | `frontend/src/shared/config/config.js` |
| Chequeo de salud con la base: `GET /api/database/health` | `features/database` |

Lo que **falta**, en el mismo PR de deploy que las fotos:

| Falta | Por qué |
|---|---|
| Subida de fotos a Cloudinary | Sección 4.3 |
| `frontend/vercel.json` con una regla que mande todas las rutas a `/index.html` | React Router resuelve las rutas en el navegador. Sin la regla, entrar directo a `/admin` o recargar `/recetas/3` le pide ese archivo a Vercel, que no existe, y da 404 |
| `"engines": { "node": ">=22" }` en los dos `package.json` | Vite 8 y TypeScript 6 piden un Node reciente; así Render y Vercel no usan uno viejo |
| Variables `CLOUDINARY_*` en el [README.md](../README.md) raíz y en este documento | Para que quede documentado qué se carga en cada ambiente |

## 6. Paso a paso

El orden importa: el backend necesita la URL de la base y las claves de Cloudinary, el frontend
la URL del backend, y el backend a su vez la del frontend (CORS y Mercado Pago). Por eso el
backend se configura dos veces.

### 6.1 Cloudinary

1. Crear la cuenta en Cloudinary (gratis, se puede entrar con GitHub o Google).
2. En el panel (**Dashboard** o **Settings → API Keys**) copiar **Cloud name**, **API Key** y
   **API Secret**. Las tres van a variables del backend (sección 7); el `API Secret` es secreto.
3. No hace falta crear carpetas: Cloudinary crea `chefcito/recipes`, `chefcito/users` y
   `chefcito/ingredients` con la primera foto de cada tipo.

### 6.2 Base de datos (Aiven)

1. Crear la cuenta en Aiven y un servicio **MySQL** con el plan **Free**.
2. Copiar la **Service URI** del panel. Tiene la forma
   `mysql://avnadmin:<contraseña>@<host>:<puerto>/defaultdb?ssl-mode=REQUIRED`.
3. Adaptarla para Prisma, que no entiende `ssl-mode`: reemplazar `?ssl-mode=REQUIRED` por
   `?sslaccept=accept_invalid_certs`. La conexión sigue cifrada; solo no valida el certificado,
   que Aiven firma con su propia autoridad. Esa URL adaptada es la `DATABASE_URL`.
4. Revisar el juego de caracteres de la base (desde MySQL Workbench conectado a Aiven):
   `SELECT @@character_set_database, @@collation_database;` tiene que dar `utf8mb4` y
   `utf8mb4_0900_ai_ci`. Si no, `ALTER DATABASE defaultdb CHARACTER SET utf8mb4 COLLATE
   utf8mb4_0900_ai_ci;` **antes** de crear las tablas. Sin esto el buscador distingue tildes y
   mayúsculas, y pueden romperse los acentos.
5. Crear las tablas desde una PC del equipo, sin guardar la URL en ningún archivo del
   repositorio:

   ```powershell
   cd backend
   $env:DATABASE_URL="mysql://avnadmin:contraseña@host:puerto/defaultdb?sslaccept=accept_invalid_certs"; npx prisma db push
   ```

   Una variable ya definida en la terminal tiene prioridad sobre el `backend/.env` (el mismo
   mecanismo que usa `npm run test:db`), así que la base local no se toca. Cerrar esa terminal
   al terminar.
6. Cargar [demo-seed.sql](demo-seed.sql) en esa base (MySQL Workbench conectado a Aiven, con
   SSL activado, o `mysql ... < docs/demo-seed.sql`).

### 6.3 Backend (Render)

1. En Render, **New → Web Service**, conectar el repositorio de GitHub, rama `main`, plan
   **Free**, con:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
2. Cargar las variables (sección 7). `CORS_ORIGINS` y `FRONTEND_URL` se completan en el paso
   6.5.
3. Opcional: en **Settings → Health Check Path**, poner `/api/database/health`, así Render
   avisa si el backend no llega a la base.
4. Esperar el primer deploy y probar `https://<backend>.onrender.com/api/database/health`:
   tiene que responder 200.

### 6.4 Frontend (Vercel)

1. En Vercel, importar el repositorio con **Root Directory `frontend`**. Detecta Vite solo:
   build `npm run build`, carpeta de salida `dist`.
2. Variable `VITE_API_BASE_URL=https://<backend>.onrender.com/api`. Vite la **copia dentro del
   build**: si se cambia, hay que volver a publicar el frontend para que tome efecto.
3. Elegir un nombre de proyecto claro (por ejemplo `chefcito`), que define la URL
   `https://chefcito.vercel.app` (o la que quede libre).

### 6.5 Cerrar el círculo

1. En Render: `CORS_ORIGINS=https://<frontend>` y `FRONTEND_URL=https://<frontend>`, sin barra
   al final. Render vuelve a publicar el backend al guardar.
2. Probar todo con la lista de la sección 9.

## 7. Variables de entorno

Ninguna de estas va en el repositorio: se cargan en el panel de cada servicio.

| Servicio | Variable | Valor | Secreta |
|---|---|---|:-:|
| Render | `DATABASE_URL` | URL de Aiven adaptada (paso 6.2.3) | Sí |
| Render | `JWT_SECRET` | Texto largo y aleatorio, **distinto** del de desarrollo | Sí |
| Render | `CORS_ORIGINS` | `https://<frontend>` | No |
| Render | `FRONTEND_URL` | `https://<frontend>` | No |
| Render | `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary | No |
| Render | `CLOUDINARY_API_KEY` | API Key de Cloudinary | No |
| Render | `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | Sí |
| Render | `GEMINI_API_KEY` | Clave de Google AI Studio | Sí |
| Render | `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL` | Opcionales, los mismos valores que en `.env.example` | No |
| Render | `MERCADOPAGO_ACCESS_TOKEN` | Access Token **de prueba** de la cuenta vendedora | Sí |
| Render | `PORT` | No se carga: lo define Render | |
| Vercel | `VITE_API_BASE_URL` | `https://<backend>.onrender.com/api` | No |

No definir `NODE_ENV=production` en Render antes del build: npm saltearía las
`devDependencies`, entre ellas TypeScript, y `npm run build` fallaría.

## 8. Riesgos y cómo cubrirlos

| Riesgo | Qué pasa | Cómo se cubre |
|---|---|---|
| Backend apagado por falta de uso (Render gratis) | El primer pedido después de 15 minutos sin uso tarda hasta 1 minuto | Avisarlo junto a las credenciales del formulario. Abrir la app unos minutos antes de la defensa y del video |
| Variables `CLOUDINARY_*` sin cargar en Render | Las fotos se guardan en el disco temporal de Render y desaparecen al reiniciar | Cargar las 3 variables. Comprobarlo con la lista de la sección 9 (el link de la foto tiene que ser de `res.cloudinary.com`) |
| Base apagada por falta de uso (Aiven gratis) | El backend responde error de base: `GET /api/database/health` falla | Revisar el mail de Aiven y encenderla desde el panel. Entrar a la app cada tanto hasta cerrar la nota |
| Rutas del frontend sin redirigir | Recargar o entrar directo a `/admin` da 404 | `frontend/vercel.json` (sección 5) |
| CORS mal configurado | El frontend carga pero ningún dato: "error de conexión" | `CORS_ORIGINS` igual a la URL del frontend, con `https` y sin barra final. Las URLs de vista previa de Vercel son otras: probar siempre en la de producción |
| URL del backend con `http` | El navegador bloquea los pedidos desde una página `https` | Usar siempre la URL `https` de Render |
| `VITE_API_BASE_URL` cambiada sin volver a publicar | El frontend sigue llamando a la URL vieja | Redeploy del frontend después de cambiarla |
| Base con otra intercalación | El buscador distingue tildes y mayúsculas, o acentos rotos | Paso 6.2.4, antes de `prisma db push` |
| Datos de demo con fechas relativas | El Top 10 de la semana y las donaciones de demo "envejecen" y quedan vacíos | Recargar la base antes del video y de la entrega (sección 10) |
| Credenciales públicas (`123456`) | Cualquiera con el link puede entrar como admin y borrar datos | Recargar la base justo antes de la entrega y tener la recarga a mano para antes de la defensa |
| Secretos subidos a GitHub | Cualquiera usa la clave de Gemini, sube fotos a la cuenta de Cloudinary o firma tokens | Solo en el panel de cada servicio; nunca un `.env` de producción en el repo |
| Cuota gratis de Gemini (20 consultas por día y por modelo) | El bot responde que no está disponible | No gastar consultas probando el día del video o de la defensa |
| Cambios en los planes gratis | Un servicio cambia sus límites o deja de ser gratis | Confirmar los límites al crear las cuentas y mantenerlas activas hasta cerrar la nota (las instancias llegan hasta el 13/11, más la defensa) |

## 9. Lista de prueba después del deploy

Probar en la URL de producción, desde la computadora **y desde un celular**:

- [ ] La landing muestra el top de recetas (pedido público al backend).
- [ ] Login con `juanperez` y con `admindemo`; el admin entra a `/admin`.
- [ ] Recargar la página estando en `/admin` y en el detalle de una receta: no da 404.
- [ ] Buscar "fideos": aparecen resultados (los acentos se ven bien).
- [ ] Crear una receta con foto: la foto se ve y su link (clic derecho → abrir imagen) es de
      `res.cloudinary.com`.
- [ ] Reiniciar el backend desde Render (**Manual Deploy → Restart service**) y verificar que
      la foto sigue.
- [ ] Cambiar la foto de perfil y la de un ingrediente: la anterior desaparece de la Media
      Library de Cloudinary.
- [ ] Una donación con el comprador de prueba de Mercado Pago: vuelve sola al sitio y queda completada.
- [ ] Chefcito Bot responde (una sola consulta, para no gastar la cuota).
- [ ] La sesión se mantiene al recargar y el logout funciona.

## 10. Mantenimiento

- **Publicar cambios:** con Render y Vercel conectados a `main`, cada merge a `main` vuelve a
  publicar backend y frontend. Si un cambio toca `schema.prisma`, correr también
  `npx prisma db push` contra la base de Aiven (paso 6.2.5).
- **Recargar los datos de demo** (antes del video, de la entrega y de la defensa): con la URL de
  Aiven, `npx prisma db push --force-reset` (borra todos los datos y vuelve a crear las tablas)
  y después cargar `demo-seed.sql` de nuevo. Se pierde todo lo que se haya cargado a mano en el
  deploy. Las fotos que se habían subido quedan en Cloudinary sin uso: se pueden borrar desde
  la Media Library (carpeta `chefcito`).
- **Logs:** si algo falla, los paneles de Render y Vercel muestran la salida del build y del
  servidor. Los errores del backend responden siempre JSON sin detalles internos, así que el
  motivo real está en esos logs.

## 11. Cómo explicarlo en la defensa

- **¿Dónde corre cada parte?** Frontend estático en Vercel, backend Node en Render, MySQL en
  Aiven y las fotos en Cloudinary. Mercado Pago, Gemini y Cloudinary son servicios externos que
  llama solo el backend. Todo con planes gratis.
- **¿Cómo se configura cada ambiente?** Con variables de entorno: `.env` en desarrollo,
  `.env.test` para el test de integración y las variables del panel en producción. El código es
  el mismo en los tres.
- **¿Por qué Cloudinary?** Porque el disco del backend en Render gratis se borra en cada
  reinicio. Las fotos se suben a Cloudinary y en la base se guarda el link; si no hay
  credenciales (en local), se guardan en el disco como antes.
- **¿Cómo sabe Cloudinary que el pedido es nuestro?** Cada pedido lleva una firma SHA-1 hecha
  con el `API Secret`, que nunca sale del backend.
- **¿Por qué tarda el primer ingreso?** Render gratis apaga el backend tras 15 minutos sin uso
  y lo vuelve a encender con el primer pedido.
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

El primer ingreso después de un rato sin uso puede tardar hasta 1 minuto (el backend se
enciende); después responde normal.

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
