// Router de categoría — define los endpoints de /api/categories y aplica middlewares de autenticación y validación.
import { Router } from 'express';
import {
  handleSearchCategories,
  handleGetCategoryByName,
  handleCreateCategory,
  handleUpdateCategoryById,
  handleDeleteCategoryById,
} from '../controllers/categoryController.js';
import { verifyToken, verifyAdmin } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
  handleValidationErrors,
} from '../middleware/categoryValidationMiddleware.js';

const categoryRouter = Router();

// GET /api/categories — devuelve todas las categorías existentes (requiere token de usuario)
categoryRouter.get('/', verifyToken, handleSearchCategories);

// GET /api/categories/name/:name — busca una categoría por su nombre exacto (requiere token de usuario)
categoryRouter.get('/name/:name', verifyToken, handleGetCategoryByName);

// POST /api/categories — crea una nueva categoría (solo admin)
categoryRouter.post('/', verifyToken, verifyAdmin, validateCreateCategory, handleValidationErrors, handleCreateCategory);

// PATCH /api/categories/:id — modifica los datos (name, description) de una categoría (solo admin)
categoryRouter.patch('/:id', verifyToken, verifyAdmin, validateUpdateCategory, handleValidationErrors, handleUpdateCategoryById);

// DELETE /api/categories/:id — elimina definitivamente una categoría (solo admin)
categoryRouter.delete('/:id', verifyToken, verifyAdmin, validateCategoryId, handleValidationErrors, handleDeleteCategoryById);

export { categoryRouter };
