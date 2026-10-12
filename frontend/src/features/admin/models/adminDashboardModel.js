// Transformaciones puras del dashboard de administración: pasan lo que devuelve el backend
// (/api/admin/summary y /api/admin/users, ya contado en la base) a lo que dibujan las
// tarjetas y la tabla. Sin fetch ni estado, solo funciones (las llaman useAdminSummary y
// useAdminUsers).
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Etiquetas de día indexadas igual que Date.getDay() (0 = domingo).
const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Suma total de una serie como la de toDashboardMetrics. Recibe: [{ value }].
// Devuelve: el total del período.
const sumSeries = (series) => series.reduce((total, item) => total + item.value, 0);

// Arma las cifras que usan las tarjetas del dashboard a partir del resumen del backend.
// El gráfico semanal llega como [{ date: 'YYYY-MM-DD', count }] (de hace 6 días a hoy):
// acá se le pone a cada día su etiqueta y se resalta el último (hoy).
// Recibe: el resumen crudo. Devuelve: el mismo resumen con recipesLastWeek
// ([{ label, value, isHighlighted }]), recipesThisWeekCount y topCreators ([{ label, value }]).
export const toDashboardMetrics = (summary) => {
  const recipesLastWeek = summary.recipesLastWeek.map(({ date, count }, index, days) => ({
    // "T00:00" la toma como fecha local: sin eso, "2026-09-30" se leería en UTC y en
    // Argentina caería en el día anterior.
    label: WEEKDAY_LABELS[new Date(`${date}T00:00`).getDay()],
    value: count,
    isHighlighted: index === days.length - 1,
  }));

  return {
    ...summary,
    recipesLastWeek,
    recipesThisWeekCount: sumSeries(recipesLastWeek),
    topCreators: summary.topCreators.map(({ username, recipesCount }) => ({ label: username, value: recipesCount })),
  };
};

// Iniciales de una persona a partir de nombre y apellido (para avatares sin foto).
// Recibe: un objeto con name/lastName (o username como respaldo). Devuelve: 1-2 letras mayúsculas.
export const getPersonInitials = ({ name, lastName, username } = {}) => {
  const first = name?.trim()?.[0] ?? username?.[0] ?? '?';
  const second = lastName?.trim()?.[0] ?? '';
  return `${first}${second}`.toUpperCase();
};

// Arma la etiqueta de rol que se muestra en la tabla a partir de los roles asignados a
// un usuario (tabla intermedia userrole). Un usuario puede tener más de un rol.
// Recibe: array de roles ([{ name }]). Devuelve: string listo para mostrar.
const buildRoleLabel = (roles) => {
  if (!roles || roles.length === 0) return 'Sin rol asignado';
  return roles.map((role) => role.name).join(', ');
};

// Pluraliza "receta"/"recetas" según la cantidad. Recibe: un número. Devuelve: "1 receta", "3 recetas".
export const formatRecipesCount = (count) => `${count} ${count === 1 ? 'receta' : 'recetas'}`;

// Pluraliza "valoración"/"valoraciones" según la cantidad. El promedio se muestra aparte
// (con el ícono de estrella, no texto) porque el JSX lo arma el componente, no este modelo.
// Recibe: un número. Devuelve: "1 valoración", "3 valoraciones".
export const formatReviewsCount = (count) => `${count} ${count === 1 ? 'valoración' : 'valoraciones'}`;

// Arma una fila de la tabla a partir de un usuario de /api/admin/users (que ya trae sus
// roles, cuántas recetas tiene y las valoraciones que recibió). Guarda también el usuario
// crudo (raw) para precargar el modal de edición con todos sus campos.
// Recibe: el usuario crudo. Devuelve: { id, username, fullName, avatarUser, recipesCount,
// reviewStats, roleLabel, createdAt, isActive, raw }.
export const toUserRow = (user) => ({
  id: user.id,
  username: user.username,
  fullName: `${user.name} ${user.lastName}`.trim(),
  // Lo que necesita UserAvatar: la foto ya con la URL completa del backend (en la BD se
  // guarda solo "/uploads/users/...") y los nombres para las iniciales si no tiene foto.
  avatarUser: {
    name: user.name,
    lastName: user.lastName,
    username: user.username,
    avatarUrl: resolveImageUrl(user.avatarUrl),
  },
  recipesCount: user.recipesCount ?? 0,
  reviewStats: user.reviewStats ?? { count: 0, average: null },
  roleLabel: buildRoleLabel(user.roles),
  createdAt: user.createdAt ?? null,
  isActive: !user.deletedAt,
  raw: user,
});
