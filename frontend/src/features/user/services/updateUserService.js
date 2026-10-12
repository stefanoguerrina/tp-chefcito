// Servicio que llama al endpoint de actualización de datos del usuario.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { userFromApi } from '../models/userModel.js';

// Envía un PATCH con los campos editables del usuario (ver toProfilePayload en userModel).
// Requiere token JWT (del propio usuario o de un admin).
// Devuelve: el usuario actualizado (userFromApi).
export const updateUserService = async (userId, data) => {
    const user = await apiFetch(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
    return userFromApi(user);
};
