# Metodología de trabajo

## Metodología

Trabajamos con una metodología ágil basada en **Kanban por fases**. El alcance de la
[propuesta](proposal.md) se dividió en 5 fases (infraestructura, entidades base, núcleo del
negocio, lógica avanzada, IA y cierre). Cada fase tiene 4 tareas, una por integrante,
independientes entre sí para poder trabajar en paralelo y de forma asíncrona. Una fase se da por
cerrada cuando sus tareas están integradas en `develop`.

El estado de cada tarea, los bugs y los pendientes están en [tracking.md](tracking.md). Las
reuniones y el avance por fase están en [minutas.md](minutas.md).

| Integrante | Rol |
|---|---|
| Guerrina, Stéfano | Líder de equipo: planifica las fases, revisa e integra los pull requests |
| Alí, Elías | Desarrollador |
| Persig, Juan Andrés | Desarrollador |
| Schujman, Gastón Enrique | Desarrollador |

## Flujo de git

| Rama | Uso |
|---|---|
| `main` | Versión estable. Recibe `develop` al cerrar cada entrega. |
| `develop` | Rama de integración: acá se mergean todas las tareas. |
| `task/<nombre>` o `feature/<nombre>` | Una rama por tarea, creada desde `develop`. Ejemplo: `task/4.1-CRUD-Inventory`. |
| `fix/<nombre>` | Correcciones puntuales, también desde `develop`. |

1. Cada integrante crea su rama desde `develop` y hace commits chicos sobre su tarea.
2. Al terminar, abre un pull request hacia `develop` con una descripción breve de lo que hizo.
3. El líder de equipo lo revisa, resuelve con el autor los conflictos si los hay y lo mergea.
4. Al cerrar una entrega se hace un pull request de `develop` a `main`. Nadie mergea directo a
   `main`.

Los pull requests de cada integrante están listados en la [propuesta](proposal.md#pull-requests).

## Convenciones

- Código, nombres de componentes, funciones y variables en inglés.
- Comentarios, mensajes de commit, mensajes de error y documentación en español.
- Commits con un mensaje que explique qué se hizo.
- Las dependencias nuevas se acuerdan en grupo antes de agregarlas.
- Antes de abrir un pull request: el backend compila (`npm run build`) y el frontend pasa el lint
  (`npm run lint`) y compila (`npm run build`).
