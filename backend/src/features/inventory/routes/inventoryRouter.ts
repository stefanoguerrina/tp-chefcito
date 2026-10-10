// Router de inventory — define los endpoints de /api/users/:userId/inventory.
// Todos los endpoints requieren token; además verifican que el usuario autenticado
// sea el dueño del recurso o un administrador.
import { Router } from 'express';
import { verifyToken, verifyOwnerOrAdminOf } from '../../../core/middleware/authMiddleware.js';
import {
  handleGetInventory,
  handleAddToInventory,
  handleUpdateInventoryItem,
  handleRemoveFromInventory,
} from '../controllers/inventoryController.js';
import {
  validateAddInventory,
  validateUpdateInventory,
} from '../middleware/inventoryValidationMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';

const inventoryRouter = Router({ mergeParams: true });

// El parámetro de estas rutas es :userId (no :id), por eso se arma el chequeo para ese nombre.
const verifyInventoryOwnerOrAdmin = verifyOwnerOrAdminOf(
  'userId',
  'Acceso denegado. Solo podés ver y modificar tu propio inventario.'
);

// GET /api/users/:userId/inventory — obtiene el inventario completo del usuario
inventoryRouter.get('/', verifyToken, verifyInventoryOwnerOrAdmin, handleGetInventory);

// POST /api/users/:userId/inventory — agrega un ingrediente al inventario
// Devuelve 409 si el ingrediente ya está en el inventario (con datos actuales para el modal)
inventoryRouter.post(
  '/',
  verifyToken,
  verifyInventoryOwnerOrAdmin,
  validateAddInventory,
  handleValidationErrors,
  handleAddToInventory
);

// PATCH /api/users/:userId/inventory/:ingredientId — actualiza cantidad/unidad de un ítem
inventoryRouter.patch(
  '/:ingredientId',
  verifyToken,
  verifyInventoryOwnerOrAdmin,
  validateUpdateInventory,
  handleValidationErrors,
  handleUpdateInventoryItem
);

// DELETE /api/users/:userId/inventory/:ingredientId — elimina un ítem del inventario
inventoryRouter.delete(
  '/:ingredientId',
  verifyToken,
  verifyInventoryOwnerOrAdmin,
  handleRemoveFromInventory
);

export { inventoryRouter };
