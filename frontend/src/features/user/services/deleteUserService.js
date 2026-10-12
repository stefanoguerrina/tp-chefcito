// Servicio que llama al endpoint de baja lógica de usuario del backend.
import { apiFetch } from '../../../shared/utils/apiFetch.js';

// Envía una petición DELETE para dar de baja (lógicamente) a un usuario por su ID.
// El backend setea deletedAt en lugar de borrar el registro.
// Requiere token JWT de administrador.
export const deleteUserService = async (userId) => {
    return await apiFetch(`/users/${userId}`, { method: 'DELETE' });
};
