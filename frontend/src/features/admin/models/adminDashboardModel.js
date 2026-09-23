// Transformaciones puras del dashboard de administración: toman las listas crudas que
// devuelve el backend (usuarios, recetas, roles, reviews) y arman las cifras, series y
// filas que dibujan las tarjetas y la tabla. Sin fetch ni estado, solo funciones (las
// llama useAdminDashboard).

// Etiquetas de día indexadas igual que Date.getDay() (0 = domingo).
const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Cantidad de días que muestra el gráfico semanal de recetas.
const WEEK_LENGTH = 7;

// Compara dos fechas ignorando la hora. Recibe: dos Date. Devuelve: true si son el mismo día.
const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

// Cuenta cuántas recetas publicó cada usuario.
// Recibe: array de recetas crudas. Devuelve: Map de idUser -> cantidad de recetas.
export const countRecipesByUser = (recipes) => {
  const countByUser = new Map();
  recipes.forEach((recipe) => {
    const current = countByUser.get(recipe.idUser) ?? 0;
    countByUser.set(recipe.idUser, current + 1);
  });
  return countByUser;
};

// Arma la serie de los últimos 7 días (de hace 6 días hasta hoy) con las recetas creadas
// cada día. Se construye el array de días primero y después se reparten las recetas para
// que los días sin actividad aparezcan igual con valor 0 y el gráfico no quede con huecos.
// Recibe: array de recetas crudas. Devuelve: [{ label, value, isHighlighted }].
export const buildRecipesLastWeek = (recipes) => {
  const today = new Date();
  const days = [];

  for (let daysAgo = WEEK_LENGTH - 1; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    days.push({ date, label: WEEKDAY_LABELS[date.getDay()], value: 0, isHighlighted: daysAgo === 0 });
  }

  recipes.forEach((recipe) => {
    if (!recipe.createdAt) return;
    const createdAt = new Date(recipe.createdAt);
    const day = days.find((item) => isSameDay(item.date, createdAt));
    if (day) day.value += 1;
  });

  return days.map(({ label, value, isHighlighted }) => ({ label, value, isHighlighted }));
};

// Suma total de una serie como la que devuelve buildRecipesLastWeek.
// Recibe: [{ value }]. Devuelve: el total del período.
export const sumSeries = (series) => series.reduce((total, item) => total + item.value, 0);

// Ranking de usuarios con más recetas publicadas, para la tarjeta de usuarios.
// Recibe: array de recetas crudas y el máximo de puestos a devolver.
// Devuelve: [{ label, value }] ordenado de mayor a menor (label = username, ver AdminRankingList).
export const buildTopCreators = (recipes, limit = 4) => {
  const countByUsername = new Map();

  recipes.forEach((recipe) => {
    // Si la receta no trae el usuario embebido se usa el id como etiqueta de respaldo.
    const username = recipe.user?.username ?? `usuario #${recipe.idUser}`;
    countByUsername.set(username, (countByUsername.get(username) ?? 0) + 1);
  });

  return [...countByUsername.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
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
// Recibe: array de roles crudos ([{ name }]) o undefined/null si falló la consulta.
// Devuelve: string listo para mostrar.
export const buildRoleLabel = (roles) => {
  if (!roles || roles.length === 0) return 'Sin rol asignado';
  return roles.map((role) => role.name).join(', ');
};

// Junta las reviews de todas las recetas y las agrupa por el creador de cada receta
// (no por quien la reseñó), para saber cuántas valoraciones recibió cada usuario y con
// qué promedio.
// Recibe: recipes (crudas) y reviewResultsByRecipeId (Map de idReceta -> { reviews }).
// Devuelve: Map de idUser -> { count, average } (average es null si count es 0).
export const buildReviewStatsByUser = (recipes, reviewResultsByRecipeId) => {
  const totalsByUser = new Map();

  recipes.forEach((recipe) => {
    const result = reviewResultsByRecipeId.get(recipe.id);
    if (!result) return;

    const current = totalsByUser.get(recipe.idUser) ?? { count: 0, sum: 0 };
    result.reviews.forEach((review) => {
      current.count += 1;
      current.sum += Number(review.rating);
    });
    totalsByUser.set(recipe.idUser, current);
  });

  const statsByUser = new Map();
  totalsByUser.forEach(({ count, sum }, idUser) => {
    statsByUser.set(idUser, {
      count,
      average: count > 0 ? Math.round((sum / count) * 10) / 10 : null,
    });
  });
  return statsByUser;
};

// Pluraliza "receta"/"recetas" según la cantidad. Recibe: un número. Devuelve: "1 receta", "3 recetas".
export const formatRecipesCount = (count) => `${count} ${count === 1 ? 'receta' : 'recetas'}`;

// Pluraliza "valoración"/"valoraciones" según la cantidad. El promedio se muestra aparte
// (con el ícono de estrella, no texto) porque el JSX lo arma el componente, no este modelo.
// Recibe: un número. Devuelve: "1 valoración", "3 valoraciones".
export const formatReviewsCount = (count) => `${count} ${count === 1 ? 'valoración' : 'valoraciones'}`;

// Arma las filas de la tabla de usuarios uniendo activos e inactivos con toda la data
// adicional ya calculada (recetas, rol, valoraciones). Guarda también el usuario crudo
// completo (raw) para poder precargar el modal de edición con todos sus campos.
// Recibe: usuarios activos, usuarios inactivos, y los Maps de recipeCountByUser,
// roleLabelByUser y reviewStatsByUser (idUser -> valor calculado).
// Devuelve: [{ id, username, fullName, initials, recipesCount, reviewStats, roleLabel,
//             createdAt, isActive, raw }].
export const buildUserRows = (activeUsers, inactiveUsers, recipeCountByUser, roleLabelByUser, reviewStatsByUser) => {
  const toRow = (user, isActive) => ({
    id: user.id,
    username: user.username,
    fullName: `${user.name} ${user.lastName}`.trim(),
    initials: getPersonInitials(user),
    recipesCount: recipeCountByUser.get(user.id) ?? 0,
    reviewStats: reviewStatsByUser.get(user.id) ?? { count: 0, average: null },
    roleLabel: roleLabelByUser.get(user.id) ?? 'Sin rol asignado',
    createdAt: user.createdAt ?? null,
    isActive,
    raw: user,
  });

  return [
    ...activeUsers.map((user) => toRow(user, true)),
    ...inactiveUsers.map((user) => toRow(user, false)),
  ];
};
