// Servicio de búsqueda: centraliza las llamadas HTTP del buscador (requieren token).
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { createQuickSearchResults } from '../models/searchModel.js';
import { createCategoryListing, createRecipeListing, createUserListing } from '../models/searchListingModel.js';

// Busca un texto en categorías de receta, recetas y usuarios a la vez.
// Recibe: el texto a buscar (ya recortado, con al menos SEARCH_MIN_LENGTH caracteres).
// Devuelve: { categories, recipes, users } (ver createQuickSearchResults), o lanza ApiError.
export const quickSearch = async (term) => {
  const raw = await apiFetch(`/search?q=${encodeURIComponent(term)}`);
  return createQuickSearchResults(raw);
};

// Una página del listado de recetas con filtros.
// Recibe: el query string ya armado (ver recipeFiltersToApiQuery).
// Devuelve: ver createRecipeListing. Lanza ApiError si falla.
export const getRecipeListing = async (apiQuery) => {
  const raw = await apiFetch(`/search/recipes?${apiQuery}`);
  return createRecipeListing(raw);
};

// Una página del listado de categorías de receta (ver nameOrRecipesFiltersToApiQuery).
export const getCategoryListing = async (apiQuery) => {
  const raw = await apiFetch(`/search/categories?${apiQuery}`);
  return createCategoryListing(raw);
};

// Una página del listado de usuarios (ver nameOrRecipesFiltersToApiQuery).
export const getUserListing = async (apiQuery) => {
  const raw = await apiFetch(`/search/users?${apiQuery}`);
  return createUserListing(raw);
};
