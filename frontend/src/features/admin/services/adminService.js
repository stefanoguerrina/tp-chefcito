// Servicio del panel de administración: los endpoints propios del panel (/api/admin), que
// devuelven solo lo que muestra cada pantalla (cifras ya contadas en la base y la página de
// usuarios que se ve) en vez de listas completas.
import { apiFetch } from '../../../shared/utils/apiFetch.js';

// Cifras del dashboard. Devuelve: { activeUsersCount, inactiveUsersCount, recipesCount,
// ingredientsCount, ingredientCategoriesCount, recipeCategoriesCount, rolesCount,
// recipesLastWeek: [{ date, count }], topCreators: [{ username, recipesCount }] }.
export const getAdminSummary = async () => {
  return await apiFetch('/admin/summary');
};

// Una página de la tabla de usuarios.
// Recibe: { status ('all' | 'active' | 'inactive'), query (texto buscado), page }.
// Devuelve: { users, total, page, totalPages, pageSize }.
export const getAdminUsers = async ({ status, query, page }) => {
  const params = new URLSearchParams({ status, page: String(page) });
  if (query) params.set('q', query);
  return await apiFetch(`/admin/users?${params}`);
};
