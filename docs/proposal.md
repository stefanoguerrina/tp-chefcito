# Propuesta TP DSW

## Grupo
### Integrantes
* 54394 - Alí, Elías (3K02)
* 54653 - Guerrina, Stéfano (3K02)
* 54780 - Persig, Juan Andrés (3K02)
* 54323 - Schujman, Gastón Enrique (3K02)

### Repositorios
* [fullstack app (monorepo: `frontend/` + `backend/`)](https://github.com/stefanoguerrina/tp-chefcito)

## Tema
### Descripción
Aplicación web orientada a facilitar la planificación y elección de comidas a partir de los ingredientes disponibles y las necesidades nutricionales del usuario. Combina la asistencia personalizada de un ChatBot IA con un formato estilo red social para crear, guardar y reseñar recetas.


### Modelo
<img width="1706" height="812" alt="Chefcito-DER" src="https://github.com/user-attachments/assets/9045a749-be70-447d-a3d2-36d4eaae5932" />

<br>https://drive.google.com/file/d/1P_Q0JbjfzBXEMVRQG9LSGlv6ouKcrPgv/view?usp=sharing

### Tecnologías
|Parte|Tecnología|
|:-|:-|
|Backend|Node.js + Express 5, en TypeScript|
|Persistencia|MySQL, con Prisma como ORM|
|Autenticación|JWT propio (jsonwebtoken) y contraseñas hasheadas con bcrypt|
|Validación|express-validator|
|Archivos|multer (fotos de recetas, ingredientes y perfiles)|
|Frontend|React 19 + Vite, React Router, Context API + useReducer|
|Estilos|SASS, mobile-first|
|Servicios externos|Mercado Pago Checkout Pro (donaciones, en modo prueba) y Google Gemini (ChatBot), llamados desde el backend con fetch, sin SDK|

Respecto a las tecnologías dadas en la cátedra (NodeJS, Express y Angular), el frontend se desarrolló con React + Vite en lugar de Angular. El resto del cuadro se suma a esa base.

## Alcance Funcional 

### Alcance Mínimo

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Categoria-Ingrediente<br>3. CRUD Receta<br>4. CRUD Categoria-Receta|
|CRUD dependiente|1. CRUD Valoración {depende de} CRUD Usuario y CRUD Receta<br>2. CRUD Ingrediente {depende de} CRUD Categoria-Ingrediente|
|Listado<br>+<br>detalle| 1. Listado de recetas filtrado por categoría. Muestra nombre y descripción de receta => Detalle CRUD Receta<br> 2.  Listado de recetas filtrado por valoración. Muestra nombre, descripción, valoración de la receta y nombre del creador de la receta => Detalle muestra datos completos de la receta y del creador|
|CUU/Epic|1. Crear y publicar recetas<br>2. Reseñar recetas de otros usuarios|


Adicionales para Aprobación:
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Usuario<br>2. CRUD Categoria-Ingrediente<br>3. CRUD Receta<br>4. CRUD Categoria-Receta<br>5. CRUD Valoración<br>6. CRUD Ingrediente|
|CUU/Epic|1. Crear y publicar recetas<br>2. Reseñar recetas de otros usuarios<br>3. Consultar recetas en base a ingredientes disponibles<br>4. Sistema de donaciones a creadores |


### Alcance Adicional Voluntario

|Req|Detalle|
|:-|:-|
|CRUD | 1. CRUD Rol y asignación de roles a usuarios<br>2. CRUD Inventario {depende de} CRUD Usuario y CRUD Ingrediente<br>3. CRUD Valor nutricional {depende de} CRUD Ingrediente<br>4. Pasos, ingredientes e imágenes de una receta {dependen de} CRUD Receta<br>5. CRUD Receta guardada {depende de} CRUD Usuario y CRUD Receta<br>6. Seguir usuarios {depende de} CRUD Usuario<br>7. Donación {depende de} CRUD Usuario. Se crea y se consulta; no se edita ni se borra porque su estado lo actualiza Mercado Pago y un pago registrado no se elimina, para no alterar el historial |
|Listados | 1. Listado de recetas filtrado por tiempo de preparación. Muestra nombre y descripción de receta => Detalle CRUD Receta<br> 2.  Listado semanal de las diez recetas mejor valoradas. Muestra nombre, descripción, valoración de la receta y nombre del creador de la receta => Detalle muestra datos completos de la receta y del creador<br> 3. Listado de recetas filtrado por necesidades nutricionales. Muestra nombre y descripción de receta => Detalle CRUD Receta<br> 4. Listados de recetas, categorías y usuarios filtrables por nombre, ingredientes, autor, inventario y recetas guardadas. Muestra nombre, descripción y valoración => Detalle CRUD Receta o perfil del usuario<br> 5. Historial de donaciones recibidas y realizadas. Muestra usuario, monto, fecha y estado, con totales y los 5 principales donantes |
|CUU/Epic | 1. Consultar recetas disponibles según categoría<br>2. Consultar las recetas mejor valoradas de la semana<br>3. Seguir a otros usuarios y ver en el inicio sus recetas y reseñas |
|Otros | 1. Brindar asistencia personalizada mediante un ChatBot implementado con IA<br>2. Cálculo de valores nutricionales por porción de cada receta<br>3. Panel de administración con resumen de la aplicación y gestión de usuarios, roles, ingredientes y categorías<br>4. Pagos reales con Mercado Pago (modo prueba) para las donaciones<br>5. Fotos de perfil, portada, recetas e ingredientes subidas al servidor<br>6. Perfil con métricas del usuario y cambio de contraseña<br>7. Modo claro y oscuro |

## Pull Requests
Al ser un monorepo, cada PR puede incluir cambios de backend y de frontend. Todos se integraron a `develop`.

|PR|Integrante|Detalle|
|:-|:-|:-|
|[#1](https://github.com/stefanoguerrina/tp-chefcito/pull/1)|Schujman, Gastón|Arquitectura inicial y rutas base de backend y frontend (T-1.4)|
|[#2](https://github.com/stefanoguerrina/tp-chefcito/pull/2)|Alí, Elías|Creación y conexión de la base de datos (T-1.2)|
|[#3](https://github.com/stefanoguerrina/tp-chefcito/pull/3)|Persig, Juan|Login y registro en el frontend (T-1.3)|
|[#4](https://github.com/stefanoguerrina/tp-chefcito/pull/4)|Guerrina, Stéfano|Login y registro en el backend con JWT y estructura por features (T-1.3)|
|[#5](https://github.com/stefanoguerrina/tp-chefcito/pull/5)|Guerrina, Stéfano|Prisma como ORM y backend del CRUD Usuario (T-2.1)|
|[#6](https://github.com/stefanoguerrina/tp-chefcito/pull/6)|Guerrina, Stéfano|CRUD Usuario: baja lógica, reactivación y alta por administrador (T-2.1)|
|[#7](https://github.com/stefanoguerrina/tp-chefcito/pull/7)|Alí, Elías|CRUD Categoría-Ingrediente, Ingrediente y Valor nutricional (T-2.2)|
|[#8](https://github.com/stefanoguerrina/tp-chefcito/pull/8)|Alí, Elías|CRUD Receta, pasos e imágenes (T-3.1, T-3.2, T-3.3)|
|[#9](https://github.com/stefanoguerrina/tp-chefcito/pull/9)|Schujman, Gastón|CRUD Rol|
|[#10](https://github.com/stefanoguerrina/tp-chefcito/pull/10)|Guerrina, Stéfano|CRUD Valoración (T-3.4)|
|[#11](https://github.com/stefanoguerrina/tp-chefcito/pull/11)|Guerrina, Stéfano|CRUD Inventario (T-4.1)|
|[#12](https://github.com/stefanoguerrina/tp-chefcito/pull/12)|Schujman, Gastón|Recetas guardadas, backend (T-4.4)|
|[#13](https://github.com/stefanoguerrina/tp-chefcito/pull/13)|Schujman, Gastón|Recetas guardadas, frontend (T-4.4)|
|[#14](https://github.com/stefanoguerrina/tp-chefcito/pull/14)|Persig, Juan|Rediseño del perfil y del inicio|
|[#15](https://github.com/stefanoguerrina/tp-chefcito/pull/15)|Guerrina, Stéfano|Panel de administración con CRUD de categorías, ingredientes y usuarios|
|[#16](https://github.com/stefanoguerrina/tp-chefcito/pull/16)|Guerrina, Stéfano|Mejoras de frontend y corrección de errores|
|[#17](https://github.com/stefanoguerrina/tp-chefcito/pull/17)|Guerrina, Stéfano|Manejo de errores, rutas del frontend e imágenes guardadas en el servidor|
|[#18](https://github.com/stefanoguerrina/tp-chefcito/pull/18)|Guerrina, Stéfano|Editor de recetas por secciones, portada del perfil y modo claro/oscuro|
|[#19](https://github.com/stefanoguerrina/tp-chefcito/pull/19)|Guerrina, Stéfano|Buscador y listados con filtros, recetas según inventario y recetas guardadas con filtros|
|[#21](https://github.com/stefanoguerrina/tp-chefcito/pull/21)|Schujman, Gastón|ChatBot con IA (T-5.1, T-5.2)|
|[#22](https://github.com/stefanoguerrina/tp-chefcito/pull/22)|Guerrina, Stéfano|Seguir usuarios e inicio con recetas y reseñas de amigos y Top 10 de la semana|
|[#23](https://github.com/stefanoguerrina/tp-chefcito/pull/23)|Guerrina, Stéfano|Correcciones pedidas por el profesor|
|[#24](https://github.com/stefanoguerrina/tp-chefcito/pull/24)|Guerrina, Stéfano|Rediseño del panel de administración|
|[#25](https://github.com/stefanoguerrina/tp-chefcito/pull/25)|Persig, Juan|Rediseño de la landing|
|[#26](https://github.com/stefanoguerrina/tp-chefcito/pull/26)|Guerrina, Stéfano|Valores nutricionales por porción y listado por necesidades nutricionales|
|[#27](https://github.com/stefanoguerrina/tp-chefcito/pull/27)|Schujman, Gastón|Donaciones con Mercado Pago (T-4.3)|
|[#28](https://github.com/stefanoguerrina/tp-chefcito/pull/28)|Persig, Juan|Corrección de errores, pantalla de carga e historial de donaciones|
|[#29](https://github.com/stefanoguerrina/tp-chefcito/pull/29)|Guerrina, Stéfano|Estados de carga en todas las páginas, optimización de backend y frontend, código sin uso eliminado|
|[#31](https://github.com/stefanoguerrina/tp-chefcito/pull/31)|Guerrina, Stéfano|Prefijo `handle` en los nombres de los handlers|
