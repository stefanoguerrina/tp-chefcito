// Router de inventory — define los endpoints de /api/users/:userId/inventory.
// Todos los endpoints requieren token; además verifican que el usuario autenticado
// sea el dueño del recurso o un administrador.
import { Router, Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';
import {
  getInventory,
  addToInventory,
  updateInventoryItem,
  removeFromInventory,
} from '../controllers/inventoryController.js';
import {
  validateAddInventory,
  validateUpdateInventory,
  handleValidationErrors,
} from '../middleware/inventoryValidationMiddleware.js';

const inventoryRouter = Router({ mergeParams: true });

// Middleware inline equivalente a verifyOwnerOrAdmin pero para el parámetro :userId.
// El authMiddleware genérico usa :id; aquí el parámetro es :userId, así que
// se implementa localmente para no modificar el middleware compartido de otros devs.
const verifyInventoryOwnerOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthRequest;
  const requestedUserId = Number(req.params.userId);

  if (!authReq.user) {
    res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    return;
  }

  if (authReq.user.isAdmin || authReq.user.id === requestedUserId) {
    next();
    return;
  }

  res.status(403).json({ message: 'Acceso denegado. Solo podés ver y modificar tu propio inventario.' });
};

// GET /api/users/:userId/inventory — obtiene el inventario completo del usuario
inventoryRouter.get('/', verifyToken, verifyInventoryOwnerOrAdmin, getInventory);

// POST /api/users/:userId/inventory — agrega un ingrediente al inventario
// Devuelve 409 si el ingrediente ya está en el inventario (con datos actuales para el modal)
inventoryRouter.post(
  '/',
  verifyToken,
  verifyInventoryOwnerOrAdmin,
  validateAddInventory,
  handleValidationErrors,
  addToInventory
);

// PATCH /api/users/:userId/inventory/:ingredientId — actualiza cantidad/unidad de un ítem
inventoryRouter.patch(
  '/:ingredientId',
  verifyToken,
  verifyInventoryOwnerOrAdmin,
  validateUpdateInventory,
  handleValidationErrors,
  updateInventoryItem
);

// DELETE /api/users/:userId/inventory/:ingredientId — elimina un ítem del inventario
inventoryRouter.delete(
  '/:ingredientId',
  verifyToken,
  verifyInventoryOwnerOrAdmin,
  removeFromInventory
);

export { inventoryRouter };
