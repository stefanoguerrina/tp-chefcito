// Servicio que llama al endpoint de obtención de un usuario por ID.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { ApiError } from '../../../shared/utils/ApiError.js';
import { userFromApi } from '../models/userModel.js';

// Obtiene un usuario por su ID numérico (mapeado con userFromApi), o null si no existe.
// Requiere token JWT.
export const getUserByIdService = async (userId) => {
    try {
        const user = await apiFetch(`/users/${userId}`);
        return userFromApi(user);
    } catch (err) {
        if (err instanceof ApiError && err.isNotFound) return null;
        throw err;
    }
};
