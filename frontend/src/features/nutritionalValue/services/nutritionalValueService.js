// Servicio de valores nutricionales: centraliza las llamadas HTTP al backend.
// Los valores nutricionales están anidados bajo un ingrediente:
// /api/ingredients/:idIngredient/nutritional-values
import { apiFetch } from '../../../shared/utils/apiFetch.js';

// Trae todos los valores nutricionales de un ingrediente (lectura pública).
// Recibe: idIngredient (número)
// Devuelve: array de valores nutricionales.
export const getNutritionalValuesByIngredient = async (idIngredient) => {
  return await apiFetch(`/ingredients/${idIngredient}/nutritional-values`);
};

// Obtiene un valor nutricional específico por su número (lectura pública).
// Recibe: idIngredient, num
export const getNutritionalValueByNum = async (idIngredient, num) => {
  return await apiFetch(`/ingredients/${idIngredient}/nutritional-values/${num}`);
};

// Crea un valor nutricional para un ingrediente (requiere token de admin).
// Recibe: idIngredient, { name, servingAmount?, servingUnit?, value? }
// Devuelve: el valor nutricional creado.
export const createNutritionalValue = async (idIngredient, data) => {
  return await apiFetch(`/ingredients/${idIngredient}/nutritional-values`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Actualiza un valor nutricional existente (requiere token de admin).
// Recibe: idIngredient, num, { name?, servingAmount?, servingUnit?, value? }
export const updateNutritionalValue = async (idIngredient, num, data) => {
  return await apiFetch(`/ingredients/${idIngredient}/nutritional-values/${num}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Elimina un valor nutricional por su número (requiere token de admin).
export const deleteNutritionalValue = async (idIngredient, num) => {
  return await apiFetch(`/ingredients/${idIngredient}/nutritional-values/${num}`, {
    method: 'DELETE',
  });
};
