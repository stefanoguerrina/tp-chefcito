// Utilidad compartida para hacer fetch al backend con el token JWT incluido automáticamente.
// Centraliza la autenticación y el manejo de errores HTTP para todos los servicios: cualquier
// falla se lanza como ApiError con un mensaje listo para mostrarle al usuario.
import { ApiError } from './ApiError.js';
import { API_BASE_URL } from '../config/config.js';

// Evento global que se dispara cuando el backend rechaza el token (vencido o inválido).
// AuthContext lo escucha para cerrar la sesión sin que cada pantalla tenga que hacerlo.
export const SESSION_EXPIRED_EVENT = 'chefcito:session-expired';

// Mensajes genéricos por código HTTP, para cuando el backend no manda uno propio.
const DEFAULT_MESSAGES = {
  400: 'La solicitud no es válida.',
  401: 'Tu sesión expiró. Volvé a iniciar sesión.',
  403: 'No tenés permisos para realizar esta acción.',
  404: 'No encontramos lo que buscabas.',
  409: 'Ya existe un registro con esos datos.',
  422: 'Revisá los datos ingresados.',
  500: 'Ocurrió un error en el servidor. Intentá de nuevo más tarde.',
};

// Arma el mensaje para el usuario a partir del body de error del backend.
// El backend responde { message, errors: [{ campo, mensaje }] } (o { errores } en auth):
// si hay errores por campo, se muestran esos (son más específicos que el "Error de validación").
const buildErrorMessage = (status, data, fieldErrors) => {
  if (fieldErrors.length > 0) return fieldErrors.map((e) => e.mensaje).join(' ');
  return data.message || DEFAULT_MESSAGES[status] || `Error del servidor (${status}).`;
};

// Realiza un fetch al backend.
// Recibe:
//   - endpoint: la ruta relativa a la base de la API (ej: '/users/5').
//   - options: opciones de fetch (method, body, etc.). El token se agrega automáticamente;
//     el Content-Type JSON también, salvo que el body sea un FormData (subida de archivos),
//     donde el navegador tiene que poner su propio Content-Type con el boundary.
// Devuelve el JSON de la respuesta (o null si vino vacía). Lanza ApiError si falla.
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    // El fetch mismo falló: backend apagado, sin internet, URL mal configurada, etc.
    throw new ApiError('No se pudo conectar con el servidor. Verificá tu conexión o intentá más tarde.', 0);
  }

  // Algunas respuestas exitosas no traen body; en ese caso se devuelve null.
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorData = data || {};
    const fieldErrors = errorData.errors || errorData.errores || [];

    // Solo se cierra la sesión si se había mandado un token: un 401 sin token es, por
    // ejemplo, un login con credenciales incorrectas, y ahí hay que mostrar el mensaje.
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    throw new ApiError(buildErrorMessage(response.status, errorData, fieldErrors), response.status, fieldErrors, errorData);
  }

  return data;
};

// Ejecuta un pedido de listado y devuelve [] si el backend responde 404. Varios listados
// del backend responden 404 ("No se encontraron ...") cuando todavía no hay registros, y
// para la interfaz eso no es un error sino una lista vacía.
// Recibe: fetchList, una función que devuelve la promesa del listado.
export const fetchListOrEmpty = async (fetchList) => {
  try {
    return await fetchList();
  } catch (error) {
    if (error instanceof ApiError && error.isNotFound) return [];
    throw error;
  }
};
