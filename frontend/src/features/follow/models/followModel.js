// Modelo de la feature Follow ("Seguir" a otros usuarios): mapea la respuesta cruda del
// backend a la forma que usan los componentes. Factory functions simples, sin clases.

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
