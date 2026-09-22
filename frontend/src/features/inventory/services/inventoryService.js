// Servicio de inventario: centraliza todas las llamadas HTTP al backend para la feature inventory.
// Usa apiFetch (con token JWT) ya que todos los endpoints requieren autenticación.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { inventoryItemFromApi } from '../models/inventoryModel.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/users/${userId}/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (response.status === 409) {
    // Ingrediente ya en el inventario: devolvemos los datos actuales para el modal
    const errorData = await response.json().catch(() => ({}));
    return { ok: false, reason: 'already_exists', current: errorData.current };
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error del servidor (${response.status}).`);
  }

  const raw = await response.json();
  return { ok: true, item: inventoryItemFromApi(raw) };
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
