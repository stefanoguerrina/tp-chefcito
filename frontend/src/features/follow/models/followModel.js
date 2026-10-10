// Modelo de la feature Follow ("Seguir" a otros usuarios): mapea la respuesta cruda del
// backend a la forma que usan los componentes. Factory functions simples, sin clases.
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Las dos listas de un perfil, con el título de su pestaña y el texto si está vacía.
export const FOLLOW_LISTS = {
  followers: { label: 'Seguidores', emptyMessage: 'Todavía no lo sigue nadie.' },
  following: { label: 'Seguidos', emptyMessage: 'Todavía no sigue a nadie.' },
};

// Convierte el estado de seguimiento de GET/POST/DELETE /api/users/:userId/follow.
// Recibe: la respuesta cruda y el id del perfil (se guarda para no mostrar el estado de
// un perfil en otro mientras llega el nuevo, ver useFollow).
// Devuelve: { userId, isFollowing, followersCount, followingCount }.
export const followStatusFromApi = (raw, userId) => ({
  userId,
  isFollowing: Boolean(raw?.isFollowing),
  followersCount: raw?.followersCount ?? 0,
  followingCount: raw?.followingCount ?? 0,
});

// Convierte una persona de las listas de seguidores o seguidos (GET
// /api/users/:userId/follow/followers|following).
// Recibe: { id, username, name, lastName, avatarUrl }.
// Devuelve: { id, username, name, lastName, fullName, avatarUrl (lista para <img>) }.
export const followListUserFromApi = (raw) => ({
  id: raw.id,
  username: raw.username,
  name: raw.name ?? '',
  lastName: raw.lastName ?? '',
  fullName: `${raw.name ?? ''} ${raw.lastName ?? ''}`.trim() || raw.username,
  avatarUrl: resolveImageUrl(raw.avatarUrl),
});
