// Tipos y constantes de la feature admin (resumen del panel y listado paginado de usuarios).
// Esta capa no tiene lógica: solo describe la forma de los datos.

// Usuarios por página en la tabla del dashboard: se pide solo la página que se ve, en vez
// de traer a todos los usuarios juntos.
export const ADMIN_USERS_PAGE_SIZE = 6;

// Largo máximo del texto de búsqueda de usuarios.
export const ADMIN_USERS_QUERY_MAX_LENGTH = 100;

// Filtro de estado de la tabla: todos, solo activos o solo dados de baja.
export const ADMIN_USER_STATUSES = ['all', 'active', 'inactive'] as const;
export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number];

// Días que muestra el gráfico de recetas nuevas del dashboard (hoy y los 6 anteriores).
export const RECIPES_CHART_DAYS = 7;

// Puestos del ranking de creadores con más recetas.
export const TOP_CREATORS_LIMIT = 4;

// Filtros del listado de usuarios, ya validados.
export interface AdminUserFilters {
  status: AdminUserStatus;
  term: string;
  page: number;
}
