// Servicio de categorías de ingrediente: centraliza las llamadas HTTP al backend.
// Todas las llamadas pasan por apiFetch (agrega el token si hay sesión y normaliza los errores).
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { ingredientCategoryFromApi } from '../models/ingredientCategoryModel.js';

// Trae todas las categorías de ingrediente (lectura pública).
// Devuelve las categorías mapeadas con ingredientCategoryFromApi, o lanza un Error con el
// mensaje del backend.
export const getAllIngredientCategories = async () => {
  const categories = await apiFetch('/ingredient-categories');
  return categories.map(ingredientCategoryFromApi);
};

// Crea una nueva categoría (requiere token de admin).
// Recibe: { name, description? }
// Devuelve: la categoría creada (ingredientCategoryFromApi).
export const createIngredientCategory = async (data) => {
  const category = await apiFetch('/ingredient-categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return ingredientCategoryFromApi(category);
};

// Actualiza una categoría existente (requiere token de admin).
// Recibe: id, { name?, description? }
// Devuelve: la categoría actualizada (ingredientCategoryFromApi).
export const updateIngredientCategory = async (id, data) => {
  const category = await apiFetch(`/ingredient-categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return ingredientCategoryFromApi(category);
};

// Elimina una categoría por ID (requiere token de admin).
// Devuelve: { message } o lanza Error si tiene ingredientes asociados (409).
export const deleteIngredientCategory = async (id) => {
  return await apiFetch(`/ingredient-categories/${id}`, {
    method: 'DELETE',
  });
};
