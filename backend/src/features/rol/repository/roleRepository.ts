// Acceso a datos de la feature role: única capa que habla con Prisma para el CRUD de roles
// y para el manejo de la tabla intermedia N:M `userrole` (relación user↔role).
// No contiene lógica de negocio — eso es responsabilidad de roleService.
import prisma from '../../../core/prismaClient.js';
import type { CreateRoleData, UpdateRoleData } from '../models/roleModel.js';

export const roleRepository = {

  // Devuelve todos los roles, ordenados por nombre.
  findAll: () =>
    prisma.role.findMany({ orderBy: { name: 'asc' } }),

  // Busca un rol por ID.
  findById: (id: number) =>
    prisma.role.findUnique({ where: { id } }),

  // Busca un rol por nombre (usado para verificar duplicados).
  findByName: (name: string) =>
    prisma.role.findFirst({ where: { name: name.trim() } }),

  // Crea un nuevo rol.
  create: (data: CreateRoleData) =>
    prisma.role.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    }),

  // Actualiza los datos de un rol existente.
  update: (id: number, data: UpdateRoleData) =>
    prisma.role.update({ where: { id }, data }),

  // Elimina un rol. El service la protege antes con countUsers; si igual llegara a
  // ejecutarse con usuarios asociados, los vínculos se borran en cascada
  // (onDelete: Cascade en userrole) sin afectar a los usuarios.
  delete: (id: number) =>
    prisma.role.delete({ where: { id } }),

  // Cuenta cuántos usuarios tienen este rol asignado, vía la tabla intermedia N:M
  // (para validar antes de borrar).
  countUsers: (id: number) =>
    prisma.userRole.count({ where: { roleId: id } }),

  // --- Tabla intermedia userrole (user ↔ role) ---

  // Devuelve el vínculo user↔role si existe (para detectar asignaciones duplicadas).
  findUserRole: (userId: number, roleId: number) =>
    prisma.userRole.findUnique({ where: { userId_roleId: { userId, roleId } } }),

  // Asigna un rol a un usuario (crea la fila en la tabla intermedia).
  assignToUser: (userId: number, roleId: number) =>
    prisma.userRole.create({ data: { userId, roleId } }),

  // Quita un rol de un usuario (borra la fila de la tabla intermedia).
  removeFromUser: (userId: number, roleId: number) =>
    prisma.userRole.delete({ where: { userId_roleId: { userId, roleId } } }),

  // Devuelve los usuarios (activos) que tienen asignado un rol dado.
  findUsersByRole: (roleId: number) =>
    prisma.userRole.findMany({
      where: { roleId, user: { deletedAt: null } },
      include: { user: true },
    }),

  // Devuelve TODAS las asignaciones user↔role con el nombre del rol, en una sola consulta
  // (para la tabla de usuarios del dashboard, que muestra el rol de cada fila).
  findAllUserRoles: () =>
    prisma.userRole.findMany({
      select: { userId: true, role: { select: { id: true, name: true } } },
    }),

  // Devuelve los roles asignados a un usuario dado (para el panel de usuarios).
  findRolesByUser: (userId: number) =>
    prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    }),

};
