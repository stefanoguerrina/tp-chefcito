# Chefcito

Aplicación web para planificar comidas a partir de los ingredientes disponibles y las
necesidades nutricionales del usuario. Funciona como una red social de recetas: se pueden
crear, guardar y reseñar recetas, seguir a otros usuarios, donar a los creadores y consultar a
un ChatBot con IA.

Trabajo práctico de la materia Desarrollo de Software, comisión 3K02.

| Legajo | Integrante |
|---|---|
| 54394 | Alí, Elías |
| 54653 | Guerrina, Stéfano |
| 54780 | Persig, Juan Andrés |
| 54323 | Schujman, Gastón Enrique |

La documentación del proyecto (propuesta, API, metodología, tracking y minutas) está en
[docs/README.md](docs/README.md).

## Estructura

El repositorio tiene dos partes independientes que se comunican por una API REST:

| Carpeta | Contenido | Tecnologías |
|---|---|---|
| `backend/` | API REST | Node.js, Express 5, TypeScript, Prisma, MySQL |
| `frontend/` | Aplicación web | React 19, Vite, React Router, SASS |

Cada una tiene su propio `package.json` y su propio archivo `.env`, y se ejecuta por separado.

## Requisitos

- Node.js 20 o superior (incluye npm).
- Un servidor MySQL 8 al que se pueda conectar.
- Un navegador actualizado (Chrome, Edge o Firefox).

## Instalación

### 1. Crear la base de datos

Crear una base vacía en MySQL (desde MySQL Workbench o la terminal):

```sql
CREATE DATABASE chefcito CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

El juego de caracteres `utf8mb4` hace que los acentos y la "ñ" se guarden bien, y la
intercalación `ai_ci` hace que el buscador ignore mayúsculas y tildes.

### 2. Configurar el backend

Copiar `backend/.env.example` como `backend/.env` y completar los datos de la conexión a
MySQL:

```env
DATABASE_URL="mysql://root:CONTRASEÑA@localhost:3306/chefcito"
JWT_SECRET=cualquier-texto
```

| Variable | Obligatoria | Para qué |
|---|:-:|---|
| `DATABASE_URL` | Sí | Conexión a MySQL: usuario, contraseña, host, puerto y nombre de la base del paso 1. |
| `JWT_SECRET` | Sí | Clave con la que se firman las sesiones. Puede ser cualquier texto. |
| `GEMINI_API_KEY` | No | Clave de Google Gemini para Chefcito Bot. Se obtiene gratis en [Google AI Studio](https://aistudio.google.com/apikey). Sin ella el chat avisa que no está disponible. |
| `MERCADOPAGO_ACCESS_TOKEN` | No | Access Token de prueba de Mercado Pago para las donaciones (ver [Donaciones](#donaciones-opcional)). Sin él no se puede donar. |
| `PORT`, `CORS_ORIGINS`, `FRONTEND_URL` | No | Solo para el deploy. En local se usan los valores por defecto. |

El resto de la aplicación funciona sin las variables opcionales.

### 3. Instalar el backend y crear las tablas

```bash
cd backend
npm install
npx prisma db push
```

`prisma db push` crea las tablas a partir del modelo de datos (`backend/prisma/schema.prisma`).

### 4. Cargar los datos de prueba

Ejecutar completo el archivo [docs/demo-seed.sql](docs/demo-seed.sql) contra la base creada,
por ejemplo pegándolo en MySQL Workbench o desde la terminal:

```bash
mysql -u root -p chefcito < docs/demo-seed.sql
```

Carga categorías, ingredientes con valores nutricionales, usuarios, recetas, reseñas, seguidos y
donaciones de ejemplo. Se ejecuta una sola vez: si se vuelve a correr, falla a propósito para no
duplicar los usuarios.

### 5. Configurar e instalar el frontend

Copiar `frontend/.env.example` como `frontend/.env`. Ya trae la URL del backend en local:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

```bash
cd frontend
npm install
```

## Ejecución

En dos terminales separadas:

```bash
# Terminal 1: backend, en http://localhost:3000
cd backend
npm run dev

# Terminal 2: frontend, en http://localhost:5173
cd frontend
npm run dev
```

Abrir `http://localhost:5173` en el navegador. Si se cambia algo del `backend/.env`, hay que
reiniciar el backend.

## Usuarios de prueba

Todos los usuarios cargados por `demo-seed.sql` tienen la contraseña `123456`. Se puede iniciar
sesión con el nombre de usuario o con el email.

| Usuario | Email | Rol |
|---|---|---|
| `admindemo` | `admin.demo@chefcito.com` | Administrador |
| `juanperez` | `juan.perez.demo@chefcito.com` | Usuario |
| `mariagomez` | `maria.gomez.demo@chefcito.com` | Usuario |
| `carlosdiaz` | `carlos.diaz.demo@chefcito.com` | Usuario |
| `luciafernandez` | `lucia.fernandez.demo@chefcito.com` | Usuario |
| `martinlopez` | `martin.lopez.demo@chefcito.com` | Usuario |

`juanperez` es el más completo para recorrer la app: tiene ingredientes en su inventario (para
el filtro "Inventario" de los listados de recetas), sigue a otros usuarios (su inicio muestra
sus recetas y reseñas) y tiene donaciones recibidas y realizadas. `admindemo` entra al panel de
administración.

## Donaciones (opcional)

Las donaciones se pagan con Mercado Pago Checkout Pro en modo prueba, sin dinero real:

1. Crear una aplicación en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app)
   con el producto Checkout Pro y copiar su Access Token de prueba en
   `MERCADOPAGO_ACCESS_TOKEN` del `backend/.env`.
2. Reiniciar el backend.
3. Para pagar, iniciar sesión en Mercado Pago con un usuario de prueba comprador y usar una de
   las [tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards).
   El nombre del titular define el resultado: `APRO` aprueba el pago y `OTHE` lo rechaza.

El checkout se abre en otra pestaña y Chefcito detecta el pago solo, sin tener que volver desde
Mercado Pago.

## Scripts

| Carpeta | Comando | Qué hace |
|---|---|---|
| `backend/` | `npm run dev` | Compila y levanta la API, y la reinicia en cada cambio |
| `backend/` | `npm run build` | Build de producción en `dist/` |
| `backend/` | `npm start` | Levanta el build de producción |
| `frontend/` | `npm run dev` | Servidor de desarrollo |
| `frontend/` | `npm run build` | Build de producción en `dist/` |
| `frontend/` | `npm run preview` | Sirve el build de producción |
| `frontend/` | `npm run lint` | Revisa el código con ESLint |

## Problemas comunes

- **Los acentos se ven mal** (por ejemplo "Ã¡" en vez de "á"): la base se creó o se cargó con
  otro juego de caracteres. Borrar la base, crearla como en el paso 1 y repetir los pasos 3 y 4.
- **El frontend no trae datos**: revisar que el backend esté corriendo y que
  `VITE_API_BASE_URL` apunte a él. Si se cambia el `.env` del frontend, reiniciar `npm run dev`.
- **Error de conexión a la base al levantar el backend**: revisar usuario, contraseña y nombre de
  la base en `DATABASE_URL`, y que MySQL esté corriendo.
