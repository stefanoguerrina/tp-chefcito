// Router del feed de la home — define los endpoints de /api/feed.
// Las secciones de "amigos" requieren estar autenticado (dependen de a quién sigue el
// usuario del token). El top de recetas es público: no usa datos del usuario y lo muestra
// también la landing a los visitantes.
import { Router } from 'express';
import { handleGetFriendsRecipes, handleGetFriendsReviews, handleGetTopRecipes } from '../controllers/feedController.js';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';
import { validateFriendsFeed, validateTopRecipes } from '../middleware/feedValidationMiddleware.js';

const feedRouter = Router();

// GET /api/feed/friends/recipes?limit=4 — últimas recetas de las personas que sigo
feedRouter.get('/friends/recipes', verifyToken, validateFriendsFeed, handleValidationErrors, handleGetFriendsRecipes);

// GET /api/feed/friends/reviews?limit=6 — últimas reseñas de las personas que sigo
feedRouter.get('/friends/reviews', verifyToken, validateFriendsFeed, handleValidationErrors, handleGetFriendsReviews);

// GET /api/feed/top-recipes?days=7&limit=10 — las mejor valoradas en los últimos N días (público)
feedRouter.get('/top-recipes', validateTopRecipes, handleValidationErrors, handleGetTopRecipes);

export { feedRouter };
