// Router de step — se monta anidado dentro de recipeRouter en:
// /api/recipes/:idRecipe/steps
// mergeParams: true permite leer :idRecipe, definido en el router padre.
import { Router } from 'express';
import { handleSearchStepsByRecipe, handleReplaceStepsForRecipe } from '../controllers/stepController.js';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import { validateReplaceSteps, handleValidationErrors } from '../middleware/stepValidationMiddleware.js';

const stepRouter = Router({ mergeParams: true });

// GET /api/recipes/:idRecipe/steps — devuelve los pasos de la receta (lectura pública)
stepRouter.get('/', handleSearchStepsByRecipe);

// PUT /api/recipes/:idRecipe/steps — reemplaza la lista completa de pasos (solo dueño o admin)
stepRouter.put('/', verifyToken, validateReplaceSteps, handleValidationErrors, handleReplaceStepsForRecipe);

export { stepRouter };
