// Servicio de userRecipe: centraliza las llamadas HTTP al backend para guardar,
// consultar, actualizar y quitar recetas guardadas. Todas las rutas requieren
// autenticación (apiFetch agrega el token JWT automáticamente).
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { savedRecipeFromApi } from '../models/userRecipeModel.js';

// Devuelve el estado de guardado del usuario autenticado para una receta, o null
// si todavía no la guardó (el backend responde 404 en ese caso).
// Recibe: idRecipe (number).
export const getUserRecipe = async (idRecipe) => {
  try {
    return await apiFetch(`/recipes/${idRecipe}/save`);
  } catch (err) {
    if (err.message.includes('No guardaste')) return null;
    throw err;
  }
};

// Guarda una receta para el usuario autenticado.
// Recibe: idRecipe (number).
export const createUserRecipe = async (idRecipe) => {
  return await apiFetch(`/recipes/${idRecipe}/save`, { method: 'POST' });
};

// Actualiza el estado de guardado (isSaved) de un registro existente.
// Recibe: idRecipe (number), isSaved (boolean).
export const updateUserRecipe = async (idRecipe, isSaved) => {
  return await apiFetch(`/recipes/${idRecipe}/save`, {
    method: 'PATCH',
    body: JSON.stringify({ isSaved }),
  });
};

// Elimina por completo el guardado de una receta para el usuario autenticado.
// Recibe: idRecipe (number).
export const deleteUserRecipe = async (idRecipe) => {
  return await apiFetch(`/recipes/${idRecipe}/save`, { method: 'DELETE' });
};

// Devuelve las recetas guardadas por un usuario, listas para RecipeCard.
// Recibe: idUser (number).
export const getSavedRecipesByUser = async (idUser) => {
  const data = await apiFetch(`/saved-recipes/${idUser}`);
  return data.map(savedRecipeFromApi);
};

// Devuelve solo los idRecipe guardados por un usuario, para marcar cards como
// guardadas en listados (feed de la home) sin traer los datos completos de cada receta.
// Recibe: idUser (number).
export const getSavedRecipeIds = async (idUser) => {
  const data = await apiFetch(`/saved-recipes/${idUser}`);
  return data.map((item) => item.idRecipe);
};
