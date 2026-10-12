// Servicio de inventario: centraliza todas las llamadas HTTP al backend para la feature inventory.
// Usa apiFetch (con token JWT) ya que todos los endpoints requieren autenticación.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { ApiError } from '../../../shared/utils/ApiError.js';
import { inventoryItemFromApi } from '../models/inventoryModel.js';

// Obtiene el inventario completo de un usuario.
// Recibe: userId (number).
// Devuelve: array de ítems mapeados con inventoryItemFromApi.
export const getInventory = async (userId) => {
  const items = await apiFetch(`/users/${userId}/inventory`);
  return items.map(inventoryItemFromApi);
};

// Intenta agregar un ingrediente al inventario del usuario.
// Recibe: userId, { idIngredient, availableQuantity, unitOfMeasure? }.
// Devuelve:
//   { ok: true, item } si se creó correctamente (201).
//   { ok: false, reason: 'already_exists', current: { availableQuantity, unitOfMeasure } } si ya existe (409).
// Lanza un Error para cualquier otro error (404, 422, 500).
export const addToInventory = async (userId, data) => {
  try {
    const raw = await apiFetch(`/users/${userId}/inventory`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { ok: true, item: inventoryItemFromApi(raw) };
  } catch (err) {
    // Ingrediente ya en el inventario: el 409 trae los datos actuales para el modal.
    if (err instanceof ApiError && err.isConflict) {
      return { ok: false, reason: 'already_exists', current: err.data.current };
    }
    throw err;
  }
};

// Actualiza la cantidad y/o unidad de medida de un ítem del inventario.
// Recibe: userId, ingredientId, { availableQuantity?, unitOfMeasure? }.
// Devuelve: el ítem actualizado mapeado con inventoryItemFromApi.
export const updateInventoryItem = async (userId, ingredientId, data) => {
  const raw = await apiFetch(`/users/${userId}/inventory/${ingredientId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return inventoryItemFromApi(raw);
};

// Elimina un ítem del inventario del usuario.
// Recibe: userId, ingredientId.
// Devuelve: { message } o lanza Error si no existe.
export const removeFromInventory = async (userId, ingredientId) => {
  return await apiFetch(`/users/${userId}/inventory/${ingredientId}`, {
    method: 'DELETE',
  });
};
