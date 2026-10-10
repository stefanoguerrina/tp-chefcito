// Router de rol — define los endpoints de /api/roles, incluida la gestión de la tabla
// intermedia userrole (asignar/quitar un rol a un usuario). Todo el CRUD es exclusivo de admin,
// ya que la gestión de roles es un recurso sensible del sistema de permisos.
import { Router } from 'express';
import {
  handleSearchRoles,
  handleGetRoleById,
  handleCreateRole,
  handleUpdateRoleById,
  handleDeleteRoleById,
  handleGetUsersByRole,
  handleGetRolesByUserId,
  handleGetAllUserRoles,
  handleAssignRoleToUser,
  handleRemoveRoleFromUser,
} from '../controllers/roleController.js';
import { verifyToken, verifyAdmin } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateRole,
  validateUpdateRole,
  validateRoleId,
  validateUserIdParam,
  validateAssignRole,
  validateUnassignRole,
  handleValidationErrors,
} from '../middleware/roleValidationMiddleware.js';

const roleRouter = Router();

// GET /api/roles — devuelve todos los roles (solo admin)
roleRouter.get('/', verifyToken, verifyAdmin, handleSearchRoles);

// GET /api/roles/users — asignaciones de roles de todos los usuarios, en un solo pedido (solo admin)
roleRouter.get('/users', verifyToken, verifyAdmin, handleGetAllUserRoles);

// GET /api/roles/users/:userId — devuelve los roles asignados a un usuario (solo admin)
roleRouter.get('/users/:userId', verifyToken, verifyAdmin, validateUserIdParam, handleValidationErrors, handleGetRolesByUserId);

// GET /api/roles/:id — devuelve un rol por ID (solo admin)
roleRouter.get('/:id', verifyToken, verifyAdmin, validateRoleId, handleValidationErrors, handleGetRoleById);

// POST /api/roles — crea un rol (solo admin)
roleRouter.post('/', verifyToken, verifyAdmin, validateCreateRole, handleValidationErrors, handleCreateRole);

// PATCH /api/roles/:id — modifica un rol (solo admin)
roleRouter.patch('/:id', verifyToken, verifyAdmin, validateUpdateRole, handleValidationErrors, handleUpdateRoleById);

// DELETE /api/roles/:id — elimina un rol (solo admin)
roleRouter.delete('/:id', verifyToken, verifyAdmin, validateRoleId, handleValidationErrors, handleDeleteRoleById);

// GET /api/roles/:id/users — lista los usuarios que tienen asignado este rol (solo admin)
roleRouter.get('/:id/users', verifyToken, verifyAdmin, validateRoleId, handleValidationErrors, handleGetUsersByRole);

// POST /api/roles/:id/users — asigna este rol a un usuario. Body: { userId } (solo admin)
roleRouter.post('/:id/users', verifyToken, verifyAdmin, validateAssignRole, handleValidationErrors, handleAssignRoleToUser);

// DELETE /api/roles/:id/users/:userId — quita este rol a un usuario (solo admin)
roleRouter.delete('/:id/users/:userId', verifyToken, verifyAdmin, validateUnassignRole, handleValidationErrors, handleRemoveRoleFromUser);

export { roleRouter };
