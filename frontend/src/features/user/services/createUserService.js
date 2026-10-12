// Servicio que llama al endpoint de creación de usuario por administrador.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { toRegisterPayload } from '../../auth/models/registerModel.js';

// Crea un usuario desde el panel admin. Pide los mismos datos que el registro (form de
// useRegisterForm) más makeAdmin: si es true, el backend le suma el rol administrador.
// Recibe: form y makeAdmin. Devuelve: el usuario creado (sin contraseña).
export const createUserService = async (form, makeAdmin) => {
    return await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ ...toRegisterPayload(form), makeAdmin })
    });
};
