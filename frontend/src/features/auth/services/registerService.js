// Servicio de registro — llama al endpoint de creación de cuenta del backend.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { PHONE_COUNTRY_PREFIX } from "../models/registerModel";

// Envía los datos de registro al backend.
// Si falla (validación 422, email/usuario duplicado 409 o servidor caído), apiFetch lanza
// un ApiError con el mensaje específico del backend.
export const registerService = async (form) => {
    return await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
            username: form.userName,
            name: form.formalName,
            lastName: form.surName,
            email: form.email,
            password: form.password,
            // El campo solo guarda el número local; el prefijo de país se antepone acá.
            phone: form.telephone ? `${PHONE_COUNTRY_PREFIX} ${form.telephone.trim()}` : null,
            birthDate: form.birthDate || null
        })
    });
};
