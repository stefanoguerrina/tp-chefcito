// Acceso a datos de la feature image: única capa que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de imageService.
// La clave primaria de image es compuesta: (idRecipe, id).
import prisma from '../../../core/prismaClient.js';
import type { Prisma } from '@prisma/client';
import type { CreateImageData, UpdateImageData } from '../models/imageModel.js';

export const imageRepository = {

  // Devuelve todas las imágenes de una receta, la principal primero.
  findAllByRecipe: (idRecipe: number) =>
    prisma.image.findMany({
      where: { idRecipe },
      orderBy: [{ isMain: 'desc' }, { id: 'asc' }],
    }),

  // Busca una imagen puntual por su clave compuesta.
  findOne: (idRecipe: number, id: number) =>
    prisma.image.findUnique({ where: { idRecipe_id: { idRecipe, id } } }),

  // Busca la receta padre (solo el campo idUser, para chequear propiedad sin traer todo).
  findRecipeOwner: (idRecipe: number) =>
    prisma.recipe.findUnique({ where: { id: idRecipe }, select: { idUser: true } }),

  // Calcula el próximo id de imagen dentro de la receta (1 si es la primera).
  getNextId: async (idRecipe: number): Promise<number> => {
    const last = await prisma.image.findFirst({ where: { idRecipe }, orderBy: { id: 'desc' } });
    return (last?.id ?? 0) + 1;
  },

  // Agrega una imagen a la receta. Si se marca isMain, primero desmarca
  // cualquier otra imagen principal existente (solo puede haber una a la vez).
  create: (idRecipe: number, data: CreateImageData) =>
    prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (data.isMain) {
        await tx.image.updateMany({ where: { idRecipe, isMain: true }, data: { isMain: false } });
      }
      const last = await tx.image.findFirst({ where: { idRecipe }, orderBy: { id: 'desc' } });
      const id = (last?.id ?? 0) + 1;
      return tx.image.create({
        data: { idRecipe, id, imageUrl: data.imageUrl, isMain: data.isMain ?? false },
      });
    }),

  // Actualiza una imagen existente. Si se marca isMain, desmarca cualquier
  // otra imagen principal de la misma receta antes de aplicar el cambio.
  update: (idRecipe: number, id: number, data: UpdateImageData) =>
    prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (data.isMain) {
        await tx.image.updateMany({
          where: { idRecipe, isMain: true, id: { not: id } },
          data: { isMain: false },
        });
      }
      return tx.image.update({ where: { idRecipe_id: { idRecipe, id } }, data });
    }),

  // Elimina una imagen puntual.
  delete: (idRecipe: number, id: number) =>
    prisma.image.delete({ where: { idRecipe_id: { idRecipe, id } } }),

};
