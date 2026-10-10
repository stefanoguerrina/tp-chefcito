// Router de image — se monta anidado dentro de recipeRouter en:
// /api/recipes/:idRecipe/images
// mergeParams: true permite leer :idRecipe, definido en el router padre.
import { Router } from 'express';
import {
  handleSearchImagesByRecipe,
  handleCreateImage,
  handleUpdateImageById,
  handleDeleteImageById,
} from '../controllers/imageController.js';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateImage,
  validateUpdateImage,
  handleValidationErrors,
} from '../middleware/imageValidationMiddleware.js';
import { uploadRecipeImage } from '../middleware/imageUploadMiddleware.js';

const imageRouter = Router({ mergeParams: true });

// GET /api/recipes/:idRecipe/images — devuelve las imágenes de la receta (lectura pública)
imageRouter.get('/', handleSearchImagesByRecipe);

// POST /api/recipes/:idRecipe/images — agrega una imagen (solo dueño o admin).
// Acepta un archivo (multipart, campo "image") o un link externo (JSON, campo imageUrl).
imageRouter.post('/', verifyToken, uploadRecipeImage, validateCreateImage, handleValidationErrors, handleCreateImage);

// PATCH /api/recipes/:idRecipe/images/:id — modifica una imagen (solo dueño o admin)
imageRouter.patch('/:id', verifyToken, uploadRecipeImage, validateUpdateImage, handleValidationErrors, handleUpdateImageById);

// DELETE /api/recipes/:idRecipe/images/:id — elimina una imagen (solo dueño o admin)
imageRouter.delete('/:id', verifyToken, handleDeleteImageById);

export { imageRouter };
