// Router de valor nutricional — se monta anidado dentro de ingredientRouter en:
// /api/ingredients/:idIngredient/nutritional-values
// mergeParams: true permite leer :idIngredient, definido en el router padre.
import { Router } from 'express';
import {
  searchNutritionalValuesByIngredient,
  getNutritionalValue,
  createNutritionalValue,
  updateNutritionalValueByNum,
  deleteNutritionalValueByNum,
} from '../controllers/nutritionalValueController.js';
import { verifyToken, verifyAdmin } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateNutritionalValue,
  validateUpdateNutritionalValue,
} from '../middleware/nutritionalValueValidationMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';

const nutritionalValueRouter = Router({ mergeParams: true });

// GET /api/ingredients/:idIngredient/nutritional-values
nutritionalValueRouter.get('/', searchNutritionalValuesByIngredient);

// GET /api/ingredients/:idIngredient/nutritional-values/:num
nutritionalValueRouter.get('/:num', getNutritionalValue);

// POST /api/ingredients/:idIngredient/nutritional-values (solo admin)
nutritionalValueRouter.post(
  '/',
  verifyToken,
  verifyAdmin,
  validateCreateNutritionalValue,
  handleValidationErrors,
  createNutritionalValue
);

// PATCH /api/ingredients/:idIngredient/nutritional-values/:num (solo admin)
nutritionalValueRouter.patch(
  '/:num',
  verifyToken,
  verifyAdmin,
  validateUpdateNutritionalValue,
  handleValidationErrors,
  updateNutritionalValueByNum
);

// DELETE /api/ingredients/:idIngredient/nutritional-values/:num (solo admin)
nutritionalValueRouter.delete('/:num', verifyToken, verifyAdmin, deleteNutritionalValueByNum);

export { nutritionalValueRouter };
