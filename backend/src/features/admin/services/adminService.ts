// Lógica de negocio de la feature admin: arma el resumen del dashboard y el listado
// paginado de usuarios a partir de lo que cuenta el repositorio.
import { adminRepository } from '../repository/adminRepository.js';
import { toPublic } from '../../user/models/userModel.js';
import {
  ADMIN_USERS_PAGE_SIZE,
  RECIPES_CHART_DAYS,
  TOP_CREATORS_LIMIT,
  type AdminUserFilters,
} from '../models/adminModel.js';

// Fecha local en formato "YYYY-MM-DD" (la usa el gráfico para ubicar cada receta en su día).
const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Arma la serie de recetas nuevas por día de los últimos RECIPES_CHART_DAYS días (de más
// viejo a hoy). Primero se crean todos los días en 0 y después se reparten las recetas,
// así los días sin actividad también aparecen.
// Devuelve: [{ date: 'YYYY-MM-DD', count }].
async function buildRecipesLastWeek() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (RECIPES_CHART_DAYS - 1));

  const countByDay = new Map<string, number>();
  for (let offset = 0; offset < RECIPES_CHART_DAYS; offset++) {
    const day = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + offset);
    countByDay.set(toDateKey(day), 0);
  }

  const recipes = await adminRepository.findRecipeDatesSince(firstDay);
  recipes.forEach(({ createdAt }) => {
    if (!createdAt) return;
    const key = toDateKey(createdAt);
    if (countByDay.has(key)) countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  });

  return [...countByDay.entries()].map(([date, count]) => ({ date, count }));
}

// Ranking de usuarios con más recetas publicadas: [{ username, recipesCount }].
async function buildTopCreators() {
  const groups = await adminRepository.findTopCreators(TOP_CREATORS_LIMIT);
  const users = await adminRepository.findUsernames(groups.map((group) => group.idUser));
  const usernameById = new Map(users.map((user) => [user.id, user.username]));
  return groups.map((group) => ({
    username: usernameById.get(group.idUser) ?? `usuario #${group.idUser}`,
    recipesCount: group._count._all,
  }));
}

// Resumen del dashboard: todas las cifras de las tarjetas en un solo pedido, calculadas en
// la base (en vez de mandar todos los usuarios, recetas, ingredientes... para contarlos en
// el navegador).
export async function getDashboardSummary() {
  const [
    activeUsersCount,
    inactiveUsersCount,
    recipesCount,
    ingredientsCount,
    ingredientCategoriesCount,
    recipeCategoriesCount,
    rolesCount,
    recipesLastWeek,
    topCreators,
  ] = await Promise.all([
    adminRepository.countActiveUsers(),
    adminRepository.countInactiveUsers(),
    adminRepository.countVisibleRecipes(),
    adminRepository.countIngredients(),
    adminRepository.countIngredientCategories(),
    adminRepository.countRecipeCategories(),
    adminRepository.countRoles(),
    buildRecipesLastWeek(),
    buildTopCreators(),
  ]);

  return {
    activeUsersCount,
    inactiveUsersCount,
    recipesCount,
    ingredientsCount,
    ingredientCategoriesCount,
    recipeCategoriesCount,
    rolesCount,
    recipesLastWeek,
    topCreators,
  };
}

// Una página del listado de usuarios del panel, con lo que muestra cada fila: datos
// públicos (sin contraseña), roles, cantidad de recetas y valoraciones recibidas.
// Si la página pedida ya no existe (ej. se dio de baja al último de la última página),
// devuelve la última que haya.
// Recibe: { status, term, page }. Devuelve: { users, total, page, totalPages, pageSize }.
export async function listUsers(filters: AdminUserFilters) {
  const total = await adminRepository.countUsers(filters);
  const totalPages = Math.max(Math.ceil(total / ADMIN_USERS_PAGE_SIZE), 1);
  const page = Math.min(filters.page, totalPages);

  const users = await adminRepository.findUsersPage(
    filters,
    (page - 1) * ADMIN_USERS_PAGE_SIZE,
    ADMIN_USERS_PAGE_SIZE
  );
  const reviewStats = await Promise.all(users.map((user) => adminRepository.findReviewStatsByAuthor(user.id)));

  const rows = users.map((user, index) => {
    const { _count, userRoles, ...userData } = user;
    const stats = reviewStats[index];
    return {
      ...toPublic(userData),
      recipesCount: _count.recipe,
      roles: userRoles.map((link) => link.role),
      reviewStats: {
        count: stats._count._all,
        average: stats._avg.rating !== null ? Math.round(Number(stats._avg.rating) * 10) / 10 : null,
      },
    };
  });

  return { users: rows, total, page, totalPages, pageSize: ADMIN_USERS_PAGE_SIZE };
}
