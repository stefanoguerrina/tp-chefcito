// Router de follow — define los endpoints de /api/users/:userId/follow ("Seguir").
// Se monta anidado bajo /users/:userId en apiRouter, por eso usa { mergeParams: true }
// (igual que inventoryRouter). Todo requiere estar autenticado: el que sigue es el
// usuario del token.
import { Router } from 'express';
import { getFollowStatus, followUser, unfollowUser, getFollowers, getFollowing } from '../controllers/followController.js';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';
import { validateFollowTarget } from '../middleware/followValidationMiddleware.js';

const followRouter = Router({ mergeParams: true });

// GET /api/users/:userId/follow — ¿sigo a este usuario? + sus seguidores y seguidos
followRouter.get('/', verifyToken, validateFollowTarget, handleValidationErrors, getFollowStatus);

// GET /api/users/:userId/follow/followers — quiénes siguen al usuario
followRouter.get('/followers', verifyToken, validateFollowTarget, handleValidationErrors, getFollowers);

// GET /api/users/:userId/follow/following — a quiénes sigue el usuario
followRouter.get('/following', verifyToken, validateFollowTarget, handleValidationErrors, getFollowing);

// POST /api/users/:userId/follow — empezar a seguir al usuario
followRouter.post('/', verifyToken, validateFollowTarget, handleValidationErrors, followUser);

// DELETE /api/users/:userId/follow — dejar de seguir al usuario
followRouter.delete('/', verifyToken, validateFollowTarget, handleValidationErrors, unfollowUser);

export { followRouter };
