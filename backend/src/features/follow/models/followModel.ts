// Tipos de dominio de la feature Follow ("Seguir" a otros usuarios).
// Esta capa no tiene lógica: solo describe la forma de los datos.
// Quien sigue es siempre el usuario del token; a quién se sigue sale de la URL (:userId).

// Estado de seguimiento de un perfil, visto por el usuario autenticado. Los contadores
// solo cuentan usuarios activos (sin baja lógica).
export interface FollowStatus {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}
