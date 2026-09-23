// Servicio de registro — llama al endpoint de creación de cuenta del backend.
import { PHONE_COUNTRY_PREFIX } from "../models/registerModel";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Envía los datos de registro al backend.
// Si hay errores de validación (422), los lanza como string con los mensajes específicos por campo.
// Si hay conflicto (409), lanza el mensaje del backend (ej: "El email ya está registrado.").
// Si el servidor no está disponible (error de red), lanza un mensaje amigable.
export const registerService = async (form) => {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
    } catch {
        // El fetch mismo falló: backend caído, sin red, CORS, URL incorrecta, etc.
        throw new Error('No se pudo conectar con el servidor. Verificá tu conexión o intentá más tarde.');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Si el backend devolvió errores de campo específicos (validación), los mostramos.
        if (errorData.errores && Array.isArray(errorData.errores)) {
            const mensajes = errorData.errores.map((e) => e.mensaje).join(' ');
            throw new Error(mensajes);
        }

        // Si es un conflicto (409) o cualquier otro error, usamos el mensaje del backend.
        throw new Error(errorData.message || 'Error al registrar el usuario. Intentá de nuevo.');
    }

    return await response.json();
};
