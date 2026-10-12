// Servicio de login — llama al endpoint de autenticación del backend.
import { apiFetch } from '../../../shared/utils/apiFetch.js';

// Envía las credenciales al backend y devuelve { token } en caso de éxito.
// Si falla (credenciales incorrectas, validación o servidor caído), apiFetch lanza un
// ApiError con el mensaje listo para mostrar.
export const loginService = async (form) => {
    return await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: form.email,
            password: form.password
        })
    });
};
