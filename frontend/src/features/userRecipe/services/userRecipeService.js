// Servicio de userRecipe: centraliza las llamadas HTTP al backend para guardar,
// consultar y quitar recetas guardadas. Todas las rutas requieren
// autenticación (apiFetch agrega el token JWT automáticamente).
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { userRecipeFromApi } from '../models/userRecipeModel.js';

// Guarda una receta para el usuario autenticado.
// Recibe: idRecipe (number). Devuelve: el registro guardado (userRecipeFromApi).
export const createUserRecipe = async (idRecipe) => {
  const userRecipe = await apiFetch(`/recipes/${idRecipe}/save`, { method: 'POST' });
  return userRecipeFromApi(userRecipe);
};

// Elimina por completo el guardado de una receta para el usuario autenticado.
// Recibe: idRecipe (number).
export const deleteUserRecipe = async (idRecipe) => {
  return await apiFetch(`/recipes/${idRecipe}/save`, { method: 'DELETE' });
};

// Devuelve solo los idRecipe guardados por un usuario, para marcar cards como
// guardadas en listados (feed de la home) sin traer los datos completos de cada receta.
// Recibe: idUser (number).
export const getSavedRecipeIds = async (idUser) => {
  const data = await apiFetch(`/saved-recipes/${idUser}`);
  return data.map((item) => userRecipeFromApi(item).idRecipe);
};
