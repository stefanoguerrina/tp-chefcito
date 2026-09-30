// Modelo de los listados completos de búsqueda (/buscar/recetas, /buscar/categorias y
// /buscar/usuarios): opciones de filtros y orden, lectura/escritura de los filtros en la
// URL, armado de la consulta al backend y mapeo de sus respuestas.
// Los filtros viven en la URL (no en un estado de React) para que un listado filtrado se
// pueda recargar, compartir y recuperar con "Atrás". Los nombres de los parámetros de la
// URL van en español (?tiempo=30) y los de la API en inglés (?maxTime=30).
import { SEARCH_MIN_LENGTH, toCategoryResult, toRecipeResult, toUserResult } from './searchModel.js';

// --- Opciones de filtros y orden ---
// value = cómo se escribe en la URL; apiValue / api = cómo se le pide al backend.
// La primera opción de cada lista es la de por defecto.

export const RECIPE_SORT_OPTIONS = [
  { value: 'relevantes', apiValue: 'relevance', label: 'Más relevantes' },
  { value: 'populares', apiValue: 'popular', label: 'Más populares' },
  { value: 'mejor-puntuadas', apiValue: 'rating', label: 'Mejor puntuadas' },
  { value: 'menor-tiempo', apiValue: 'time', label: 'Menor tiempo' },
  { value: 'recientes', apiValue: 'recent', label: 'Más recientes' },
];

// En "Recetas guardadas" se suma (y queda por defecto) el orden en que se guardaron.
export const SAVED_RECIPE_SORT_OPTIONS = [
  { value: 'guardadas-recientes', apiValue: 'saved', label: 'Guardadas recientemente' },
  ...RECIPE_SORT_OPTIONS,
];

// En la galería del perfil no hay un texto buscado que haga "relevante" a una receta:
// arranca por las más recientes.
export const PROFILE_RECIPE_SORT_OPTIONS = [
  { value: 'recientes', apiValue: 'recent', label: 'Más recientes' },
  { value: 'mejor-puntuadas', apiValue: 'rating', label: 'Mejor puntuadas' },
  { value: 'populares', apiValue: 'popular', label: 'Más populares' },
  { value: 'menor-tiempo', apiValue: 'time', label: 'Menor tiempo' },
];

// Recibe: los filtros (o al menos { savedOnly, authorId }). Devuelve la lista de órdenes
// posibles: la del perfil si se listan las recetas de un autor, la de "Recetas guardadas"
// con savedOnly, o la general.
export const getRecipeSortOptions = ({ savedOnly, authorId }) => {
  if (authorId) return PROFILE_RECIPE_SORT_OPTIONS;
  return savedOnly ? SAVED_RECIPE_SORT_OPTIONS : RECIPE_SORT_OPTIONS;
};

export const NAME_OR_RECIPES_SORT_OPTIONS = [
  { value: 'nombre', apiValue: 'name', label: 'Nombre (A-Z)' },
  { value: 'recetas', apiValue: 'recipes', label: 'Más recetas' },
];

export const TIME_FILTER_OPTIONS = [
  { value: '', label: 'Cualquier tiempo', api: {} },
  { value: '15', label: 'Hasta 15 min', api: { maxTime: 15 } },
  { value: '30', label: 'Hasta 30 min', api: { maxTime: 30 } },
  { value: '60', label: 'Hasta 60 min', api: { maxTime: 60 } },
  { value: 'mas-60', label: 'Más de 60 min', api: { minTime: 61 } },
];

export const RATING_FILTER_OPTIONS = [
  { value: '', label: 'Cualquier valoración' },
  { value: '4.5', label: '4,5 estrellas o más' },
  { value: '4', label: '4 estrellas o más' },
  { value: '3', label: '3 estrellas o más' },
];

