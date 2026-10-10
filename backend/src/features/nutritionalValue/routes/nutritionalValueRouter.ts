// Router de valor nutricional — se monta anidado dentro de ingredientRouter en:
// /api/ingredients/:idIngredient/nutritional-values
// mergeParams: true permite leer :idIngredient, definido en el router padre.
import { Router } from 'express';
import {
  handleSearchNutritionalValuesByIngredient,
  handleGetNutritionalValue,
  handleCreateNutritionalValue,
  handleUpdateNutritionalValueByNum,
  handleDeleteNutritionalValueByNum,
} from '../controllers/nutritionalValueController.js';
import { verifyToken, verifyAdmin } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateNutritionalValue,
  validateUpdateNutritionalValue,
  handleValidationErrors,
} from '../middleware/nutritionalValueValidationMiddleware.js';

const nutritionalValueRouter = Router({ mergeParams: true });

// GET /api/ingredients/:idIngredient/nutritional-values
nutritionalValueRouter.get('/', handleSearchNutritionalValuesByIngredient);

// GET /api/ingredients/:idIngredient/nutritional-values/:num
nutritionalValueRouter.get('/:num', handleGetNutritionalValue);

// POST /api/ingredients/:idIngredient/nutritional-values (solo admin)
nutritionalValueRouter.post(
  '/',
  verifyToken,
  verifyAdmin,
  validateCreateNutritionalValue,
  handleValidationErrors,
  handleCreateNutritionalValue
);

// PATCH /api/ingredients/:idIngredient/nutritional-values/:num (solo admin)
nutritionalValueRouter.patch(
  '/:num',
  verifyToken,
  verifyAdmin,
  validateUpdateNutritionalValue,
  handleValidationErrors,
  handleUpdateNutritionalValueByNum
);

// DELETE /api/ingredients/:idIngredient/nutritional-values/:num (solo admin)
nutritionalValueRouter.delete('/:num', verifyToken, verifyAdmin, handleDeleteNutritionalValueByNum);

export { nutritionalValueRouter };
