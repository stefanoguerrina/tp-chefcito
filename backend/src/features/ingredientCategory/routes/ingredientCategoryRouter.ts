// Router de categoría de ingrediente — define los endpoints de /api/ingredient-categories.
// Las lecturas son públicas; las escrituras requieren token de administrador.
import { Router } from 'express';
import {
  handleSearchIngredientCategories,
  handleGetIngredientCategoryById,
  handleCreateIngredientCategory,
  handleUpdateIngredientCategoryById,
  handleDeleteIngredientCategoryById,
} from '../controllers/ingredientCategoryController.js';
import { verifyToken, verifyAdmin } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateIngredientCategory,
  validateUpdateIngredientCategory,
  handleValidationErrors,
} from '../middleware/ingredientCategoryValidationMiddleware.js';

const ingredientCategoryRouter = Router();

// GET /api/ingredient-categories — devuelve todas las categorías de ingrediente
ingredientCategoryRouter.get('/', handleSearchIngredientCategories);

// GET /api/ingredient-categories/:id — devuelve una categoría por ID
ingredientCategoryRouter.get('/:id', handleGetIngredientCategoryById);

// POST /api/ingredient-categories — crea una categoría (solo admin)
ingredientCategoryRouter.post(
  '/',
  verifyToken,
  verifyAdmin,
  validateCreateIngredientCategory,
  handleValidationErrors,
  handleCreateIngredientCategory
);

// PATCH /api/ingredient-categories/:id — modifica una categoría (solo admin)
ingredientCategoryRouter.patch(
  '/:id',
  verifyToken,
  verifyAdmin,
  validateUpdateIngredientCategory,
  handleValidationErrors,
  handleUpdateIngredientCategoryById
);

// DELETE /api/ingredient-categories/:id — elimina una categoría (solo admin)
ingredientCategoryRouter.delete('/:id', verifyToken, verifyAdmin, handleDeleteIngredientCategoryById);

export { ingredientCategoryRouter };