// Necesidades nutricionales (se pueden elegir varias: la receta tiene que cumplir todas).
// value = cómo se escribe en la URL y apiValue = la clave del backend (NUTRITION_GOALS en
// searchModel.ts, que define los mismos límites por porción que dice cada hint).
export const NUTRITION_FILTER_OPTIONS = [
  { value: 'proteica', apiValue: 'high-protein', label: 'Alta en proteínas', hint: '20 gr o más' },
  { value: 'baja-calorias', apiValue: 'low-calorie', label: 'Baja en calorías', hint: '400 kcal o menos' },
  { value: 'baja-carbohidratos', apiValue: 'low-carb', label: 'Baja en carbohidratos', hint: '20 gr o menos' },
  { value: 'baja-grasas', apiValue: 'low-fat', label: 'Baja en grasas', hint: '10 gr o menos' },
  { value: 'alta-fibra', apiValue: 'high-fiber', label: 'Alta en fibra', hint: '5 gr o más' },
  { value: 'baja-sodio', apiValue: 'low-sodium', label: 'Baja en sodio', hint: '140 mg o menos' },
];

// --- Lectura de la URL ---

// El texto buscado, o '' si no hay (o es demasiado corto para el backend).
const readTerm = (params) => {
  const term = (params.get('q') ?? '').trim();
  return term.length >= SEARCH_MIN_LENGTH ? term : '';
};

const readPage = (params) => Math.max(1, Number.parseInt(params.get('pagina'), 10) || 1);

// Devuelve el valor del parámetro si es una de las opciones válidas; si no (no vino, o
// alguien editó la URL a mano), el de la primera opción.
const readOption = (params, key, options) => {
  const value = params.get(key) ?? '';
  return options.some((option) => option.value === value) ? value : options[0].value;
};

// Recibe: los URLSearchParams de la página y, opcional, { savedOnly, authorId } (true en
// "Recetas guardadas" / el id del dueño en la galería del perfil: no salen de la URL sino
// de la ruta). Devuelve los filtros del listado de recetas.
export const parseRecipeFilters = (params, { savedOnly = false, authorId = null } = {}) => ({
  savedOnly,
  authorId,
  term: readTerm(params),
  categoryId: Number(params.get('categoria')) || null,
  time: readOption(params, 'tiempo', TIME_FILTER_OPTIONS),
  rating: readOption(params, 'valoracion', RATING_FILTER_OPTIONS),
  ingredientIds: (params.get('ingredientes') ?? '').split(',').map(Number).filter((id) => id > 0),
  // Solo las que existen (la URL se puede editar a mano).
  nutritionGoals: (params.get('nutricion') ?? '')
    .split(',')
    .filter((value) => NUTRITION_FILTER_OPTIONS.some((option) => option.value === value)),
  pantry: params.get('despensa') === '1',
  sort: readOption(params, 'orden', getRecipeSortOptions({ savedOnly, authorId })),
  page: readPage(params),
});

// Recibe: los URLSearchParams. Devuelve los filtros de los listados de categorías/usuarios.
export const parseNameOrRecipesFilters = (params) => ({
  term: readTerm(params),
  onlyWithRecipes: params.get('con-recetas') === '1',
  sort: readOption(params, 'orden', NAME_OR_RECIPES_SORT_OPTIONS),
  page: readPage(params),
});

// --- Escritura de la URL y consulta al backend ---

// Arma URLSearchParams salteando los valores vacíos, así la URL queda corta y limpia.
const compactParams = (entries) => {
  const params = new URLSearchParams();
  Object.entries(entries).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined && value !== false) params.set(key, String(value));
  });
  return params;
};

// Los valores por defecto no se escriben en la URL.
const pageForUrl = (page) => (page > 1 ? page : '');
const optionForUrl = (value, options) => (value === options[0].value ? '' : value);
const apiValueOf = (value, options) => options.find((option) => option.value === value)?.apiValue;

// Filtros de recetas → parámetros de la URL.
export const recipeFiltersToParams = (filters) =>
  compactParams({
    q: filters.term,
    categoria: filters.categoryId,
    tiempo: filters.time,
    valoracion: filters.rating,
    ingredientes: filters.ingredientIds.join(','),
    nutricion: filters.nutritionGoals.join(','),
    despensa: filters.pantry ? '1' : '',
    orden: optionForUrl(filters.sort, getRecipeSortOptions(filters)),
    pagina: pageForUrl(filters.page),
  });

