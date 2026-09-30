// Controller de rol — maneja las rutas de /api/roles, incluida la asignación/desasignación
// de roles a usuarios (tabla intermedia userrole).
// Delega toda la lógica de negocio al roleService; solo se encarga de leer la request
// y armar la response HTTP correcta.
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as roleService from '../services/roleService.js';

// Devuelve la lista de todos los roles.
// GET /api/roles
export const searchRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await roleService.getAllRoles();
    if (!roles || roles.length === 0) {
      res.status(404).json({ message: 'No se encontraron roles.' });
      return;
    }
    res.status(200).json(roles);
  } catch (error) {
    console.error('[searchRoles] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Devuelve un rol por ID.
// GET /api/roles/:id
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const role = await roleService.getRoleById(id);
    if (!role) {
      res.status(404).json({ message: 'Rol no encontrado.' });
      return;
    }

    res.status(200).json(role);
  } catch (error) {
    console.error('[getRoleById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Crea un nuevo rol.
// POST /api/roles
export const createRole = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Error de validación.',
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? (e as any).path : 'general', mensaje: e.msg })),
    });
    return;
  }

  try {
    const { name, description } = req.body;
    const result = await roleService.createRole({ name, description });

    if (!result.ok) {
      res.status(409).json({ message: 'Ya existe un rol con ese nombre.' });
      return;
    }

    res.status(201).json(result.role);
  } catch (error) {
    console.error('[createRole] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualiza un rol existente.
// PATCH /api/roles/:id
export const updateRoleById = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Error de validación.',
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? (e as any).path : 'general', mensaje: e.msg })),
    });
    return;
  }

  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    const updated = await roleService.updateRole(id, { name, description });
    if (!updated) {
      res.status(404).json({ message: 'Rol no encontrado.' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('[updateRoleById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Elimina un rol por ID.
// DELETE /api/roles/:id
export const deleteRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const result = await roleService.deleteRole(id);

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Rol no encontrado.' });
        return;
      }
      if (result.reason === 'is_admin_role') {
        res.status(409).json({ message: 'No se puede eliminar el rol de administrador.' });
        return;
      }
      res.status(409).json({ message: 'No se puede eliminar: el rol tiene usuarios asociados.' });
      return;
    }

    res.status(200).json({ message: 'Rol eliminado correctamente.' });
  } catch (error) {
    console.error('[deleteRoleById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Devuelve los usuarios que tienen asignado un rol (lectura de la tabla intermedia userrole).
// GET /api/roles/:id/users
export const getUsersByRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleId = Number(req.params.id);

    const users = await roleService.getUsersByRole(roleId);
    if (users === null) {
      res.status(404).json({ message: 'Rol no encontrado.' });
      return;
    }
    if (users.length === 0) {
      res.status(404).json({ message: 'Ningún usuario tiene asignado este rol.' });
      return;
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('[getUsersByRole] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Devuelve las asignaciones de roles de todos los usuarios en un solo pedido (para la
// columna "Rol" del dashboard, sin pedir los roles usuario por usuario).
// GET /api/roles/users
export const getAllUserRoles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const userRoles = await roleService.getAllUserRoles();
    res.status(200).json(userRoles);
  } catch (error) {
    console.error('[getAllUserRoles] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Devuelve los roles asignados a un usuario dado (para el panel de administración de usuarios).
// GET /api/roles/users/:userId
export const getRolesByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.userId);

    const roles = await roleService.getRolesByUser(userId);
    if (roles === null) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    res.status(200).json(roles);
  } catch (error) {
    console.error('[getRolesByUserId] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Asigna un rol a un usuario (crea el vínculo en la tabla intermedia userrole).
// Body: { userId }
// POST /api/roles/:id/users
export const assignRoleToUser = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Error de validación.',
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? (e as any).path : 'general', mensaje: e.msg })),
    });
    return;
  }

  try {
    const roleId = Number(req.params.id);
    const userId = Number(req.body.userId);

    const result = await roleService.assignRoleToUser(roleId, userId);

    if (!result.ok) {
      if (result.reason === 'role_not_found') {
        res.status(404).json({ message: 'Rol no encontrado.' });
        return;
      }
      if (result.reason === 'user_not_found') {
        res.status(404).json({ message: 'Usuario no encontrado.' });
        return;
      }
      res.status(409).json({ message: 'El usuario ya tiene asignado este rol.' });
      return;
    }

    res.status(201).json({ message: 'Rol asignado correctamente al usuario.' });
  } catch (error) {
    console.error('[assignRoleToUser] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Quita un rol de un usuario (elimina el vínculo en la tabla intermedia userrole).
// DELETE /api/roles/:id/users/:userId
export const removeRoleFromUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleId = Number(req.params.id);
    const userId = Number(req.params.userId);

    const result = await roleService.removeRoleFromUser(roleId, userId);

    if (!result.ok) {
      res.status(404).json({ message: 'El usuario no tiene asignado este rol.' });
      return;
    }

    res.status(200).json({ message: 'Rol quitado correctamente al usuario.' });
  } catch (error) {
    console.error('[removeRoleFromUser] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
