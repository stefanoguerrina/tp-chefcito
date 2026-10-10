// Servicio de ingredientes de receta: centraliza las llamadas HTTP al backend.
// Igual que los pasos, los ingredientes de una receta se editan siempre como
// una lista completa (agregar/quitar en el mismo formulario), por eso la única
// escritura disponible es "reemplazar todo el set" (PUT).
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { recipeIngredientFromApi } from '../models/recipeIngredientModel.js';

// Reemplaza por completo los ingredientes de una receta (requiere ser el dueño o admin).
// Recibe: idRecipe, ingredients: [{ idIngredient, requiredQuantity? }, ...].
// Devuelve: la lista guardada (mapeada con recipeIngredientFromApi).
export const replaceRecipeIngredients = async (idRecipe, ingredients) => {
  const items = await apiFetch(`/recipes/${idRecipe}/ingredients`, {
    method: 'PUT',
    body: JSON.stringify({ ingredients }),
  });
  return items.map(recipeIngredientFromApi);
};
