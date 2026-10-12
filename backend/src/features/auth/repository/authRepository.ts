// Acceso a datos de la feature auth: única capa que habla con Prisma para login/registro.
// No contiene lógica de negocio — eso es responsabilidad de authService.
import prisma from '../../../core/prismaClient.js';

export const authRepository = {

  // Busca un usuario activo por email o username (usado en login).
  findByEmailOrUsername: (identifier: string) => {
    const clean = identifier.trim();
    return prisma.user.findFirst({
      where: { OR: [{ email: clean }, { username: clean }], deletedAt: null },
    });
  },

  // Busca un usuario activo por email (usado para verificar duplicados en registro).
  findByEmail: (email: string) =>
    prisma.user.findFirst({ where: { email: email.trim(), deletedAt: null } }),

  // Busca un usuario activo por username (usado para verificar duplicados en registro).
  findByUsername: (username: string) =>
    prisma.user.findFirst({ where: { username: username.trim(), deletedAt: null } }),

  // Crea un nuevo usuario (usado en registro). La contraseña ya viene hasheada.
  create: (data: {
    username: string;
    password: string;
    name: string;
    lastName: string;
    email: string;
    phone: string | null;
    birthDate?: Date | null;
  }) => prisma.user.create({ data }),

  // Devuelve los IDs de los roles asignados al usuario (usado para detectar admins).
  getUserRoleIds: async (userId: number): Promise<number[]> => {
    const rows = await prisma.userRole.findMany({
      where: { userId },
      select: { roleId: true },
    });
    return rows.map((r: { roleId: number }) => r.roleId);
  },

};
