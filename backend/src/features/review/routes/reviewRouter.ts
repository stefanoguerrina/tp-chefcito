// Router de review — define los endpoints de /api/recipes/:idRecipe/reviews.
// Se monta como sub-router del recipeRouter, por lo que req.params.idRecipe
// ya está disponible gracias a { mergeParams: true }.
// Lecturas son públicas; crear, editar y eliminar requieren autenticación.
import { Router } from 'express';
import {
  listReviewsByRecipe,
  createReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateReview,
  validateUpdateReview,
  handleValidationErrors,
} from '../middleware/reviewValidationMiddleware.js';

// mergeParams: true permite acceder a :idRecipe del router padre (recipeRouter).
const reviewRouter = Router({ mergeParams: true });

// GET /api/recipes/:idRecipe/reviews — lista reviews con promedio (público)
reviewRouter.get('/', listReviewsByRecipe);

// POST /api/recipes/:idRecipe/reviews — crea una review (autenticado)
reviewRouter.post(
  '/',
  verifyToken,
  validateCreateReview,
  handleValidationErrors,
  createReview
);

// PATCH /api/recipes/:idRecipe/reviews/:idReview — edita una review (dueño o admin)
reviewRouter.patch(
  '/:idReview',
  verifyToken,
  validateUpdateReview,
  handleValidationErrors,
  updateReview
);

// DELETE /api/recipes/:idRecipe/reviews/:idReview — elimina una review (dueño o admin)
reviewRouter.delete('/:idReview', verifyToken, deleteReview);

export { reviewRouter };
