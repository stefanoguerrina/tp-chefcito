// Servicio que llama al endpoint de cambio de contraseña del usuario.
import { apiFetch } from '../../../shared/utils/apiFetch.js';

// Envía un PATCH para cambiar la contraseña del usuario.
// Requiere la contraseña actual para verificar la identidad del usuario.
// Requiere token JWT (del propio usuario o de un admin). Si la actual no coincide, el
// backend responde 400 con el error en el campo currentPassword.
export const changePasswordService = async (userId, currentPassword, newPassword) => {
    return await apiFetch(`/users/${userId}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword })
    });
};
