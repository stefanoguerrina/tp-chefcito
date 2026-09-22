// Router de listado — define /api/saved-recipes/:idUser.
// Se mantiene separado de userRecipeRouter porque no cuelga de una receta puntual,
// sino que lista todas las recetas guardadas por un usuario.
import { Router } from 'express';
import { listSavedRecipesByUser } from '../controllers/userRecipeController.js';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';

const savedRecipesRouter = Router();

// GET /api/saved-recipes/:idUser — recetas guardadas por un usuario (el propio o admin)
savedRecipesRouter.get('/:idUser', verifyToken, listSavedRecipesByUser);

export { savedRecipesRouter };
