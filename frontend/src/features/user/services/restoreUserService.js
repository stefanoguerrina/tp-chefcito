// Servicio que llama al endpoint de reactivación de usuario del backend.
import { apiFetch } from '../../../shared/utils/apiFetch.js';

// Envía una petición PATCH para reactivar (dar de alta) a un usuario dado de baja.
// Solo admins pueden usar este endpoint.
export const restoreUserService = async (userId) => {
    return await apiFetch(`/users/${userId}/restore`, { method: 'PATCH' });
};
