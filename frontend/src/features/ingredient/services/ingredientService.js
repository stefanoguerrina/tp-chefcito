// Servicio de ingredientes: centraliza las llamadas HTTP al backend.
// Todas las llamadas pasan por apiFetch (agrega el token si hay sesión y normaliza los errores).
import { apiFetch } from '../../../shared/utils/apiFetch.js';

// Trae todos los ingredientes con sus categorías (lectura pública).
// Devuelve el array de ingredientes o lanza un Error con el mensaje del backend.
export const getAllIngredients = async () => {
  return await apiFetch(`/ingredients`);
};

// Obtiene un ingrediente por ID (lectura pública).
export const getIngredientById = async (id) => {
  return await apiFetch(`/ingredients/${id}`);
};

// Crea un nuevo ingrediente (requiere token de admin).
// Recibe: { name, unitOfMeasure, description?, categoryIds: number[], nutritionalValues? }
// Devuelve: el ingrediente creado.
export const createIngredient = async (data) => {
  return await apiFetch('/ingredients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Actualiza un ingrediente existente (requiere token de admin).
// Recibe: id, { name?, description?, unitOfMeasure?, categoryIds?, nutritionalValues? }
// (categoryIds y nutritionalValues, si vienen, reemplazan por completo los que tenía).
// Devuelve: el ingrediente actualizado.
export const updateIngredient = async (id, data) => {
  return await apiFetch(`/ingredients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Elimina un ingrediente por ID (requiere token de admin).
// Devuelve: { message } o lanza Error si está en uso en recetas o inventarios (409).
export const deleteIngredient = async (id) => {
  return await apiFetch(`/ingredients/${id}`, {
    method: 'DELETE',
  });
};

// Sube (o reemplaza) la foto de un ingrediente (requiere token de admin). Mismo esquema
// que el avatar de un usuario: se manda como archivo (FormData, campo "image") y en la BD
// queda solo la ruta ("/uploads/ingredients/..."). El backend borra la foto anterior.
// Recibe: id y el File (ya comprimido). Devuelve: el ingrediente actualizado.
export const uploadIngredientImage = async (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return await apiFetch(`/ingredients/${id}/image`, {
    method: 'PATCH',
    body: formData,
  });
};

// Quita la foto de un ingrediente (requiere token de admin). Devuelve: el ingrediente actualizado.
export const deleteIngredientImage = async (id) => {
  return await apiFetch(`/ingredients/${id}/image`, {
    method: 'DELETE',
  });
};
