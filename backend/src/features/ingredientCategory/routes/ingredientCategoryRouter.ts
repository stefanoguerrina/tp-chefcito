// Router de categoría de ingrediente — define los endpoints de /api/ingredient-categories.
// Las lecturas son públicas; las escrituras requieren token de administrador.
import { Router } from 'express';
import {
  searchIngredientCategories,
  getIngredientCategoryById,
  createIngredientCategory,
  updateIngredientCategoryById,
  deleteIngredientCategoryById,
} from '../controllers/ingredientCategoryController.js';
import { verifyToken, verifyAdmin } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateIngredientCategory,
  validateUpdateIngredientCategory,
} from '../middleware/ingredientCategoryValidationMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';

const ingredientCategoryRouter = Router();

// GET /api/ingredient-categories — devuelve todas las categorías de ingrediente
ingredientCategoryRouter.get('/', searchIngredientCategories);

// GET /api/ingredient-categories/:id — devuelve una categoría por ID
ingredientCategoryRouter.get('/:id', getIngredientCategoryById);

// POST /api/ingredient-categories — crea una categoría (solo admin)
ingredientCategoryRouter.post(
  '/',
  verifyToken,
  verifyAdmin,
  validateCreateIngredientCategory,
  handleValidationErrors,
  createIngredientCategory
);

// PATCH /api/ingredient-categories/:id — modifica una categoría (solo admin)
ingredientCategoryRouter.patch(
  '/:id',
  verifyToken,
  verifyAdmin,
  validateUpdateIngredientCategory,
  handleValidationErrors,
  updateIngredientCategoryById
);

// DELETE /api/ingredient-categories/:id — elimina una categoría (solo admin)
ingredientCategoryRouter.delete('/:id', verifyToken, verifyAdmin, deleteIngredientCategoryById);

export { ingredientCategoryRouter };
