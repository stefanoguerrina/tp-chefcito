# Chefcito — Frontend

Aplicación web de Chefcito, hecha con **React 19 + Vite**. Se comunica con el backend
(`../backend`) mediante su API REST.

## Requisitos

- Node.js 20 o superior (con npm).
- El backend de Chefcito corriendo (ver [`../backend/README.md`](../backend/README.md)).

## Instalación y ejecución

```bash
cd frontend
npm install
```

Crear un archivo `.env` en `frontend/` con la URL de la API del backend:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Levantar el servidor de desarrollo:

```bash
npm run dev
```

La app queda disponible en `http://localhost:5173`.

### Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción para probarlo |
| `npm run lint` | Revisa el código con ESLint |

## Stack

| Tema | Tecnología |
|---|---|
| Framework | React 19 (componentes funcionales + hooks) |
| Build / dev server | Vite |
| Rutas | React Router (`react-router-dom`) |
| Estado compartido | Context API + `useReducer` (sesión en `src/app/AuthContext.jsx`) |
| Estilos | SASS, mobile-first, breakpoints SM (576px), MD (768px) y LG (1024px) |

## Estructura

```
src/
├── app/                # App.jsx (rutas), AuthContext (sesión) y ProtectedRoute (acceso por rol)
├── core/components/    # Componentes reutilizables: modales, cards, ErrorState, etc.
├── core/hooks/         # Hooks reutilizables
├── shared/             # Configuración y utilidades (apiFetch, ApiError, imágenes)
├── styles/abstracts/   # Variables SASS (colores, espaciados, tipografía) y breakpoints
└── features/<feature>/ # Una carpeta por funcionalidad:
    ├── pages/          #   páginas (una por ruta)
    ├── components/     #   componentes de la feature
    ├── hooks/          #   estado y lógica de la feature
    ├── services/       #   llamadas HTTP al backend
    ├── models/         #   mapeo de los datos de la API
    └── styles/         #   estilos SASS de la feature
```

## Rutas y niveles de acceso

| Ruta | Acceso |
|---|---|
| `/bienvenida` | Visitantes sin sesión (landing, login y registro) |
| `/` | Inicio del usuario: recetas de la comunidad |
| `/recetas/:id` | Detalle de una receta con sus reseñas |
| `/mis-recetas`, `/mis-recetas/nueva`, `/mis-recetas/:id/editar` | Listado y editor de recetas propias |
| `/perfil`, `/usuarios/:id` | Perfil propio y perfil de otro usuario |
| `/inventario` | Ingredientes disponibles del usuario |
| `/guardadas` | Recetas guardadas |
| `/admin/:seccion?` | Panel de administración (solo rol administrador) |

Las rutas de usuario y de administrador están protegidas por `ProtectedRoute`: sin sesión
se redirige a `/bienvenida`, y un usuario sin el rol necesario vuelve a su propio inicio.

## Manejo de errores

Todas las llamadas al backend pasan por `shared/utils/apiFetch.js`, que convierte
cualquier falla en un `ApiError` con un mensaje para el usuario (incluye los errores
de validación del backend, la falta de conexión y la sesión vencida). En la interfaz:

- **Error de un campo de formulario** → mensaje debajo del campo.
- **Falla de una acción** (guardar, borrar) → modal de aviso (`AlertModal`).
- **Falla al cargar una sección** → `ErrorState` con botón "Reintentar".
- **Acciones destructivas** → confirmación con `ConfirmModal`.

## Imágenes de recetas

La foto de portada se comprime en el navegador (WebP, máximo 1280px) antes de subirse
al backend, que la guarda en disco. En la base de datos solo se guarda la ruta del
archivo, no la imagen. También se puede pegar el link de una imagen externa.
