// Servicio de registro — llama al endpoint de creación de cuenta del backend.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { toRegisterPayload } from "../models/registerModel";

// Envía los datos de registro al backend.
// Si falla (validación 422, email/usuario duplicado 409 o servidor caído), apiFetch lanza
// un ApiError con el mensaje específico del backend.
export const registerService = async (form) => {
    return await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(toRegisterPayload(form))
    });
};
