// Router de categoría — define los endpoints de /api/categories y aplica middlewares de autenticación y validación.
import { Router } from 'express';
import {
  searchCategories,
  getCategoryByName,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
} from '../controllers/categoryController.js';
import { verifyToken, verifyAdmin } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
} from '../middleware/categoryValidationMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';

const categoryRouter = Router();

// GET /api/categories — devuelve todas las categorías existentes (requiere token de usuario)
categoryRouter.get('/', verifyToken, searchCategories);

// GET /api/categories/name/:name — busca una categoría por su nombre exacto (requiere token de usuario)
categoryRouter.get('/name/:name', verifyToken, getCategoryByName);

// POST /api/categories — crea una nueva categoría (solo admin)
categoryRouter.post('/', verifyToken, verifyAdmin, validateCreateCategory, handleValidationErrors, createCategory);

// PATCH /api/categories/:id — modifica los datos (name, description) de una categoría (solo admin)
categoryRouter.patch('/:id', verifyToken, verifyAdmin, validateUpdateCategory, handleValidationErrors, updateCategoryById);

// DELETE /api/categories/:id — elimina definitivamente una categoría (solo admin)
categoryRouter.delete('/:id', verifyToken, verifyAdmin, validateCategoryId, handleValidationErrors, deleteCategoryById);

export { categoryRouter };
