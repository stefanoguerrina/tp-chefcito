// Acceso a datos de la feature Assistant: única capa que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de assistantService.
import prisma from '../../../core/prismaClient.js';

export const assistantRepository = {

  // Devuelve el inventario del usuario con el nombre de cada ingrediente, que es lo único
  // que el bot necesita para sugerir recetas (no hace falta imagen ni ids).
  findInventoryByUser: (idUser: number) =>
    prisma.inventory.findMany({
      where: { idUser },
      select: {
        availableQuantity: true,
        unitOfMeasure: true,
        ingredient: { select: { name: true, unitOfMeasure: true } },
      },
      orderBy: { ingredient: { name: 'asc' } },
    }),

};
