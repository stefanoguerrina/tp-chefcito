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

// Qué lista de un perfil se pide: quiénes lo siguen o a quiénes sigue.
export type FollowListKind = 'followers' | 'following';

// Datos públicos de cada persona de esas listas (nunca email, teléfono ni fecha de nacimiento).
export interface FollowListUser {
  id: number;
  username: string;
  name: string;
  lastName: string;
  avatarUrl: string | null;
}
