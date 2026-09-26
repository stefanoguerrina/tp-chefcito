# Guía rápida para probar Chefcito

Notas para levantar el proyecto y probarlo, sin conocer cómo está armado por dentro.
El proyecto es un monorepo con dos partes que corren por separado: `backend/` (API) y
`frontend/` (la web). Cada una necesita su propio archivo `.env` en su carpeta — no se
suben al repositorio, hay que crearlos a mano siguiendo esta guía.

## 1. Requisitos antes de empezar

- Node.js 20 o superior.
- Un servidor MySQL corriendo en tu máquina (o accesible por red), con una base de
  datos vacía creada para el proyecto.

## 2. Backend (`backend/.env`)

Creá el archivo `backend/.env` con este contenido:

```env
# --- Ya completado, no hace falta tocarlo ---
JWT_SECRET=chefcito-profesor-dsw-2026

# --- COMPLETAR con los datos de TU servidor MySQL ---
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_DE_MYSQL_ACA
DB_NAME=chefcito

# --- COMPLETAR: mismo usuario/contraseña/base que arriba, en formato URL ---
DATABASE_URL="mysql://root:TU_CONTRASEÑA_DE_MYSQL_ACA@localhost:3306/chefcito"
```

- **`JWT_SECRET`**: ya tiene un valor listo, no hace falta cambiarlo (es la clave con la
  que el backend firma las sesiones; puede ser cualquier texto).
- **`DB_HOST` / `DB_PORT`**: si tu MySQL corre local con la configuración por defecto,
  déjalos así.
- **`DB_USER` / `DB_PASSWORD`**: los de tu propio usuario de MySQL (`DB_PASSWORD` es el
  único dato que **sí o sí** tenés que completar vos; nosotros no lo conocemos).
- **`DB_NAME`**: el nombre de la base de datos vacía que vas a crear para el proyecto
  (podés dejarlo en `chefcito` si creás la base con ese mismo nombre, ver paso 3).
- **`DATABASE_URL`**: es un resumen de los 5 campos de arriba en un solo string; hay
  que completarlo con la misma contraseña que pusiste en `DB_PASSWORD`.

## 3. Crear la base de datos y cargar los datos de prueba

1. Creá una base de datos vacía con el nombre que pusiste en `DB_NAME` (por ejemplo,
   desde MySQL Workbench o la terminal: `CREATE DATABASE chefcito;`).
2. Desde `backend/`, instalá las dependencias y creá las tablas a partir del modelo de
   datos del proyecto:
   ```bash
   cd backend
   npm install
   npx prisma db push
   ```
3. Cargá los datos de prueba (usuarios, ingredientes, recetas, reseñas) ejecutando
   **todo** el archivo [`demo-seed.sql`](demo-seed.sql) (está en esta misma carpeta)
   contra esa base (por ejemplo, pegándolo entero en una pestaña de MySQL Workbench y
   ejecutándolo, o `mysql -u root -p chefcito < docs/demo-seed.sql`). El archivo explica
   en sus propios comentarios qué carga y con qué usuarios podés entrar.

## 4. Frontend (`frontend/.env`)

Creá el archivo `frontend/.env` con este contenido (ya completo, no hace falta tocar
nada mientras corras el backend en tu misma máquina):

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 5. Levantar todo

En dos terminales separadas:

```bash
# Terminal 1 — backend (queda escuchando en el puerto 3000)
cd backend
npm run dev

# Terminal 2 — frontend (abre en http://localhost:5173)
cd frontend
npm install
npm run dev
```

Abrí `http://localhost:5173` en el navegador.

## 6. Usuarios para probar la app

Todos los usuarios de prueba (los carga el paso 3) tienen la **misma contraseña: `123456`**.

| Para probar como... | Usuario / Email | Contraseña |
|---|---|---|
| **Administrador** (panel de admin: usuarios, roles, ingredientes, categorías) | `admindemo` / `admin.demo@chefcito.com` | `123456` |
| Usuario común | `juanperez` / `juan.perez.demo@chefcito.com` | `123456` |
| Usuario común | `mariagomez` / `maria.gomez.demo@chefcito.com` | `123456` |
| Usuario común | `carlosdiaz` / `carlos.diaz.demo@chefcito.com` | `123456` |
| Usuario común | `luciafernandez` / `lucia.fernandez.demo@chefcito.com` | `123456` |
| Usuario común | `martinlopez` / `martin.lopez.demo@chefcito.com` | `123456` |

Se puede iniciar sesión con el email o con el nombre de usuario indistintamente. Los 5
usuarios comunes ya tienen recetas, reseñas, recetas guardadas e inventario cargados
para poder recorrer la app sin partir de cero.
