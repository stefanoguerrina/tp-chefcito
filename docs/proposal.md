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
|Listados | 1. Listado de recetas filtrado por tiempo de preparación. Muestra nombre y descripción de receta => Detalle CRUD Receta<br> 2.  Listado de las diez recetas mejor valoradas en un plazo solicitado. Muestra nombre, descripción, valoración de la receta y nombre del creador de la receta => Detalle muestra datos completos de la receta y del creador<br> 3. Listado de recetas filtrado por necesidades nutricionales. Muestra nombre y descripción de receta => Detalle CRUD Receta |
|CUU/Epic | 1. Consultar recetas disponibles según categoría<br>2. Consultar recetas mejor valoradas en un plazo determinado |
|Otros | 1. Brindar asistencia personalizada mediante un ChatBot implementado con IA |

