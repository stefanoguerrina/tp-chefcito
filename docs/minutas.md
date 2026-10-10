# Minutas de reunión y avance

## Avance por fase

Resumen armado a partir de las fechas de los commits y pull requests del repositorio. El
detalle de cada tarea está en [tracking.md](tracking.md).

| Período | Avance |
|---|---|
| Abril 2026 | Propuesta presentada a los profesores (21/04). |
| 06/07 al 10/07 | Fase 1: monorepo, división de tareas, DER, conexión a la base y arquitectura base de backend y frontend (#1, #2). |
| 21/07 al 04/08 | Fase 1: login y registro en frontend y backend con JWT (#3, #4). |
| 19/08 al 25/08 | Fase 2: a partir de la devolución de los profesores se adoptó Prisma como ORM. CRUD Usuario y CRUD de ingredientes con valores nutricionales (#5, #6, #7). |
| 02/09 al 05/09 | Fases 2 y 3: CRUD Categoría-Receta, landing e inicio, CRUD Receta con pasos e imágenes y CRUD Rol (#8, #9). |
| 22/09 al 26/09 | Fases 3 y 4: reseñas, inventario, recetas guardadas, perfil, primer panel de administración e imágenes guardadas en el servidor (#10 a #17). |
| 29/09 al 30/09 | Fases 4 y 5: editor de recetas, buscador y listados con filtros, Chefcito Bot, seguir usuarios, correcciones pedidas por el profesor, nuevo panel de administración, landing, valores nutricionales por porción y donaciones con Mercado Pago (#18 a #27). |
| 09/10 al 10/10 | Fase 5: corrección de errores y optimización de backend y frontend (#28, #29, #31). Documentación para la entrega. |

## Devoluciones de los profesores

| Fecha | Devolución | Cómo se resolvió |
|---|---|---|
| Antes del 19/08 | Usar un ORM para la persistencia | Se reemplazaron las consultas directas por Prisma (#5) |
| Antes del 29/09 | Evitar una consulta por cada elemento de un listado, corregir los acentos de los datos de prueba, marcar los campos obligatorios con su error y permitir editar una reseña | Correcciones del #23 |
| Antes del 29/09 | Sacar los botones "Actualizar" del panel de administración | Cada acción actualiza la pantalla sin volver a pedir todo (#23, #24) |

## Reuniones

Cada reunión se registra con esta plantilla, de la más reciente a la más antigua.

```
### DD/MM/AAAA - Tema

Presentes: ...

Qué se hizo desde la reunión anterior:
- ...

Qué se decidió:
- ...

Tareas:
| Tarea | Responsable | Fecha |
|---|---|---|
```
