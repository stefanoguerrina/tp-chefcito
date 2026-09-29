// Servicio de "Seguir": centraliza las llamadas HTTP de la feature follow (requieren token).
// Quien sigue es siempre el usuario logueado: el backend lo toma del token.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { followStatusFromApi } from '../models/followModel.js';

// Estado de seguimiento de un perfil (¿lo sigo? + sus seguidores y seguidos).
// Recibe: userId del perfil. Devuelve: ver followStatusFromApi. Lanza ApiError si falla.
export const getFollowStatus = async (userId) => {
  const raw = await apiFetch(`/users/${userId}/follow`);
  return followStatusFromApi(raw, userId);
};

// Empieza a seguir al usuario indicado. Devuelve el estado actualizado.
export const followUser = async (userId) => {
  const raw = await apiFetch(`/users/${userId}/follow`, { method: 'POST' });
  return followStatusFromApi(raw, userId);
};

// Deja de seguir al usuario indicado. Devuelve el estado actualizado.
export const unfollowUser = async (userId) => {
  const raw = await apiFetch(`/users/${userId}/follow`, { method: 'DELETE' });
  return followStatusFromApi(raw, userId);
};
