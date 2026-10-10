# Consigna de la cátedra

Copia textual de la consigna del trabajo práctico, tomada del
[repositorio de la cátedra](https://github.com/utnfrrodsw/tp) (`README.md`, `docs.md` y
`FAQ.md`), que venía en el fork y se juntó en este archivo. Es la referencia de todo lo que pide
la cátedra, para el equipo y para los agentes de IA. Si la cátedra la actualiza, volver a
copiarla desde el repositorio original.

Qué cumple hoy el proyecto y qué falta: [analisis-estado-proyecto.md](analisis-estado-proyecto.md).

| Parte | Origen | Contenido |
|---|---|---|
| [1. Enunciado](#parte-1-enunciado-readmemd) | `README.md` | Objetivo, requisitos técnicos y funcionales, entregas, fechas, gestión y evaluación |
| [2. Documentación](#parte-2-documentación-docsmd) | `docs.md` | Formato y contenido mínimo de la documentación por entrega |
| [3. FAQ](#parte-3-faq-faqmd) | `FAQ.md` | Otras tecnologías, repositorio, bases de datos, definición de CRUD, listado y caso de uso, grupos |

## Parte 1: Enunciado (README.md)

tags: #dsw #tp

Status: draft

### 1. Objetivo

Desarrollar en grupo una aplicación web full stack en base a un alcance propuesto por los integrantes.

Durante dicho desarrollo se deberá aplicar todo lo aprendido en la materia Desarrollo de Software.

### 2. Tema y Alcance
El grupo debe deberá proponer a los docentes un tema para el trabajo práctico de su preferencia utilizando la [plantilla de propuesta](proposal.md)

### 3. Requisitos
El desarrollo de la aplicación debe:
1. Desarrollarse en 2 partes: Frontend y Backend; agnósticas entre si, comunicadas mediante una API.
2. Cumplir con los requisitos:  [técnicos](#3.1%20Requisitos%20técnicos) y [funcionales](#3.2%20Requisitos%20funcionales).
3. Desarrollarse en grupo utilizando metodologías de gestión de proyecto y llevar evidencia de ello.
4. Cumplir con las [entregas](#3.3%20Entregas) estipuladas.
5. Utilizar github o gitlab para gestión del código fuente.
6. Realizar una defensa oral del trabajo práctico para regularidad.
7. Realizar otra defensa oral del trabajo práctico para la aprobación.
8. Enviar la 
9. Presentar la [documentación](#3.4%20Documentación) durante la defensa.

#### 3.1 Requisitos técnicos
La app cuenta con 2 partes: Backend y Frontend agnósticas entre si que se comunican mediante una API.

##### 3.1.1 Backend
El backend debe cumplir con las siguientes condiciones para regularidad y aprobación.

###### Regularidad
* Desarrollarse en JavaScript.
* Utilizar un framework web que permita integrarse a las demás.
* herramientas a través de middlewares, pluggins o modulos.
* Exponer una API web (rest, tRPC o gRPC) para interactuar con el frontend.
* Utilizar una base de datos persistente que acceda a través de un servicio externo (es decir que no sea una base de datos embebida).
* La persistencia a la base de datos debe realizarse mediante un mapper (ORM/ODM/OXM). En caso que la base de datos utilizada no tenga un mapper disponible para JavaScript se deberá implementar la persistencai utilizando un patron Repository.
* Realizarse mediante capas.
* Validar entrada de datos, manejar e informar apropiadamente los errores a través de la API.
* Las dependencias para ejecución, desarrollo y test deben estar correctamente registradas para ser instaladas automáticamente (e.j. package.json).

###### Aprobación Directa o en Examen
* Cumplir con todas las condiciones de regularidad.
* Implementar 1 test automatizado por integrante.
* Implementar 1 test de integración.
* Implementar un login con autenticación propia o de third-party y al menos 2 niveles de acceso diferentes.
* Proteger las diferentes rutas en base al nivel de acceso requerido.
* Definir ambientes, ya sea mediante environment del framework o .env

##### 3.1.2 Frontend
El frontend debe cumplir con las siguientes condiciones para regularidad y aprobación.

###### Regularidad
* Desarrollarse utilizando un framework de Frontend.
* Utilizar HTML5
* Utilizar CSS según las directrices de alguna biblioteca de componentes, guía de estilo o framework de CSS y la metodología propuesta por el framework de frontend elegido. Se sugiere el uso de biblioteca de componentes;  preprocesadores: sass, scss, less, stylus, etc o frameworks de css: Pico.css, Bulma, Material, Tailwind, Bootstrap, etc.
* Guía de estilos sugerida Airbnb Javascript https://github.com/airbnb/javascript
* Aplicar la estrategia mobile-first para la escritura del código css de la aplicación
* La app debe visualizarse correctamente en al menos 3 diferentes breakpoints: SM, MD, LG
* Seguir buenas prácticas de UX/UI (Que no requiera manual de usuario o explicaciones específicas para utilizar la interfaz)
* Las app debe mostrar las siguientes características entre sus componentes:
	* Manejo de eventos del usuario: click, input, etc
	* Ante una posibilidad de fallo, manejar el/los errores adecuadamente y de manera amigable al usuario
	* Reactividad ante un estado
	* Input property
	* Output property
* Implementar al menos un servicio.
* Para el manejo de la información, por ej una respuesta de un endpoint o los datos a enviar en una request, representar en el código los modelos de objetos con clases, interfaces y tipos de datos custom.
* De ser posible, implementar algún patrón de diseño orientado a objetos.
* Las dependencias para ejecución, desarrollo y test deben estar correctamente registradas para ser instaladas automáticamente (e.j. package.json).

###### Aprobación Directa o en Examen
* Cumplir con las condiciones de regularidad.
* Realizar al menos 1 test unitario de un componente.
* Realizar al menos 1 test de end-to-end.
* Implementar el login y proteger el acceso a las distintas partes del frontend en base a los niveles de usuarios del backend.
* Definir ambientes, ya sea mediante environment del framework o .env

#### 3.2 Requisitos funcionales
La app debe cumplir con los siguientes requisitos.

##### Regularidad
* 1 CRUD Simple por integrante
* 1 CRUD Dependiente cada 2 integrantes o fracción.
* 1 Listado con filtro (al menos un atributo) cada 2 integrantes o fracción.
* Para cada listado, al seleccionar un elemento, se debe mostrar un detalle.
* Debe implementar un caso de uso de usuario o epic, con valor para el negocio, cada 2 integrantes o fracción.

##### Aprobación Directa o en Examen
* CRUDs de todas las clases de negocio necesarias para el funcionamiento de la app.
* Implementar 1 caso de uso usuario o epic, con valor para el negocio, por cada integrante.
  Se deben implementar un mínimo de 2 relacionados entre si. Es decir que la data registrada por uno CU o epic sirva de input para otro.

##### Alcance Adicional Voluntario
De forma **opcional** y **voluntaria** los grupos podrán realizar CUU o epics, listados más complejos de los solicitados u otros requisitos como notificaciones, logs, etc; adicionales para completar la funcionalidad del sistema propuesto.

Esto será considerado en la nota final en función de la complejidad y esfuerzo relativos a lo ya realizado.


#### 3.3 Entregas
##### Propuesta del enunciado
En la entrega se debe entregar a los profesores la [plantilla de propuesta](./proposal.md) actualizada con las condiciones de Regularidad y de Aprobación. Los profesores analizarán la propuesta y de ser necesario sugerirán ajustes hasta que esté correcta y sea aceptada.

##### Regularidad
En la entrega se debe entregar:
* El README.md (o con un link) las instrucciones para instalar y ejecutar el proyecto sin conocimientos de cómo está desarrollado. El proyecto debe poder ejecutarse con scripts y las herramientas según las convenciones del lenguaje y/o framework utilizado (scripts en package.json, o tools específicas del framework).
* Entregar la [proposal](./proposal.md) actualizada con links al pull request de back y/o front mediante el form publicado para cada año.

Coordinar una defensa grupal con los profesores.

##### Aprobación Directa o en Examen
En la entrega se debe enviar:
* Video explicando el funcionamiento del sistema
* Documentación de la API de backend (según la tecnología y standard utilizados).
* Evidencia del resultado de la ejecución de los tests automáticos.
* Entregar la [proposal](./proposal.md) actualizada con links al pull request de back y/o front.
* Incluir en el README.md (o con un link) las instrucciones para instalar y ejecutar el proyecto sin conocimientos de cómo está desarrollado. El proyecto debe poder ejecutarse con scripts y las herramientas según las convenciones del lenguaje y/o framework utilizado (scripts en package.json, o tools específicas del framework).
* Links de Deploy
* Credenciales para utilizar la aplicación deployada
* Contacto para coordinar la defensa

El envío se debe realizar por el form https://kutt.to/DSWEntregaSistemaFinal o https://bit.ly/DSWEntregaSistemaFinal y coordinar con el docente una defensa grupal con los profesores.

Para la Aprobación Directa la defensa debe pactarse con los docentes dentro de los plazos indicados a continuación.
Para la Aprobación en Examen la defensa debe pactarse con los docentes y realizarse antes de la fecha de la mesa de examen.

##### Fechas de entrega
**Propuesta**: Durante Abril

**Muestra de avance**: Inicio del segundo cuatrimestre

**Primer Entrega de Regularidad/AD**: 12/10 al 16/10

**Primer Recuperatorio/Globalizador de Regularidad/AD**: 26/10 al 30/10

**Ultima instancia Recuperatorio/Globalizador de Regularidad/AD**: 9/11 al 13/11

#### 3.4 Documentación
La documentación debe presentarse para la instancia de defensa.

Para conocer el detalle de la documentación referirse a [docs](#parte-2-documentación-docsmd).

### 4. Gestión del proyecto
**TODO: En revisión**

El desarrollo de la app debe realizarse utilizando metodologías ágiles para la gestión del proyecto (Scrum, XP, etc).

El grupo deberá llevar un registro de lo realizado, el mismo debe incluir como mínimo:
* Tipo de metodología a utilizar para el seguimiento. ( Scrum, XP, etc.)
* Minutas de avances o reuniones de coordinación del equipo.
* Documentación de trackeo como desarrollo de features y bugfix, asignación de tareas, etc.

Es de libre elección del alumno la herramienta a utilizar para el trackeo. Se recomienda el uso de github/gitlab proyects para integrar con el desarrollo de la misma pero en caso de utilizar otra en la documentación deberán incluirse los links a la tool para ello.


### 5. Evaluación

Durante la evaluación de cada entrega se considerarán:
* Requisitos técnicos y funcionales de la etapa.
* Adhesión a las directrices de UX/UI y buenas prácticas de programación.
* Uso apropiado de la tecnología: librerías, frameworks, patrones, etc.
* Documentación requerida.
* Participación de los miembros del grupo.
* Uso de git para el desarrollo.
* Defensa oral del trabajo práctico.
* Gestión y seguimiento del desarrollo de la app.
* Innovación, investigación y desafíos asumidos.
* Documentación solicitada.

### 6. FAQ

En la sección de [FAQ](#parte-3-faq-faqmd) podrán encontrar respuestas a las consultas más frecuentes que se van realizando.

## Parte 2: Documentación (docs.md)

**TODO: En revisión.**

### Formato
* La documentación debe estar disponible en un directorio **docs** en el primer nivel de el/los repositorios.
* El punto de entrada de la misma será un archivo README.md en el directorio docs y deberá estar linkeada en el README.md del proyecto.
* Los documentos de texto generados por los alumnos deben ser subidos en formato markdown.
* Los documentos que sean generados directamente con una tool o app y no lo exporten en formato markdown podrán ser incluidos en formato pdf. No se admitirán archivos binarios o no formateados como .doc, .odf, .rtf, .txt, etc.
* Los diagramas, esquemas y demás contenido gráfico puede ser incluido utilizando [Mermaid](https://mermaid.js.org) o directamente en formato gráfico que sea compatible con la plataforma de git utilizada; linkeándolos en el documento correspondiente

### Contenido
A continuación se detalla la documentación mínima a incluir para cada entrega
|Contenido - Secciones|Regularidad|Aprobación|
|:-|:-:|:-:|
|proposal actualizada|X|X|
|links a los PR/MR|X|X|
|instrucciones de instalacion|X|X|
|minutas de reunión y avance|X|X|
|tracking de features, bug e issues|X|X|
|documentacion de la API||X|
|evidencia de ejecución de test automáticos||X|
|demo de app en video|TBD|X|
|deploy|TBD|TBD|

## Parte 3: FAQ (FAQ.md)

### Soporte de la cátedra a tecnologías y lenguaje de programación

#### Otras Tecnologías: runtimes, frameworks o librerías
La cátedra dará soporte a las tecnologías dadas durante el cursado (por ejemplo NodeJS, Express y Angular).

Es bienvenido que los alumnos opten por el uso de otras tecnologías equivalentes por motivos de aprendizaje, curiosidad o motivación propia, deberán informarlo claramente en la proposal y ser aprobado por el profesor.

En este caso la cátedra no puede asegurar que sea capaz de proveer soporte para estas tecnologías y por lo tanto es responsabilidad de el/los alumnos de cumplir con los requisitos del TP al utilizarlas.

#### Otros Lenguajes de programación
El uso de otro lenguaje de programación debe presentarse en la proposal con una justificación detallada de por qué JS no es adecuado para realizar el TP y el lenguaje propuesto debe cumplir con las siguientes condiciones:
* Permitir la ejecución de código asíncrono mediante event loop, corrutinas y promesas o técnicas equivalentes (no threads).
* Proveer frameworks web y permitir la construcción de una API.
* Mantener la separación de Frontend y Backend.
* Cubrir la deficiencia de JS indicada en la descripción.

Ejemplos podrían ser el uso de web assembly o Flutter + Dart.

### Repositorio
1. El desarrollo del trabajo práctico debe respaldarse mediante un repositorio git en github o gitlab al que los docentes deben tener acceso.
2. El repo debe ser creado a partir de un Fork del TP y deberán realizar un PR/MR para su entrega.
3. Se evaluará el uso apropiado de git, la continuidad en el desarrollo y los aportes que haya realizado cada integrante.

### Bases de datos
Se podrá utilizar cualquier base de datos relacional o no-relacional que cumpla con estos requisitos:
* Ser un servicio independiente al que se debe conectar (no una base de datos embebida).
* Debe tener persistencia de datos en disco.
* Debe accederse por medio de un ORM (o si no existe ninguno implementar el patrón repository).
* Debe permitir concurrencia de usuarios.
* No debe requerir ejecutarse en local.

### Alcance Funcional
   * **CRUD**: significa implementar las operaciones de Create, Read, Update y Delete de una Clase de negocio
	* **CRUD Simple** Es un CRUD de una Clase de negocio que no dependa ni requiera de otras. Por ejemplo en un carrito de compra las categorías de los productos.
	* **CRUD Dependiente** hace referencia a implementar un CRUD de una Clase de negocio que tenga una referencia a otra(s). Por ejemplo en un carrito de compra serían los productos que tienen una referencia a la categoría.
	* **CRUDs adicionales**: En caso que la app requiera más apps de las mínimas exigidas por el TP. Durante la etapa de regularidad pueden realizarse directamente en la base de datos y hacerse mediante la app para la entrega de aprobación.
	* **Mostrar detalle**:  El detalle de algún elemento del listado debe realizar una request al backend y (ya sea redirigiendo el elemento o en la misma página) debe permitir una de las opciones siguiente:
		* Mostrar más información que la disponible en el listado. Debe contener información de al menos 2 clases de negocio.
		* Redirigir al CRUD del elemento seleccionado.
	  Por ejemplo:	
		* En un listado de ventas donde se muestra fecha, nombre del cliente y monto total al seleccionar un elemento podría mostrar los datos de la venta y detallar los productos comprados, precio y cantidad, descuentos si hubiera, etc.
		* En un listado de productos podría redirigir al CRUD de productos.
	* **Caso de uso de usuario o epic con valor para el negocio**: Quiere decir implementar la/las operaciones necesarias para realizar un caso de uso que genera valor para el negocio. Por ejemplo tres casos de uso para un carrito de compras:
		* Vender. incluye agregar un producto al carrito y confirmar la compra al finale y brindar los datos de entrega y pago.
		* Valorar un producto comprado. Incluye para un cliente poder comentar y dar una puntuación a un sobre un producto comprado y mostrar dicha valoración y comentario en el detalle del producto.
		* Valorar un venta. Dar una puntuación y/o comentar sobre una venta completa y que se puedan mostrar los comentarios o puntuación en otro lugar.
	  El objetivo es realizar una o más acciones que utilicen la información brindada por casos de uso o CRUDs anteriores. Los casos de usos pueden estar relacionados entre si o no.
	  Ante la eventualidad que un caso de uso o epic presente demasiados escenarios se podrá pactar cuales implementar con los docentes
### Grupos
Los grupos deben ser de entre 2 y 4 integrantes.

**Trabajo individual**: Se desaconseja el realizar el trabajo de forma individual; pero si algún alumno tiene causas específicas, personales y fuera de su control que impidan realizar el trabajo en equipo de forma eficiente debe informarlo previamente al profesor y obtener su autorización para realizar el TP de manera individual.
