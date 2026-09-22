// Router de userRecipe — define los endpoints de /api/recipes/:idRecipe/save.
// Se monta como sub-router del recipeRouter, por lo que req.params.idRecipe
// ya está disponible gracias a { mergeParams: true }.
// Todas las operaciones requieren estar autenticado: el idUser siempre sale del token.
import { Router } from 'express';
import {
  getUserRecipe,
  createUserRecipe,
  updateUserRecipe,
  deleteUserRecipe,
} from '../controllers/userRecipeController.js';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateUserRecipe,
  validateUpdateUserRecipe,
  handleValidationErrors,
} from '../middleware/userRecipeValidationMiddleware.js';

// mergeParams: true permite acceder a :idRecipe del router padre (recipeRouter).
const userRecipeRouter = Router({ mergeParams: true });

// GET /api/recipes/:idRecipe/save — devuelve el estado de guardado del usuario autenticado
userRecipeRouter.get('/', verifyToken, getUserRecipe);

// POST /api/recipes/:idRecipe/save — guarda la receta para el usuario autenticado
userRecipeRouter.post(
  '/',
  verifyToken,
  validateCreateUserRecipe,
  handleValidationErrors,
  createUserRecipe
);

// PATCH /api/recipes/:idRecipe/save — actualiza el estado de guardado (isSaved)
userRecipeRouter.patch(
  '/',
  verifyToken,
  validateUpdateUserRecipe,
  handleValidationErrors,
  updateUserRecipe
);

// DELETE /api/recipes/:idRecipe/save — elimina por completo el registro de guardado
userRecipeRouter.delete('/', verifyToken, deleteUserRecipe);

export { userRecipeRouter };
