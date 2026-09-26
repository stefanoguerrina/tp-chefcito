# Chefcito — Backend

> Contexto de desarrollo para el agente de IA y para los integrantes del equipo.
> Leé este archivo antes de comenzar cualquier tarea sobre el backend.

---

## 1. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js |
| Framework web | Express 5 |
| Lenguaje | TypeScript (compilado a CommonJS con `tsc`) |
| ORM | Prisma 5 (`@prisma/client`) |
| Base de datos | MySQL (servidor local, puerto 3306) |
| Autenticación | JWT (`jsonwebtoken`) + contraseñas hasheadas con `bcrypt` |
| Validación de entrada | `express-validator` |
| Variables de entorno | `dotenv` |
| Dev server | `tsc-watch` → reconstruye y reinicia en cada cambio |

### Scripts disponibles

```bash
npm run dev   # Compila en modo watch y levanta el servidor (puerto 3000)
```

---

## 2. Variables de entorno (`.env`)

El archivo `.env` debe existir en `backend/` y **nunca se commitea**.
Variables requeridas:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DBNAME"

# Variables individuales usadas por el pool directo de mysql2 (database.ts)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=chefcito

# JWT
JWT_SECRET=tu_clave_secreta_aqui
```

> ⚠️ Nunca hardcodear URLs ni credenciales en el código. Siempre usar `process.env`.

---

## 3. Arquitectura — Patrón por feature (MVC ampliado)

El backend sigue un **modelo MVC por capas**, organizado por features dentro de `src/features/`.
Cada feature es autónoma: tiene sus propias carpetas de modelo, repositorio, servicio, controlador, middleware de validación y router.

```
backend/
├── prisma/
│   └── schema.prisma          # Esquema de la BD (fuente de verdad)
├── src/
│   ├── app.ts                 # Entry point: configura Express, CORS y monta rutas
│   ├── database.ts            # Pool directo de mysql2 (queries raw si fuera necesario)
│   ├── core/
│   │   ├── prismaClient.ts    # Singleton de PrismaClient — importar desde acá siempre
│   │   ├── fileStorage.ts     # Carpeta uploads/: rutas públicas y borrado de archivos subidos
│   │   └── middleware/
│   │       └── authMiddleware.ts  # verifyToken / verifyAdmin / verifyOwnerOrAdmin
│   ├── routes/
│   │   └── apiRouter.ts       # Router central que monta todos los sub-routers
│   └── features/
│       ├── auth/              # Login y registro
│       ├── user/              # CRUD de usuarios + panel admin
│       ├── rol/               # CRUD de roles y asignación a usuarios
│       ├── ingredient/        # CRUD de ingredientes
│       ├── ingredientCategory/ # CRUD de categorías de ingredientes
│       ├── nutritionalValue/  # CRUD de valores nutricionales
│       ├── category/          # CRUD de categorías de receta
│       ├── recipe/            # CRUD de recetas
│       ├── recipeIngredient/  # Ingredientes de una receta
│       ├── step/              # Pasos de una receta
│       ├── image/             # Imágenes de una receta (subida con multer)
│       ├── review/            # Reseñas de recetas
│       ├── userRecipe/        # Recetas guardadas
│       ├── inventory/         # Inventario de ingredientes del usuario
│       └── database/          # Endpoint de inicialización/seed (solo dev)
├── uploads/                   # Imágenes subidas (se crea sola, no se commitea)
```

### Estructura interna de cada feature

```
features/<nombre>/
├── models/           # Interfaces/tipos TS de dominio. Sin lógica, solo formas de datos.
├── repository/       # Única capa que habla con Prisma. Sin lógica de negocio.
├── services/         # Lógica de negocio. Orquesta el repositorio.
├── controllers/      # Recibe Request/Response de Express. Llama al servicio y responde.
├── middleware/       # Validaciones con express-validator específicas de la feature.
└── routes/           # Define el Router de Express con sus middlewares y handlers.
```

### Flujo de una request

```
Request HTTP
    │
    ▼ Router (routes/) — aplica middlewares de auth y validación
    ▼ Controller (controllers/) — parsea params/body, llama al service
    ▼ Service (services/) — lógica de negocio
    ▼ Repository (repository/) — queries a Prisma (única capa que toca la BD)
    ▼ PrismaClient → MySQL
