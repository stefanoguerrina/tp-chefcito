// Servicio que llama al endpoint de obtención de un usuario por ID.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { ApiError } from '../../../shared/utils/ApiError.js';

// Obtiene los datos públicos de un usuario por su ID numérico, o null si no existe.
// Requiere token JWT.
export const getUserByIdService = async (userId) => {
    try {
        return await apiFetch(`/users/${userId}`);
    } catch (err) {
        if (err instanceof ApiError && err.isNotFound) return null;
        throw err;
    }
};
