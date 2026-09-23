// Controller de usuario — maneja las rutas GET, POST, PATCH y DELETE de /api/users.
// Delega toda la lógica de negocio al userService; solo se encarga de leer la request
// y armar la response HTTP correcta.
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as userService from '../services/userService.js';
import { toPublicProfile } from '../models/userModel.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';

// Devuelve la lista de usuarios sin sus contraseñas.
// Cualquier usuario autenticado puede consultar los activos.
// Con ?inactive=true devuelve usuarios dados de baja (solo admins).
// GET /api/users
export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const showInactive = req.query.inactive === 'true';

    // Solo un admin puede ver los usuarios inactivos.
    if (showInactive && !req.user?.isAdmin) {
      res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
      return;
    }

    const users = showInactive
      ? await userService.getDeletedUsers()
      : await userService.getAllUsers();

    if (!users || users.length === 0) {
      res.status(404).json({ message: 'No se encontraron usuarios.' });
      return;
    }
    res.status(200).json(users);
  } catch (error) {
    console.error('[searchUsers] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Devuelve un usuario activo por su ID sin su contraseña.
// Cualquier usuario autenticado puede consultar el perfil público de cualquier
// otro (ver ProfilePage: tocar el nombre del creador de una receta abre su
// perfil de solo lectura) — pero solo ve los campos públicos (toPublicProfile).
// El propio usuario o un admin ven además los campos privados (email, phone, birthDate).
// GET /api/users/:id
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ message: 'El ID de usuario no es válido.' });
      return;
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    const isOwnerOrAdmin = req.user?.id === userId || req.user?.isAdmin === true;
    res.status(200).json(isOwnerOrAdmin ? user : toPublicProfile(user));
  } catch (error) {
    console.error('[getUserById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Crea un nuevo usuario desde el panel de administración.
// Permite opcionalmente asignarle el rol admin (makeAdmin=true).
// POST /api/users
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Error de validación.',
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? (e as any).path : 'general', mensaje: e.msg })),
    });
    return;
  }

  try {
    const { username, password, name, lastName, email, phone, birthDate, makeAdmin } = req.body;

    const result = await userService.createUserByAdmin({
      username,
      password,
      name,
      lastName,
      email,
      phone: phone ?? null,
      birthDate: birthDate ? new Date(birthDate) : null,
      makeAdmin: makeAdmin === true,
    });

    if (!result.ok) {
      if (result.reason === 'username_taken') {
        res.status(409).json({ message: 'El nombre de usuario ya está en uso.' });
        return;
      }
      if (result.reason === 'email_taken') {
        res.status(409).json({ message: 'El email ingresado ya está registrado.' });
        return;
      }
    }

    res.status(201).json(result.ok ? result.user : {});
  } catch (error) {
    console.error('[createUser] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Realiza la baja lógica de un usuario por ID (setea deletedAt, no borra el registro).
// Recibe el ID como parámetro en la URL.
// Devuelve 200 con los datos del usuario dado de baja, 404 si no existe, 400 si el ID es inválido.
// DELETE /api/users/:id
export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ message: 'El ID de usuario no es válido.' });
      return;
    }

    const deletedUser = await userService.softDeleteUser(userId);
    if (!deletedUser) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    res.status(200).json(deletedUser);
  } catch (error) {
    console.error('[deleteUserById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualiza los datos editables de un usuario (name, lastName, phone, avatarUrl, birthDate).
// Solo el propio usuario o un admin puede realizar esta acción (controlado por verifyOwnerOrAdmin).
// Devuelve 200 con los datos actualizados, 404 si no existe, 422 si los datos son inválidos.
// PATCH /api/users/:id
export const updateUserById = async (req: Request, res: Response): Promise<void> => {
  // Los errores de validación ya fueron chequeados por el middleware, pero como
  // buena práctica siempre se verifica en el controller también.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Error de validación.',
      errors: errors.array(),
    });
    return;
  }

  try {
    const userId = Number(req.params.id);
    const { name, lastName, phone, avatarUrl, bio, specialty, location, birthDate } = req.body;

    const updated = await userService.updateUser(userId, {
      name,
      lastName,
      phone,
      avatarUrl,
      bio,
      specialty,
      location,
      birthDate: birthDate !== undefined ? (birthDate ? new Date(birthDate) : null) : undefined,
    });
    if (!updated) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('[updateUserById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Cambia la contraseña de un usuario, verificando primero la contraseña actual.
// Solo el propio usuario o un admin puede realizar esta acción (controlado por verifyOwnerOrAdmin).
// Body: { currentPassword, newPassword }
// PATCH /api/users/:id/password
export const changeUserPassword = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Error de validación.',
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? (e as any).path : 'general', mensaje: e.msg })),
    });
    return;
  }

  try {
    const userId = Number(req.params.id);
    const { currentPassword, newPassword } = req.body;

    const result = await userService.changePassword(userId, currentPassword, newPassword);

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Usuario no encontrado.' });
        return;
      }
      // La contraseña actual no coincide con la almacenada.
      res.status(401).json({ message: 'La contraseña actual ingresada es incorrecta.' });
      return;
    }

    res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('[changeUserPassword] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Reactiva (da de alta) a un usuario que tenía baja lógica.
// Solo un administrador puede realizar esta acción.
// Devuelve 200 con los datos del usuario reactivado, 404 si no existía como inactivo.
// PATCH /api/users/:id/restore
export const restoreUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId) || userId <= 0) {
      res.status(400).json({ message: 'El ID de usuario no es válido.' });
      return;
    }

    const restoredUser = await userService.restoreUser(userId);
    if (!restoredUser) {
      res.status(404).json({ message: 'Usuario inactivo no encontrado.' });
      return;
    }

    res.status(200).json(restoredUser);
  } catch (error) {
    console.error('[restoreUserById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
