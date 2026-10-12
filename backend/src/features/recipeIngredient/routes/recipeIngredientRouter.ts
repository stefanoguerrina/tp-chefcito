// Router de recipeIngredient — se monta anidado dentro de recipeRouter en:
// /api/recipes/:idRecipe/ingredients
// mergeParams: true permite leer :idRecipe, definido en el router padre.
import { Router } from 'express';
import {
  handleSearchRecipeIngredientsByRecipe,
  handleReplaceRecipeIngredientsForRecipe,
} from '../controllers/recipeIngredientController.js';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import {
  validateReplaceRecipeIngredients,
} from '../middleware/recipeIngredientValidationMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';

const recipeIngredientRouter = Router({ mergeParams: true });

// GET /api/recipes/:idRecipe/ingredients — devuelve los ingredientes de la receta (lectura pública)
recipeIngredientRouter.get('/', handleSearchRecipeIngredientsByRecipe);

// PUT /api/recipes/:idRecipe/ingredients — reemplaza la lista completa de ingredientes (solo dueño o admin)
recipeIngredientRouter.put(
  '/',
  verifyToken,
  validateReplaceRecipeIngredients,
  handleValidationErrors,
  handleReplaceRecipeIngredientsForRecipe
);

export { recipeIngredientRouter };
