// Lógica de negocio de la feature follow: seguir y dejar de seguir a otro usuario, y el
// estado de seguimiento de un perfil (¿lo sigo?, cuántos seguidores y seguidos tiene).
import { followRepository } from '../repository/followRepository.js';
import { userRepository } from '../../user/repository/userRepository.js';
import type { FollowStatus } from '../models/followModel.js';

// Recibe: el usuario autenticado (idUser) y el perfil que está mirando (idTarget).
// Devuelve: el estado de seguimiento de ese perfil. Los tres datos son independientes,
// así que se piden en paralelo.
const buildFollowStatus = async (idUser: number, idTarget: number): Promise<FollowStatus> => {
  const [follow, followersCount, followingCount] = await Promise.all([
    followRepository.findOne(idUser, idTarget),
    followRepository.countFollowers(idTarget),
    followRepository.countFollowing(idTarget),
  ]);
  return { isFollowing: Boolean(follow), followersCount, followingCount };
};

// Estado de seguimiento del perfil idTarget visto por idUser. También sirve para el perfil
// propio: ahí isFollowing es siempre false y solo interesan los contadores.
export async function getFollowStatus(
  idUser: number,
  idTarget: number
): Promise<{ ok: true; status: FollowStatus } | { ok: false; reason: 'user_not_found' }> {
  const target = await userRepository.findById(idTarget);
  if (!target) return { ok: false, reason: 'user_not_found' };

  return { ok: true, status: await buildFollowStatus(idUser, idTarget) };
}

// idUser empieza a seguir a idTarget.
// Reglas de negocio:
//   - Nadie puede seguirse a sí mismo.
//   - Solo se puede seguir a un usuario activo (sin baja lógica).
//   - No se puede seguir dos veces a la misma persona.
// Devuelve el estado actualizado, así el frontend refresca el botón y los contadores
// sin volver a pedirlos.
export async function followUser(
  idUser: number,
  idTarget: number
): Promise<
  | { ok: true; status: FollowStatus }
  | { ok: false; reason: 'self_follow' | 'user_not_found' | 'already_following' }
> {
  if (idUser === idTarget) return { ok: false, reason: 'self_follow' };

  const target = await userRepository.findById(idTarget);
  if (!target) return { ok: false, reason: 'user_not_found' };

  const existing = await followRepository.findOne(idUser, idTarget);
  if (existing) return { ok: false, reason: 'already_following' };

  await followRepository.create(idUser, idTarget);
  return { ok: true, status: await buildFollowStatus(idUser, idTarget) };
}

// idUser deja de seguir a idTarget. Si no lo seguía, no hay nada que borrar.
// Devuelve el estado actualizado (igual que followUser).
export async function unfollowUser(
  idUser: number,
  idTarget: number
): Promise<{ ok: true; status: FollowStatus } | { ok: false; reason: 'not_following' }> {
  const existing = await followRepository.findOne(idUser, idTarget);
  if (!existing) return { ok: false, reason: 'not_following' };

  await followRepository.delete(idUser, idTarget);
  return { ok: true, status: await buildFollowStatus(idUser, idTarget) };
}
