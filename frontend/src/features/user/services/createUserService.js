// Servicio que llama al endpoint de creación de usuario por administrador.
import { apiFetch } from '../../../shared/utils/apiFetch.js';

// Envía una petición POST para crear un nuevo usuario.
// Solo un admin puede usar este endpoint.
// Si makeAdmin=true, el backend le asigna el rol administrador al usuario creado.
export const createUserService = async (userData) => {
    return await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
};
