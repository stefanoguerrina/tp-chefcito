// Router de la búsqueda — define los endpoints de /api/search.
// Requiere estar autenticado: busca también usuarios y categorías, que en el resto de la
// API ya piden token (GET /api/users y GET /api/categories), y "Con mi despensa" necesita
// saber de quién es la despensa.
import { Router } from 'express';
import { handleQuickSearch, handleListRecipes, handleListCategories, handleListUsers } from '../controllers/searchController.js';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import {
  validateQuickSearch,
  validateRecipeListing,
  validateNameOrRecipesListing,
} from '../middleware/searchValidationMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';

const searchRouter = Router();

// GET /api/search?q=texto — primeras coincidencias en categorías, recetas y usuarios
searchRouter.get('/', verifyToken, validateQuickSearch, handleValidationErrors, handleQuickSearch);

// GET /api/search/recipes — listado de recetas con filtros, orden, despensa y paginación
searchRouter.get('/recipes', verifyToken, validateRecipeListing, handleValidationErrors, handleListRecipes);

// GET /api/search/categories — listado de categorías de receta con filtros y paginación
searchRouter.get('/categories', verifyToken, validateNameOrRecipesListing, handleValidationErrors, handleListCategories);

// GET /api/search/users — listado de usuarios con filtros y paginación
searchRouter.get('/users', verifyToken, validateNameOrRecipesListing, handleValidationErrors, handleListUsers);

export { searchRouter };
