// Router de ingrediente — define los endpoints de /api/ingredients.
// Las lecturas son públicas; las escrituras requieren token de administrador.
// Además monta, anidados bajo /:id/nutritional-values, los endpoints de valor nutricional.
import { Router } from 'express';
import {
  handleSearchIngredients,
  handleGetIngredientById,
  handleCreateIngredient,
  handleUpdateIngredientById,
  handleDeleteIngredientById,
  handleUploadIngredientImage,
  handleDeleteIngredientImage,
} from '../controllers/ingredientController.js';
import { verifyToken, verifyAdmin } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateIngredient,
  validateUpdateIngredient,
} from '../middleware/ingredientValidationMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';
import { uploadIngredientImage } from '../middleware/ingredientImageUploadMiddleware.js';
import { nutritionalValueRouter } from '../../nutritionalValue/routes/nutritionalValueRouter.js';

const ingredientRouter = Router();

// GET /api/ingredients — devuelve todos los ingredientes con su categoría
ingredientRouter.get('/', handleSearchIngredients);

// GET /api/ingredients/:id — devuelve un ingrediente por ID
ingredientRouter.get('/:id', handleGetIngredientById);

// POST /api/ingredients — crea un ingrediente (solo admin)
ingredientRouter.post(
  '/',
  verifyToken,
  verifyAdmin,
  validateCreateIngredient,
  handleValidationErrors,
  handleCreateIngredient
);

// PATCH /api/ingredients/:id — modifica un ingrediente (solo admin)
ingredientRouter.patch(
  '/:id',
  verifyToken,
  verifyAdmin,
  validateUpdateIngredient,
  handleValidationErrors,
  handleUpdateIngredientById
);

// DELETE /api/ingredients/:id — elimina un ingrediente (solo admin)
ingredientRouter.delete('/:id', verifyToken, verifyAdmin, handleDeleteIngredientById);

// Foto del ingrediente: una sola por ingrediente, subida como archivo (multipart, campo
// "image") y guardada en backend/uploads/ingredients/. Reemplazarla o quitarla borra el
// archivo anterior del disco. Solo admin.
// PATCH  /api/ingredients/:id/image — sube o reemplaza la foto
// DELETE /api/ingredients/:id/image — quita la foto
ingredientRouter.patch('/:id/image', verifyToken, verifyAdmin, uploadIngredientImage, handleUploadIngredientImage);
ingredientRouter.delete('/:id/image', verifyToken, verifyAdmin, handleDeleteIngredientImage);

// /api/ingredients/:idIngredient/nutritional-values — CRUD dependiente de valores nutricionales
ingredientRouter.use('/:idIngredient/nutritional-values', nutritionalValueRouter);

export { ingredientRouter };