// Filtros de recetas → query string para GET /api/search/recipes.
export const recipeFiltersToApiQuery = (filters) => {
  const time = TIME_FILTER_OPTIONS.find((option) => option.value === filters.time)?.api ?? {};
  return compactParams({
    q: filters.term,
    categoryId: filters.categoryId,
    authorId: filters.authorId,
    maxTime: time.maxTime,
    minTime: time.minTime,
    minRating: filters.rating,
    ingredientIds: filters.ingredientIds.join(','),
    nutrition: filters.nutritionGoals.map((value) => apiValueOf(value, NUTRITION_FILTER_OPTIONS)).join(','),
    pantry: filters.pantry ? 'true' : '',
    savedOnly: filters.savedOnly ? 'true' : '',
    sort: apiValueOf(filters.sort, getRecipeSortOptions(filters)),
    page: filters.page,
  }).toString();
};

// Filtros de categorías/usuarios → parámetros de la URL.
export const nameOrRecipesFiltersToParams = (filters) =>
  compactParams({
    q: filters.term,
    'con-recetas': filters.onlyWithRecipes ? '1' : '',
    orden: optionForUrl(filters.sort, NAME_OR_RECIPES_SORT_OPTIONS),
    pagina: pageForUrl(filters.page),
  });

// Filtros de categorías/usuarios → query string para GET /api/search/categories|users.
export const nameOrRecipesFiltersToApiQuery = (filters) =>
  compactParams({
    q: filters.term,
    onlyWithRecipes: filters.onlyWithRecipes ? 'true' : '',
    sort: apiValueOf(filters.sort, NAME_OR_RECIPES_SORT_OPTIONS),
    page: filters.page,
  }).toString();

// Valores "sin filtrar" de la barra lateral de recetas (para "Limpiar filtros").
export const EMPTY_RECIPE_SIDEBAR_FILTERS = { categoryId: null, time: '', rating: '', ingredientIds: [], nutritionGoals: [] };

// Cuántos filtros de la barra lateral están activos (cada ingrediente y cada necesidad
// nutricional cuentan como uno).
export const countActiveRecipeFilters = (filters) =>
  [filters.categoryId, filters.time, filters.rating].filter(Boolean).length
  + filters.ingredientIds.length
  + filters.nutritionGoals.length;

// --- Respuestas del backend ---

// Datos de paginación comunes a los tres listados.
const toPageInfo = (raw) => ({
  total: raw?.total ?? 0,
  page: raw?.page ?? 1,
  pageSize: raw?.pageSize ?? 0,
  totalPages: raw?.totalPages ?? 1,
});

// Coincidencia de una receta con la despensa, separando lo que no tiene de lo que le
// falta cantidad (se muestran distinto en la card).
const toPantryMatch = (raw) => ({
  availableCount: raw.availableCount,
  totalCount: raw.totalCount,
  isComplete: raw.isComplete,
  percentage: raw.totalCount ? Math.round((raw.availableCount / raw.totalCount) * 100) : 0,
  missingNames: raw.missing.filter((item) => item.reason === 'missing').map((item) => item.name),
  notEnoughNames: raw.missing.filter((item) => item.reason === 'not_enough').map((item) => item.name),
});

// Respuesta de GET /api/search/recipes → { items, total, page, pageSize, totalPages, pantry }.
// Cada item tiene las props de RecipeCard (con rating/reviewsCount) + pantryMatch o null +
// nutritionHighlights ([{ name, unit, perServing }] de los nutrientes filtrados, o null).
export const createRecipeListing = (raw) => ({
  ...toPageInfo(raw),
  items: (raw?.items ?? []).map((recipe) => ({
    ...toRecipeResult(recipe),
    pantryMatch: recipe.pantryMatch ? toPantryMatch(recipe.pantryMatch) : null,
    nutritionHighlights: recipe.nutritionHighlights ?? null,
  })),
  pantry: raw?.pantry ?? null,
});

export const createCategoryListing = (raw) => ({
  ...toPageInfo(raw),
  items: (raw?.items ?? []).map(toCategoryResult),
});

export const createUserListing = (raw) => ({
  ...toPageInfo(raw),
  items: (raw?.items ?? []).map(toUserResult),
});

// --- Paginación ---

// Recibe: la página actual y el total. Devuelve los números a mostrar en el paginador, con
// '…' donde se saltean páginas (ej. [1, '…', 4, 5, 6, '…', 10]). Con 7 o menos, todas.
export const buildPageList = (page, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let current = start; current <= end; current += 1) pages.push(current);
  if (end < totalPages - 1) pages.push('…');
  pages.push(totalPages);
  return pages;
};
