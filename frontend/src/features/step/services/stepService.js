// Servicio de pasos de preparación: centraliza las llamadas HTTP al backend.
// Los pasos de una receta se editan siempre como una lista completa (agregar,
// quitar o reordenar en el mismo formulario), por eso la única escritura
// disponible es "reemplazar todo el set" (PUT), no un CRUD por paso individual.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { stepFromApi } from '../models/stepModel.js';

// Reemplaza por completo los pasos de una receta (requiere ser el dueño o admin).
// Recibe: idRecipe, steps: [{ instruction, estimatedTime? }, ...] en el orden final.
// Devuelve: la lista de pasos ya numerados (mapeados con stepFromApi).
export const replaceSteps = async (idRecipe, steps) => {
  const savedSteps = await apiFetch(`/recipes/${idRecipe}/steps`, {
    method: 'PUT',
    body: JSON.stringify({ steps }),
  });
  return savedSteps.map(stepFromApi);
};
