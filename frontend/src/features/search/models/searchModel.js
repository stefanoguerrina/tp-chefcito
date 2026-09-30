// Modelo de la búsqueda (barra con panel rápido y página /buscar): constantes del
// buscador y mapeo de la respuesta cruda de GET /api/search a la forma que usan los
// componentes.
import { recipeToCardProps } from '../../recipe/models/recipeModel.js';
import { getPersonInitials } from '../../admin/models/adminDashboardModel.js';
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Mínimo de caracteres para buscar (el backend exige el mismo): con 1 sola letra casi
// todo coincide y los resultados no le sirven a nadie.
export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_MAX_LENGTH = 100;

// Cuánto se espera después de la última tecla antes de pedir resultados (debounce).
// 300 ms alcanza para no mandar un pedido por cada letra mientras se escribe de corrido,
// y es poco como para que el usuario sienta que el buscador "tarda".
export const SEARCH_DEBOUNCE_MS = 300;

// Página de resultados (Enter o la lupa). Los listados completos de cada tipo ("Ver
// todas", "+N más" y el click en una categoría) cuelgan de ella: /buscar/recetas, etc.
export const SEARCH_PAGE_PATH = '/buscar';

// Tipos de listado completo: son el último tramo de la URL (/buscar/recetas).
export const SEARCH_TYPES = {
  categories: 'categorias',
  recipes: 'recetas',
  users: 'usuarios',
};

// Colores con los que se alternan los íconos de las categorías (solo decorativo).
export const CATEGORY_ACCENTS = ['primary', 'secondary', 'tertiary'];

// Arma la URL de la página de resultados o, si se indica type, la de un listado completo.
// Recibe: { term, type, categoryId } (todos opcionales).
// Devuelve: ej. "/buscar?q=pasta", "/buscar/recetas?q=pasta" o "/buscar/recetas?categoria=2".
export const buildSearchPagePath = ({ term, type, categoryId } = {}) => {
  const params = new URLSearchParams();
  if (term) params.set('q', term);
  if (categoryId) params.set('categoria', String(categoryId));
  const path = type ? `${SEARCH_PAGE_PATH}/${type}` : SEARCH_PAGE_PATH;
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
};

// Convierte una categoría cruda del buscador en { id, name, description, recipeCount }
// (la descripción solo viene en el listado completo).
export const toCategoryResult = (category) => ({
  id: category.id,
  name: category.name,
  description: category.description ?? null,
  recipeCount: category.recipeCount ?? 0,
});

// Convierte una receta cruda en las props de RecipeCard (la misma forma que usa toda la
// app, con su valoración), más authorId para no ofrecer "Guardar" en las recetas propias.
export const toRecipeResult = (recipe) => ({
  ...recipeToCardProps(recipe),
  authorId: recipe.idUser,
});

// Convierte un usuario crudo en lo que muestra su fila (foto o iniciales, nombre y
// @usuario). recipeCount (recetas publicadas) solo viene en el listado completo.
export const toUserResult = (user) => ({
  id: user.id,
  username: user.username,
  fullName: `${user.name ?? ''} ${user.lastName ?? ''}`.trim() || user.username,
  avatarUrl: resolveImageUrl(user.avatarUrl),
  initials: getPersonInitials(user),
  recipeCount: user.recipeCount ?? null,
});

// Convierte una sección cruda ({ items, total }) aplicando el mapeo de sus items.
const toSection = (rawSection, mapItem) => ({
  items: (rawSection?.items ?? []).map(mapItem),
  total: rawSection?.total ?? 0,
});

// Convierte la respuesta cruda de GET /api/search.
// Devuelve: { categories, recipes, users }, cada una con { items, total }.
export const createQuickSearchResults = (raw) => ({
  categories: toSection(raw?.categories, toCategoryResult),
  recipes: toSection(raw?.recipes, toRecipeResult),
  users: toSection(raw?.users, toUserResult),
});

// true si la búsqueda no encontró nada en ninguna de las tres secciones.
export const isQuickSearchEmpty = (results) =>
  results.categories.total === 0 && results.recipes.total === 0 && results.users.total === 0;

// Decide qué items de una sección entran en la página de resultados. Cada sección tiene
// `slots` lugares en su grilla: si hay más coincidencias que lugares, el último lugar lo
// ocupa la card "+N más" en vez de un resultado.
// Recibe: section ({ items, total }) y slots. Devuelve: { visibleItems, hiddenCount }.
export const splitSectionForPreview = (section, slots) => {
  if (section.total <= slots) return { visibleItems: section.items.slice(0, slots), hiddenCount: 0 };
  const visibleItems = section.items.slice(0, slots - 1);
  return { visibleItems, hiddenCount: section.total - visibleItems.length };
};

// Total de coincidencias sumando las tres secciones ("Encontramos 24 resultados").
export const countQuickSearchResults = (results) =>
  results.categories.total + results.recipes.total + results.users.total;
