# Tracking de tareas, bugs e issues

Seguimiento de las tareas de cada fase (ver [metodologia.md](metodologia.md)), los bugs
corregidos y los pendientes. "Asignada a" es el reparto inicial de la fase; "PR" indica quién
la terminó integrando.

Estados: **Hecha**, **En curso**, **Pendiente**.

## Fase 1: Infraestructura y base de datos

| Tarea | Descripción | Asignada a | Estado | PR |
|---|---|---|---|---|
| T-1.1 | Repositorio monorepo y ramas `main` y `develop` | Stéfano | Hecha | Commits iniciales en `main` (06/07) |
| T-1.2 | Esquema de la base de datos y conexión desde Node | Elías | Hecha | [#2](https://github.com/stefanoguerrina/tp-chefcito/pull/2) (Elías) |
| T-1.3 | Login y registro en backend, sesión con token en frontend | Juan | Hecha | [#3](https://github.com/stefanoguerrina/tp-chefcito/pull/3) (Juan, frontend), [#4](https://github.com/stefanoguerrina/tp-chefcito/pull/4) (Stéfano, backend) |
| T-1.4 | Routers base de Express y estructura de carpetas de React | Gastón | Hecha | [#1](https://github.com/stefanoguerrina/tp-chefcito/pull/1) (Gastón) |

## Fase 2: Entidades base

| Tarea | Descripción | Asignada a | Estado | PR |
|---|---|---|---|---|
| T-2.1 | CRUD Usuario (perfil, baja lógica, roles) | Stéfano | Hecha | [#5](https://github.com/stefanoguerrina/tp-chefcito/pull/5), [#6](https://github.com/stefanoguerrina/tp-chefcito/pull/6) (Stéfano) |
| T-2.2 | CRUD Categoría-Ingrediente, Ingrediente y Valor nutricional | Elías | Hecha | [#7](https://github.com/stefanoguerrina/tp-chefcito/pull/7) (Elías) |
| T-2.3 | CRUD Categoría-Receta | Juan | Hecha | Commit `a1babf4` directo en `develop` (Juan, 02/09) |
| T-2.4 | Layout, navegación, sidebar y estilos globales | Gastón | Hecha | Commit `16efc7f` directo en `develop` (Juan, 02/09), [#15](https://github.com/stefanoguerrina/tp-chefcito/pull/15), [#18](https://github.com/stefanoguerrina/tp-chefcito/pull/18) (Stéfano) |

## Fase 3: Núcleo del negocio

| Tarea | Descripción | Asignada a | Estado | PR |
|---|---|---|---|---|
| T-3.1 | CRUD Receta con categorías y creador | Stéfano | Hecha | [#8](https://github.com/stefanoguerrina/tp-chefcito/pull/8) (Elías) |
| T-3.2 | Ingredientes y pasos de la receta | Elías | Hecha | [#8](https://github.com/stefanoguerrina/tp-chefcito/pull/8) (Elías), [#18](https://github.com/stefanoguerrina/tp-chefcito/pull/18) (Stéfano, editor por secciones) |
| T-3.3 | Subida de imágenes | Juan | Hecha | [#8](https://github.com/stefanoguerrina/tp-chefcito/pull/8) (Elías), [#17](https://github.com/stefanoguerrina/tp-chefcito/pull/17) (Stéfano, archivos en el servidor) |
| T-3.4 | CRUD Valoración (reseñas y promedio) | Gastón | Hecha | [#10](https://github.com/stefanoguerrina/tp-chefcito/pull/10) (Stéfano) |
| Extra | CRUD Rol y asignación de roles | Gastón | Hecha | [#9](https://github.com/stefanoguerrina/tp-chefcito/pull/9) (Gastón) |

## Fase 4: Lógica avanzada

| Tarea | Descripción | Asignada a | Estado | PR |
|---|---|---|---|---|
| T-4.1 | CRUD Inventario | Stéfano | Hecha | [#11](https://github.com/stefanoguerrina/tp-chefcito/pull/11) (Stéfano) |
| T-4.2 | Recetas según el inventario | Elías | Hecha | [#19](https://github.com/stefanoguerrina/tp-chefcito/pull/19) (Stéfano) |
| T-4.3 | Donaciones con pago | Juan | Hecha | [#27](https://github.com/stefanoguerrina/tp-chefcito/pull/27) (Gastón), [#28](https://github.com/stefanoguerrina/tp-chefcito/pull/28) (Juan, historial) |
| T-4.4 | Listados con filtros (tiempo, valoración, necesidades nutricionales) y recetas guardadas | Gastón | Hecha | [#12](https://github.com/stefanoguerrina/tp-chefcito/pull/12), [#13](https://github.com/stefanoguerrina/tp-chefcito/pull/13) (Gastón), [#19](https://github.com/stefanoguerrina/tp-chefcito/pull/19), [#26](https://github.com/stefanoguerrina/tp-chefcito/pull/26) (Stéfano) |
| Extra | Panel de administración | Stéfano | Hecha | [#15](https://github.com/stefanoguerrina/tp-chefcito/pull/15), [#24](https://github.com/stefanoguerrina/tp-chefcito/pull/24) (Stéfano) |
| Extra | Perfil, inicio y landing | Juan | Hecha | [#14](https://github.com/stefanoguerrina/tp-chefcito/pull/14), [#25](https://github.com/stefanoguerrina/tp-chefcito/pull/25) (Juan) |
| Extra | Seguir usuarios e inicio con amigos y Top 10 semanal | Stéfano | Hecha | [#22](https://github.com/stefanoguerrina/tp-chefcito/pull/22) (Stéfano) |

## Fase 5: IA y cierre

| Tarea | Descripción | Asignada a | Estado | PR |
|---|---|---|---|---|
| T-5.1 | Integración con Gemini en el backend | Stéfano | Hecha | [#21](https://github.com/stefanoguerrina/tp-chefcito/pull/21) (Gastón) |
| T-5.2 | Chat en el frontend | Elías | Hecha | [#21](https://github.com/stefanoguerrina/tp-chefcito/pull/21) (Gastón) |
| T-5.3 | QA y corrección de errores del frontend | Juan | En curso | [#16](https://github.com/stefanoguerrina/tp-chefcito/pull/16), [#29](https://github.com/stefanoguerrina/tp-chefcito/pull/29) (Stéfano), [#28](https://github.com/stefanoguerrina/tp-chefcito/pull/28) (Juan) |
| T-5.4 | Optimización de consultas y manejo de errores del backend | Gastón | Hecha | [#23](https://github.com/stefanoguerrina/tp-chefcito/pull/23), [#29](https://github.com/stefanoguerrina/tp-chefcito/pull/29), [#31](https://github.com/stefanoguerrina/tp-chefcito/pull/31) (Stéfano) |

## Fase 6: Entrega final

| Tarea | Descripción | Asignada a | Estado |
|---|---|---|---|
| T-6.1 | Tests: 1 unitario por integrante y 1 de integración en el backend, con base de test aparte ([#34](https://github.com/stefanoguerrina/tp-chefcito/pull/34)) | Todos | Hecha |
| T-6.2 | Tests del frontend: 1 de componente y 1 end-to-end ([#34](https://github.com/stefanoguerrina/tp-chefcito/pull/34)) | Juan, Gastón | Hecha |
| T-6.3 | Documentación: README, API, metodología, tracking y minutas ([#32](https://github.com/stefanoguerrina/tp-chefcito/pull/32)) | Stéfano | Hecha |
| T-6.4 | Deploy de backend (Render), frontend (Vercel), base de datos (Aiven) y fotos (Cloudinary), publicado y probado el 12/10, con links y usuarios en [deploy.md](deploy.md) ([#36](https://github.com/stefanoguerrina/tp-chefcito/pull/36), [#38](https://github.com/stefanoguerrina/tp-chefcito/pull/38), Stéfano) | Gastón | Hecha |
| T-6.5 | Video de la aplicación | Juan | Pendiente |
| T-6.6 | Pull request de `develop` a `main` ([#37](https://github.com/stefanoguerrina/tp-chefcito/pull/37), [#39](https://github.com/stefanoguerrina/tp-chefcito/pull/39), [#41](https://github.com/stefanoguerrina/tp-chefcito/pull/41); repetirlo con lo último antes de entregar) y formulario de entrega | Stéfano | En curso |

## Bugs corregidos

| Bug | Corrección | PR |
|---|---|---|
| Consultas repetidas por cada elemento de un listado (N+1) | El backend devuelve la valoración y los conteos dentro del listado | [#23](https://github.com/stefanoguerrina/tp-chefcito/pull/23) |
| Acentos rotos al cargar los datos de prueba desde un cliente en latin1 | `SET NAMES utf8mb4` al inicio de `demo-seed.sql` | [#23](https://github.com/stefanoguerrina/tp-chefcito/pull/23) |
| Formularios sin indicar el campo con error | Validación antes de enviar y error debajo de cada campo | [#23](https://github.com/stefanoguerrina/tp-chefcito/pull/23) |
| Chefcito Bot fallaba siempre por tardar más de 30 segundos | Razonamiento del modelo al mínimo y reintento con un modelo de respaldo | [#24](https://github.com/stefanoguerrina/tp-chefcito/pull/24) |
| Rutas inexistentes y JSON mal formado respondían HTML con el stack trace | Middleware final que responde siempre JSON (404, 400, 413, 500) | [#28](https://github.com/stefanoguerrina/tp-chefcito/pull/28) |
| Listados vacíos respondían 404 | Responden `200 []` | [#28](https://github.com/stefanoguerrina/tp-chefcito/pull/28) |
| Validaciones duplicadas en los controllers | Una sola validación en el middleware de cada ruta | [#28](https://github.com/stefanoguerrina/tp-chefcito/pull/28) |
| Páginas sin indicador mientras cargaban datos | Estado de carga en todas las secciones y aviso global para pedidos lentos | [#28](https://github.com/stefanoguerrina/tp-chefcito/pull/28), [#29](https://github.com/stefanoguerrina/tp-chefcito/pull/29) |
| El panel de administración volvía a cargar todo al cambiar de sección | Las secciones abiertas quedan montadas y se actualizan en segundo plano | [#29](https://github.com/stefanoguerrina/tp-chefcito/pull/29) |
| En una base vacía, el primer registro creaba el rol "Usuario" con el id 1 (el de administrador) y todo usuario nuevo quedaba como admin | Al registrar, primero se crea el rol "Admin" con id 1 si no existe | [#34](https://github.com/stefanoguerrina/tp-chefcito/pull/34) |
| Las fotos subidas se perdían en el deploy, porque el disco de Render gratis se borra en cada reinicio | Las fotos se suben a Cloudinary cuando están sus variables (en local, al disco como antes) | [#36](https://github.com/stefanoguerrina/tp-chefcito/pull/36) |
| En celular la landing no mostraba "Iniciar sesión" (solo "Registrarse"), y entre 768 y 1024 px el buscador de la barra tapaba el logo | En celular el logo queda solo con el gorro y se ven los dos botones; el buscador aparece desde 1024 px y nunca achica el logo | [#38](https://github.com/stefanoguerrina/tp-chefcito/pull/38) |
| En celular, el primer toque en un campo del login no abría el teclado, y en iPhone tocar cualquier campo hacía zoom | Los campos del login se habilitan al tocarlos (antes de tomar el foco) y en pantallas táctiles todos los campos tienen letra de 16 px; sin zoom por doble toque | [#40](https://github.com/stefanoguerrina/tp-chefcito/pull/40) |
| Con un modal abierto se podía seguir scrolleando la página de atrás (celular y compu) | Con cualquier modal abierto (o el menú del celular) la página no scrollea; los modales que no entran en la pantalla scrollean por dentro | [#40](https://github.com/stefanoguerrina/tp-chefcito/pull/40) |
| En el registro desde el celular, el calendario podía abrirse fuera de la vista, empezaba en el año actual y dejaba elegir fechas futuras | El calendario se dibuja sobre toda la página, la lista de años abre en el año elegido y los días futuros no se pueden elegir | [#40](https://github.com/stefanoguerrina/tp-chefcito/pull/40) |
| "Mis recetas" y "Donaciones" se salían de la pantalla en celulares angostos, y el navegador achicaba la página | Grillas que se adaptan al ancho (sin desbordes de 320 a 390 px) | [#40](https://github.com/stefanoguerrina/tp-chefcito/pull/40) |
| Auditoría de seguridad: el frontend respondía `Access-Control-Allow-Origin: *` (CORS permisivo, OWASP A05), por defecto de Vercel | `frontend/vercel.json` limita esa cabecera al dominio del frontend; la API ya estaba restringida con `CORS_ORIGINS` | [#40](https://github.com/stefanoguerrina/tp-chefcito/pull/40) |

## Issues abiertos

| Issue | Detalle |
|---|---|
| Sin webhook de Mercado Pago | El pago se confirma consultando a Mercado Pago; con el deploy en https se podría sumar el webhook |
| Recorrido visual pendiente | Revisadas en celular (320, 360 y 390 px, modo claro) las pantallas de usuario, el panel admin, el login, el registro y el calendario. Falta 768 px y el modo oscuro en celular |
