// Router de usuario — define los endpoints de /api/users y aplica middlewares de autenticación y validación.
import { Router } from 'express';
import {
  searchUsers,
  getUserById,
  createUser,
  deleteUserById,
  restoreUserById,
  updateUserById,
  changeUserPassword,
  uploadUserImageHandler,
  deleteUserImageHandler,
} from '../controllers/userController.js';
import { verifyToken, verifyAdmin, verifyOwnerOrAdmin } from '../../../core/middleware/authMiddleware.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateChangePassword,
} from '../middleware/userValidationMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';
import { uploadUserImage } from '../middleware/userImageUploadMiddleware.js';

const userRouter = Router();

// GET /api/users — devuelve todos los usuarios activos (cualquier usuario autenticado)
// Con ?inactive=true devuelve usuarios dados de baja (solo admin)
userRouter.get('/', verifyToken, searchUsers);

// GET /api/users/:id — devuelve un usuario activo por ID. Cualquier usuario autenticado
// puede consultar el perfil público de cualquier otro (ver ProfilePage); el controller
// decide qué campos devolver según si es el propio dueño/admin o no (toPublicProfile).
userRouter.get('/:id', verifyToken, getUserById);

// POST /api/users — crea un nuevo usuario (solo admin, puede asignar rol admin con makeAdmin=true)
userRouter.post('/', verifyToken, verifyAdmin, validateCreateUser, handleValidationErrors, createUser);

// DELETE /api/users/:id — baja lógica de usuario (el propio usuario o admin)
userRouter.delete('/:id', verifyToken, verifyOwnerOrAdmin, deleteUserById);

// PATCH /api/users/:id/restore — reactiva a un usuario dado de baja (solo admin)
userRouter.patch('/:id/restore', verifyToken, verifyAdmin, restoreUserById);

// PATCH /api/users/:id — modifica datos del usuario (el propio usuario o admin)
userRouter.patch('/:id', verifyToken, verifyOwnerOrAdmin, validateUpdateUser, handleValidationErrors, updateUserById);

// PATCH /api/users/:id/password — cambia la contraseña del usuario (el propio usuario o admin)
userRouter.patch('/:id/password', verifyToken, verifyOwnerOrAdmin, validateChangePassword, handleValidationErrors, changeUserPassword);

// Fotos del perfil: una sola de cada una por usuario, subida como archivo (multipart,
// campo "image") y guardada en backend/uploads/users/. Reemplazar o quitar una foto borra
// el archivo anterior del disco. Solo el propio usuario o un admin.
// PATCH  /api/users/:id/avatar — sube o reemplaza la foto de perfil
// DELETE /api/users/:id/avatar — quita la foto de perfil
// PATCH  /api/users/:id/cover  — sube o reemplaza la foto de portada
// DELETE /api/users/:id/cover  — quita la foto de portada
userRouter.patch('/:id/avatar', verifyToken, verifyOwnerOrAdmin, uploadUserImage, uploadUserImageHandler('avatarUrl'));
userRouter.delete('/:id/avatar', verifyToken, verifyOwnerOrAdmin, deleteUserImageHandler('avatarUrl'));
userRouter.patch('/:id/cover', verifyToken, verifyOwnerOrAdmin, uploadUserImage, uploadUserImageHandler('coverUrl'));
userRouter.delete('/:id/cover', verifyToken, verifyOwnerOrAdmin, deleteUserImageHandler('coverUrl'));

export { userRouter };
