// Router de receta — define los endpoints de /api/recipes.
// Las lecturas son públicas; crear requiere estar autenticado; modificar o eliminar
// requiere ser el dueño de la receta o admin (chequeado en recipeService, ya que
// el :id de la ruta es el de la receta y no el del usuario).
import { Router } from 'express';
import {
  searchRecipes,
  getRecipeById,
  createRecipe,
  updateRecipeById,
  deleteRecipeById,
} from '../controllers/recipeController.js';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateRecipe,
  validateUpdateRecipe,
  handleValidationErrors,
} from '../middleware/recipeValidationMiddleware.js';
import { stepRouter } from '../../step/routes/stepRouter.js';
import { imageRouter } from '../../image/routes/imageRouter.js';
import { recipeIngredientRouter } from '../../recipeIngredient/routes/recipeIngredientRouter.js';
import { reviewRouter } from '../../review/routes/reviewRouter.js';

const recipeRouter = Router();

// GET /api/recipes — devuelve todas las recetas (opcionalmente ?userId=N)
recipeRouter.get('/', searchRecipes);

// GET /api/recipes/:id — devuelve una receta por ID
recipeRouter.get('/:id', getRecipeById);

// POST /api/recipes — crea una receta para el usuario autenticado
recipeRouter.post(
  '/',
  verifyToken,
  validateCreateRecipe,
  handleValidationErrors,
  createRecipe
);

// PATCH /api/recipes/:id — modifica una receta (solo su dueño o admin)
recipeRouter.patch(
  '/:id',
  verifyToken,
  validateUpdateRecipe,
  handleValidationErrors,
  updateRecipeById
);

// DELETE /api/recipes/:id — elimina una receta (solo su dueño o admin)
recipeRouter.delete('/:id', verifyToken, deleteRecipeById);

// /api/recipes/:idRecipe/steps — reemplazo de la lista de pasos de preparación
recipeRouter.use('/:idRecipe/steps', stepRouter);

// /api/recipes/:idRecipe/images — CRUD de imágenes de la receta
recipeRouter.use('/:idRecipe/images', imageRouter);

// /api/recipes/:idRecipe/ingredients — reemplazo de la lista de ingredientes de la receta
recipeRouter.use('/:idRecipe/ingredients', recipeIngredientRouter);

// /api/recipes/:idRecipe/reviews — CRUD de reseñas de la receta
recipeRouter.use('/:idRecipe/reviews', reviewRouter);

export { recipeRouter };
