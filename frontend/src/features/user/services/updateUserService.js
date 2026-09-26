// Servicio que llama al endpoint de actualización de datos del usuario.
import { apiFetch } from '../../../shared/utils/apiFetch.js';

// Envía un PATCH con los campos editables del usuario (nombre, apellido, teléfono, avatar).
// Requiere token JWT (del propio usuario o de un admin).
// Solo incluye los campos que estén definidos en el objeto `data`.
export const updateUserService = async (userId, data) => {
    return await apiFetch(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
};