```

---

## 4. Convenciones de código

### Nombres
- **Archivos de feature:** `PascalCase + sufijo` → `userRepository.ts`, `userService.ts`
- **Funciones/variables:** `camelCase`
- **Interfaces/Types:** `PascalCase`
- **Handlers de Express:** prefijo `handle` → `handleGetAllUsers`

### Comentarios obligatorios
- **Cabecera de archivo:** primera línea explicando qué hace el archivo
- **Funciones no triviales:** comentario previo con qué recibe y qué devuelve
- **Lógica no obvia:** explicar el "por qué", no el "qué"
- **Sin ruido:** no comentar lo que el código ya dice claramente

### Idioma
- Código, nombres de funciones/variables: **inglés**
- Comentarios, mensajes de error de la API, commits: **español**

---

## 5. Modelo de datos — Prisma Schema

El esquema vive en `prisma/schema.prisma`. **Es la fuente de verdad de la BD.**

### Modelos principales

| Modelo | Tabla | Descripción |
|--------|-------|-------------|
| `User` | `user` | Usuarios. Baja lógica con `deletedAt`. |
| `UserRole` | `userrole` | Tabla intermedia N:M entre `user` y `role`. |
| `role` | `role` | Roles de acceso (`id=1` = Admin). |
| `recipe` | `recipe` | Recetas creadas por usuarios. |
| `ingredient` | `ingredient` | Ingredientes globales. |
| `ingredientcategory` | `ingredientcategory` | Categorías de ingredientes. |
| `ingredientcategoryingredient` | — | Tabla intermedia N:M ingrediente↔categoría. |
| `nutritionalvalue` | `nutritionalvalue` | Valores nutricionales por ingrediente. |
| `inventory` | `inventory` | Ingredientes disponibles por usuario. |
| `recipeingredient` | — | Ingredientes requeridos por receta. |
| `recipecategory` | — | Categorías de una receta. |
| `step` | `step` | Pasos de preparación de una receta. |
| `userrecipe` | `userrecipe` | Recetas guardadas por usuarios. |
| `review` | `review` | Reseñas de usuarios sobre recetas. |
| `donation` | `donation` | Donaciones entre usuarios. |
| `image` | `image` | Imágenes asociadas a recetas. |

### Comandos Prisma útiles

```bash
npx prisma db push         # Aplica cambios del schema a la BD (dev sin migraciones)
npx prisma generate        # Regenera el cliente tras modificar schema.prisma
npx prisma studio          # GUI para explorar la BD
npx prisma migrate dev --name <nombre>  # Crea una migración nombrada
```

> ⚠️ **Siempre correr `npx prisma generate` después de modificar `schema.prisma`.**

---

## 6. Autenticación y autorización

- Auth propia con **JWT**. El token se emite en `POST /api/auth/login`.
- **Niveles de acceso:**
  - `USER` — usuario estándar (acceso a sus propios datos)
  - `ADMIN` — acceso total (rol `id=1` en tabla `role`, campo `isAdmin` en el payload del JWT)

### Middlewares de auth (`core/middleware/authMiddleware.ts`)

| Middleware | Cuándo usarlo |
|-----------|--------------|
| `verifyToken` | Toda ruta que requiera usuario autenticado. Agrega `req.user`. |
| `verifyAdmin` | Rutas solo para administradores. Usar **después** de `verifyToken`. |
| `verifyOwnerOrAdmin` | Permite acceso si el usuario es el dueño del recurso (`params.id`) **o** es admin. |

---

## 7. Validación de entrada

Se usa **`express-validator`** en la carpeta `middleware/` de cada feature.

### Patrón establecido

```typescript
// 1. Definir reglas como array exportado
export const validateCreateUser = [
  body('email').isEmail().withMessage('Email inválido.'),
];

// 2. Middleware que consume los errores y responde 422
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: 'Error de validación.', errors: errors.array() });
    return;
  }
  next();
};

// 3. Uso en el router: validaciones → handleValidationErrors → controller
router.post('/', validateCreateUser, handleValidationErrors, handleCreateUser);
```

---

## 8. Protección contra SQL Injection

> **TL;DR: Prisma nos protege automáticamente. Nunca concatenar strings en queries.**

### Por qué estamos protegidos

Prisma usa **prepared statements** (queries parametrizadas) para **todas** las operaciones del ORM.
Cuando escribís:

```typescript
prisma.user.findFirst({ where: { username: inputDelUsuario } })
```

Prisma genera internamente:

```sql
SELECT * FROM user WHERE username = ?  -- el ? es un parámetro, no texto interpolado
```

El valor de `inputDelUsuario` **nunca se interpola como texto SQL**.
La BD lo recibe como un valor binario separado del query, haciendo imposible que algo como `' OR '1'='1` sea interpretado como código SQL.

### Regla crítica: usar `$queryRaw` solo con tagged templates

El único riesgo sería usar las APIs de raw SQL **mal**:

```typescript
// ❌ MAL — vulnerable a SQL Injection
const nombre = req.body.name;
const result = await prisma.$queryRawUnsafe(`SELECT * FROM user WHERE name = '${nombre}'`);

// ✅ BIEN — tagged template literal: Prisma parametriza automáticamente
const result = await prisma.$queryRaw`SELECT * FROM user WHERE name = ${nombre}`;

