// Controller de follow — maneja las rutas de /api/users/:userId/follow.
// Delega toda la lógica al followService; solo lee la request y arma la response HTTP.
// Quien sigue sale siempre del token (req.user.id), nunca del body: nadie puede hacer que
// otra persona siga a alguien.
import { Response } from 'express';
import * as followService from '../services/followService.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';
import type { FollowListKind } from '../models/followModel.js';

// Estado de seguimiento de un perfil: { isFollowing, followersCount, followingCount }.
// GET /api/users/:userId/follow
export const getFollowStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await followService.getFollowStatus(req.user!.id, Number(req.params.userId));
    if (!result.ok) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }
    res.status(200).json(result.status);
  } catch (error) {
    console.error('[getFollowStatus] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Arma el handler de una de las dos listas de un perfil (seguidores o seguidos): las dos
// responden igual, solo cambia qué lista se pide. Responde 200 con la lista ([] si está
// vacía) o 404 si el perfil no existe.
// GET /api/users/:userId/follow/followers y /api/users/:userId/follow/following
const buildFollowListHandler = (kind: FollowListKind) => async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await followService.getFollowList(Number(req.params.userId), kind);
    if (!result.ok) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }
    res.status(200).json(result.users);
  } catch (error) {
    console.error(`[getFollowList:${kind}] Error inesperado:`, error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

export const getFollowers = buildFollowListHandler('followers');
export const getFollowing = buildFollowListHandler('following');

// El usuario autenticado empieza a seguir al de la URL. Responde 201 con el estado nuevo.
// POST /api/users/:userId/follow
export const followUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await followService.followUser(req.user!.id, Number(req.params.userId));
    if (!result.ok) {
      switch (result.reason) {
        case 'self_follow':
          res.status(400).json({ message: 'No podés seguirte a vos mismo.' });
          return;
        case 'user_not_found':
          res.status(404).json({ message: 'Usuario no encontrado.' });
          return;
        default:
          res.status(409).json({ message: 'Ya seguís a este usuario.' });
          return;
      }
    }
    res.status(201).json(result.status);
  } catch (error) {
    console.error('[followUser] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// El usuario autenticado deja de seguir al de la URL. Responde 200 con el estado nuevo.
// DELETE /api/users/:userId/follow
export const unfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await followService.unfollowUser(req.user!.id, Number(req.params.userId));
    if (!result.ok) {
      res.status(404).json({ message: 'No seguís a este usuario.' });
      return;
    }
    res.status(200).json(result.status);
  } catch (error) {
    console.error('[unfollowUser] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
