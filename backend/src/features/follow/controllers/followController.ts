// Controller de follow — maneja las rutas de /api/users/:userId/follow.
// Delega toda la lógica al followService; solo lee la request y arma la response HTTP.
// Quien sigue sale siempre del token (req.user.id), nunca del body: nadie puede hacer que
// otra persona siga a alguien.
import { Response } from 'express';
import * as followService from '../services/followService.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';

// Estado de seguimiento de un perfil: { isFollowing, followersCount, followingCount }.
// GET /api/users/:userId/follow
export const handleGetFollowStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await followService.getFollowStatus(req.user!.id, Number(req.params.userId));
    if (!result.ok) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }
    res.status(200).json(result.status);
  } catch (error) {
    console.error('[handleGetFollowStatus] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// El usuario autenticado empieza a seguir al de la URL. Responde 201 con el estado nuevo.
// POST /api/users/:userId/follow
export const handleFollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
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
    console.error('[handleFollowUser] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// El usuario autenticado deja de seguir al de la URL. Responde 200 con el estado nuevo.
// DELETE /api/users/:userId/follow
export const handleUnfollowUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await followService.unfollowUser(req.user!.id, Number(req.params.userId));
    if (!result.ok) {
      res.status(404).json({ message: 'No seguís a este usuario.' });
      return;
    }
    res.status(200).json(result.status);
  } catch (error) {
    console.error('[handleUnfollowUser] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
