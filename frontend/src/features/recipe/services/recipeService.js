// Servicio de recetas: centraliza las llamadas HTTP al backend.
// Las lecturas son públicas (cualquiera puede ver recetas); solo el dueño o un admin
// puede modificarlas o eliminarlas. Todo pasa por apiFetch, que normaliza los errores.
import { apiFetch } from '../../../shared/utils/apiFetch.js';

// Trae todas las recetas con sus categorías, creador e imágenes (lectura pública).
// Recibe: userId opcional para filtrar solo las recetas de ese usuario.
// Devuelve el array de recetas o lanza un Error con el mensaje del backend.
export const getAllRecipes = async (userId) => {
  return await apiFetch(userId ? `/recipes?userId=${userId}` : '/recipes');
};

// Obtiene una receta por ID (lectura pública).
export const getRecipeById = async (id) => {
  return await apiFetch(`/recipes/${id}`);
};

// Crea una nueva receta para el usuario autenticado (requiere token).
// Recibe: { name, description?, preparationTime?, categoryIds?: number[] }
// Devuelve: la receta creada.
export const createRecipe = async (data) => {
  return await apiFetch('/recipes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Actualiza una receta existente (requiere ser el dueño o admin).
// Recibe: id, { name?, description?, preparationTime?, categoryIds?: number[] }
// Devuelve: la receta actualizada.
export const updateRecipe = async (id, data) => {
  return await apiFetch(`/recipes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Elimina una receta por ID (requiere ser el dueño o admin).
// Devuelve: { message } o lanza Error si no está autorizado (403).
export const deleteRecipe = async (id) => {
  return await apiFetch(`/recipes/${id}`, {
    method: 'DELETE',
  });
};
