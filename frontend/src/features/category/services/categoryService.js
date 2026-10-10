// Servicio de categorías (de receta): centraliza las llamadas HTTP al backend.
// La lectura requiere token de usuario (cualquier autenticado); el alta, edición y borrado
// requieren token de admin (verifyAdmin en el backend).
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { categoryFromApi } from '../models/categoryModel.js';

// Trae todas las categorías de receta disponibles (requiere estar autenticado).
// Devuelve las categorías mapeadas con categoryFromApi, o lanza un Error con el mensaje
// del backend.
export const getAllCategories = async () => {
  const categories = await apiFetch('/categories');
  return categories.map(categoryFromApi);
};

// Crea una nueva categoría de receta (requiere token de admin).
// Recibe: { name, description? }
// Devuelve: la categoría creada (categoryFromApi).
export const createCategory = async (data) => {
  const category = await apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return categoryFromApi(category);
};

// Actualiza una categoría de receta existente (requiere token de admin).
// Recibe: id, { name?, description? }
// Devuelve: la categoría actualizada (categoryFromApi).
export const updateCategory = async (id, data) => {
  const category = await apiFetch(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return categoryFromApi(category);
};

// Elimina una categoría de receta por ID (requiere token de admin). A diferencia de las
// categorías de ingrediente, esta tabla no tiene baja lógica ni bloqueo por uso: si la
// categoría tenía recetas asignadas, esos vínculos se borran en cascada (las recetas en
// sí no se tocan).
export const deleteCategory = async (id) => {
  return await apiFetch(`/categories/${id}`, {
    method: 'DELETE',
  });
};
