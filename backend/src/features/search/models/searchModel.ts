// Tipos y constantes de la búsqueda: la rápida (barra de búsqueda y página /buscar) y los
// listados completos con filtros (/buscar/recetas, /buscar/categorias, /buscar/usuarios).
// Esta capa no tiene lógica: solo describe la forma de los datos.

// Largo aceptado del texto a buscar. Con 1 sola letra casi todo coincide, así que la
// búsqueda arranca recién a partir de 2 caracteres (el frontend usa el mismo mínimo).
export const SEARCH_TERM_MIN_LENGTH = 2;
export const SEARCH_TERM_MAX_LENGTH = 100;

// Cuántos resultados de cada tipo devuelve la búsqueda. Son pocos a propósito: tanto el
// panel que aparece mientras se escribe como la página de resultados (/buscar) muestran
// una vista previa de cada sección; el total real viaja aparte (total) para que el
// frontend pueda mostrar "Ver todas las recetas (24)" o "+12 recetas más".
export const QUICK_SEARCH_LIMITS = {
  categories: 3,
  recipes: 4,
  users: 3,
} as const;

// Una sección de la respuesta: los primeros resultados + cuántos coinciden en total.
export interface SearchSection<T> {
  items: T[];
  total: number;
}

// Categoría de receta tal como la devuelve la búsqueda (con su cantidad de recetas).
export interface CategorySearchResult {
  id: number;
  name: string;
  recipeCount: number;
}

// --- Listados completos (/buscar/recetas, /buscar/categorias, /buscar/usuarios) ---

// Cuántos resultados trae cada página de un listado.
export const LISTING_PAGE_SIZE = 12;

// Órdenes posibles del listado de recetas. 'saved' (guardadas más recientemente) solo tiene
// sentido junto con el filtro de recetas guardadas (página "Recetas guardadas").
export const RECIPE_SORTS = ['relevance', 'popular', 'rating', 'time', 'recent', 'saved'] as const;
export type RecipeSort = (typeof RECIPE_SORTS)[number];

// Órdenes posibles de los listados de categorías y usuarios.
export const NAME_OR_RECIPES_SORTS = ['name', 'recipes'] as const;
export type NameOrRecipesSort = (typeof NAME_OR_RECIPES_SORTS)[number];

// Filtros del listado de recetas (todos opcionales salvo los que tienen valor por defecto).
// maxTime/minTime en minutos; minRating entre 1 y 5; pantry = "Con mi despensa";
// savedByUserId = solo las recetas que guardó ese usuario ("Recetas guardadas");
// authorId = solo las recetas que publicó ese usuario (galería del perfil).
export interface RecipeListingFilters {
  term?: string;
  savedByUserId?: number;
  authorId?: number;
  categoryId?: number;
  maxTime?: number;
  minTime?: number;
  minRating?: number;
  ingredientIds: number[];
  pantry: boolean;
  sort: RecipeSort;
  page: number;
}

// Filtros de los listados de categorías y usuarios.
export interface CategoryListingFilters {
  term?: string;
  onlyWithRecipes: boolean;
  sort: NameOrRecipesSort;
  page: number;
}
export type UserListingFilters = CategoryListingFilters;

// Un ingrediente de la receta que el usuario no puede cubrir con su despensa: o no lo
// tiene cargado ('missing'), o tiene menos cantidad de la que pide la receta ('not_enough').
export interface PantryMissingIngredient {
  idIngredient: number;
  name: string;
  reason: 'missing' | 'not_enough';
}

// Cuánto de una receta se puede hacer con lo que hay en la despensa.
export interface PantryMatch {
  availableCount: number;
  totalCount: number;
  missing: PantryMissingIngredient[];
  isComplete: boolean;
}

// Una página de un listado.
export interface ListingPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
