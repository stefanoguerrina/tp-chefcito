// Acceso a datos de la feature user: única capa que habla con Prisma para el CRUD de usuarios.
// No contiene lógica de negocio — eso es responsabilidad de userService.
import prisma from '../../../core/prismaClient.js';
import type { CreateUserData, UpdateUserData } from '../models/userModel.js';

// Include reutilizable para los listados: suma _count.recipe (cantidad de recetas del
// usuario) en la misma consulta, sin traer las recetas en sí.
const withRecipeCount = { _count: { select: { recipe: true } } } as const;

export const userRepository = {

  // Devuelve todos los usuarios activos (sin baja lógica), con cuántas recetas publicó cada uno.
  findAll: () =>
    prisma.user.findMany({ where: { deletedAt: null }, include: withRecipeCount }),

  // Devuelve todos los usuarios con baja lógica (inactivos). También trae la cantidad de
  // recetas: el panel admin la muestra aunque estén ocultas, para dejar claro que no se perdieron.
  findAllDeleted: () =>
    prisma.user.findMany({ where: { deletedAt: { not: null } }, include: withRecipeCount }),

  // Busca un usuario activo por ID.
  findById: (id: number) =>
    prisma.user.findFirst({ where: { id, deletedAt: null } }),

  // Busca un usuario inactivo (dado de baja) por ID.
  findByIdDeleted: (id: number) =>
    prisma.user.findFirst({ where: { id, deletedAt: { not: null } } }),

  // Busca un usuario activo por username (para verificar duplicados al crear).
  findByUsername: (username: string) =>
    prisma.user.findFirst({ where: { username: username.trim(), deletedAt: null } }),

  // Busca un usuario activo por email (para verificar duplicados al crear).
  findByEmail: (email: string) =>
    prisma.user.findFirst({ where: { email: email.trim(), deletedAt: null } }),

  // Crea un nuevo usuario con los datos ya validados y la contraseña hasheada.
  create: (data: CreateUserData) =>
    prisma.user.create({
      data: {
        username: data.username,
        password: data.password,
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ?? null,
        birthDate: data.birthDate ?? null,
      },
    }),

  // Asigna un rol a un usuario recién creado (usado para darle rol admin).
  assignRole: (userId: number, roleId: number) =>
    prisma.userRole.create({ data: { userId, roleId } }),

  // Realiza la baja lógica: setea deletedAt con la fecha actual.
  softDelete: (id: number) =>
    prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }),

  // Revierte la baja lógica: setea deletedAt en null, reactivando al usuario.
  restore: (id: number) =>
    prisma.user.update({ where: { id }, data: { deletedAt: null } }),


  // Actualiza los campos editables del perfil de un usuario.
  update: (id: number, data: UpdateUserData) =>
    prisma.user.update({ where: { id }, data }),

  // Actualiza únicamente la contraseña (recibe el hash, no el texto plano).
  updatePassword: (id: number, hashedPassword: string) =>
    prisma.user.update({ where: { id }, data: { password: hashedPassword } }),

};
