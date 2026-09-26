// Servicio que llama al endpoint de listado de usuarios del backend.
import { apiFetch, fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';

// Obtiene la lista de usuarios del servidor ([] si no hay ninguno).
// Si inactive=true, devuelve los usuarios dados de baja (requiere token de admin).
// Si inactive=false (por defecto), devuelve los usuarios activos (cualquier usuario autenticado).
export const searchUsersService = async ({ inactive = false } = {}) => {
    return await fetchListOrEmpty(() => apiFetch(inactive ? '/users?inactive=true' : '/users'));
};
