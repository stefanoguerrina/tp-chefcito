// Servicio de roles: centraliza las llamadas HTTP al backend (/api/roles).
// Todos los endpoints requieren token de admin, por eso se usa apiFetch en todos los casos.
import { apiFetch } from '../../../shared/utils/apiFetch.js';

// Trae todos los roles existentes.
export const getAllRoles = async () => {
  return await apiFetch('/roles');
};

// Obtiene un rol por ID.
export const getRoleById = async (id) => {
  return await apiFetch(`/roles/${id}`);
};

// Crea un nuevo rol.
// Recibe: { name, description? }
export const createRole = async (data) => {
  return await apiFetch('/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Actualiza un rol existente.
// Recibe: id, { name?, description? }
export const updateRole = async (id, data) => {
  return await apiFetch(`/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Elimina un rol por ID. Falla con 409 si es el rol admin o si tiene usuarios asociados.
export const deleteRole = async (id) => {
  return await apiFetch(`/roles/${id}`, {
    method: 'DELETE',
  });
};

// Trae los roles asignados a un usuario puntual (tabla intermedia userrole).
export const getRolesByUser = async (userId) => {
  return await apiFetch(`/roles/users/${userId}`);
};

// Asigna un rol a un usuario.
export const assignRoleToUser = async (roleId, userId) => {
  return await apiFetch(`/roles/${roleId}/users`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
};

// Quita un rol a un usuario.
export const removeRoleFromUser = async (roleId, userId) => {
  return await apiFetch(`/roles/${roleId}/users/${userId}`, {
    method: 'DELETE',
  });
};