// ✅ BIEN — helper Prisma.sql
import { Prisma } from '@prisma/client';
const result = await prisma.$queryRaw(Prisma.sql`SELECT * FROM user WHERE name = ${nombre}`);
```

**Regla simple:** si usás el tagged template literal de Prisma (backticks sin concatenación), estás seguro.
Si armás un string manualmente con concatenación → riesgo de inyección.

### Segunda capa: express-validator

Aunque Prisma ya protege, `express-validator` agrega defensa en profundidad:
- Valida **tipos** antes de que lleguen al repositorio (`isInt`, `isEmail`, `isISO8601`)
- Hace `trim()` para eliminar espacios y caracteres extraños
- Rechaza con **422** si los datos no tienen el formato esperado

### Resumen del flujo de seguridad

```
Input del usuario
    │
    ▼  express-validator: valida tipo, formato, longitud → rechaza 422 si falla
    ▼  Service: lógica de negocio sin tocar SQL
    ▼  Prisma ORM: genera prepared statements automáticamente
    ▼  MySQL: recibe parámetros binarios, nunca código SQL inyectable
```

---

## 9. Manejo de errores HTTP

| Código | Cuándo usarlo |
|--------|--------------|
| `200 OK` | Operación exitosa con datos |
| `201 Created` | Recurso creado exitosamente |
| `204 No Content` | Operación exitosa sin datos de respuesta |
| `400 Bad Request` | Parámetros malformados (ej. ID no numérico) |
| `401 Unauthorized` | Token ausente o inválido |
| `403 Forbidden` | Token válido pero sin permisos suficientes |
| `404 Not Found` | Recurso no encontrado |
| `409 Conflict` | Duplicados (username o email ya en uso) |
| `422 Unprocessable Entity` | Errores de validación (`express-validator`) |
| `500 Internal Server Error` | Errores inesperados del servidor |

> Los controllers nunca devuelven errores crudos de Prisma o JS al cliente. Siempre mensajes amigables en español.

---

## 9.1 Imágenes de recetas (subida de archivos)

Las fotos **no se guardan en la base de datos**. `POST/PATCH /api/recipes/:idRecipe/images`
aceptan dos formatos:

- **Archivo** (`multipart/form-data`, campo `image`): lo procesa `multer`
  (`features/image/middleware/imageUploadMiddleware.ts`), que valida tipo (JPG, PNG, WEBP,
  GIF) y tamaño (máx. 2 MB) y lo guarda en `backend/uploads/recipes/` con un nombre único.
- **Link externo** (JSON, campo `imageUrl`): debe empezar con `http://` o `https://`.
  Ya no se aceptan data URLs en base64.

En la columna `image.imageUrl` (`VARCHAR(500)`) queda solo la ruta pública
(ej. `/uploads/recipes/recipe-123.webp`) o el link. Express sirve la carpeta en `/uploads`.
Al reemplazar o borrar una imagen, o al borrar la receta, el archivo se elimina del disco.
El frontend comprime la foto (WebP, máx. 1280px) antes de subirla.

---

## 10. Baja lógica (Soft Delete)

Los usuarios **no se eliminan físicamente** de la BD.
Se usa el campo `deletedAt: DateTime?` en el modelo `User`.

- **Dar de baja:** `userRepository.softDelete(id)` → setea `deletedAt = new Date()`
- **Restaurar:** `userRepository.restore(id)` → setea `deletedAt = null`
- **Queries activos:** siempre filtran `where: { deletedAt: null }`
- **Queries de inactivos:** filtran `where: { deletedAt: { not: null } }`

Si otro modelo necesita soft delete en el futuro, replicar este mismo patrón.

---

## 11. Singleton de Prisma

Siempre importar el cliente desde `src/core/prismaClient.ts`.
**Nunca** instanciar `new PrismaClient()` en otro archivo.

```typescript
import prisma from '../../../core/prismaClient.js';
```

Esto evita abrir múltiples conexiones innecesarias a la BD.

---

## 12. Cómo agregar una nueva feature

1. Crear carpeta `src/features/<nombre>/` con subcarpetas: `models/`, `repository/`, `services/`, `controllers/`, `middleware/`, `routes/`
2. Definir el modelo en `schema.prisma` (si aplica) y correr `npx prisma generate`
3. Implementar en orden: **model → repository → service → controller → middleware → router**
4. Montar el nuevo router en `src/routes/apiRouter.ts`
5. Todo archivo nuevo lleva la cabecera de comentario obligatoria

---

## 13. Pautas académicas (DSW)

### Regularidad ✅
- [x] Desarrollado en JavaScript/TypeScript
- [x] Framework web: Express
- [x] API REST expuesta al frontend
- [x] BD persistente externa: MySQL
- [x] ORM/mapper: Prisma
- [x] Arquitectura por capas (MVC + Repository)
- [x] Validación de entrada con mensajes de error apropiados
- [x] Dependencias registradas en `package.json`

### Aprobación ⬜
- [x] Login con autenticación propia (JWT + bcrypt)
- [x] Al menos 2 niveles de acceso (USER / ADMIN)
- [x] Rutas protegidas por nivel de acceso
- [x] Ambientes con `.env`
- [ ] 1 test automatizado por integrante (pendiente)
- [ ] 1 test de integración (pendiente)

---

## 14. Equipo y workflow Git

- **Líder de equipo:** Stéfano Guerrina (revisa y mergea PRs a `main`)
- Ramas desde `develop`, nombres en inglés
- PRs con descripción breve
- **Nunca** mergear directo a `main`
