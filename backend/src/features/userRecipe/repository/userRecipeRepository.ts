// Acceso a datos de la feature userRecipe: única capa que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de userRecipeService.
//
// Particularidades del modelo:
//   - La PK de userrecipe es compuesta: (idUser, idRecipe).
//   - review tiene FK a userrecipe(idUser, idRecipe) con onDelete: Cascade, por lo
//     que eliminar un registro userrecipe borra también las reviews que dependen de él.
import prisma from '../../../core/prismaClient.js';
import type { CreateUserRecipeData, UpdateUserRecipeData } from '../models/userRecipeModel.js';

// Include reutilizable: trae los datos básicos de la receta guardada y su creador.
const withRecipe = {
  recipe: {
    include: {
      user: { select: { id: true, username: true, name: true, lastName: true, avatarUrl: true } },
      image: true,
      recipecategory: { include: { category: true } },
    },
  },
} as const;

export const userRecipeRepository = {

  // Devuelve todas las recetas guardadas (isSaved: true) por un usuario, ordenadas por fecha de guardado.
  findAllByUser: (idUser: number) =>
    prisma.userrecipe.findMany({
      where: { idUser, isSaved: true },
      include: withRecipe,
      orderBy: { savedAt: 'desc' },
    }),

  // Busca el registro userrecipe de un usuario para una receta puntual.
  findOne: (idUser: number, idRecipe: number) =>
    prisma.userrecipe.findUnique({
      where: { idUser_idRecipe: { idUser, idRecipe } },
      include: withRecipe,
    }),

  // Crea el registro userrecipe (guarda la receta) para el par (idUser, idRecipe).
  create: (idUser: number, idRecipe: number, data: CreateUserRecipeData) =>
    prisma.userrecipe.create({
      data: {
        idUser,
        idRecipe,
        isSaved: data.isSaved ?? true,
        savedAt: new Date(),
      },
      include: withRecipe,
    }),

  // Actualiza el registro userrecipe existente (isSaved). Si se marca como no guardada,
  // se limpia savedAt; si se marca como guardada, se refresca la fecha.
  update: (idUser: number, idRecipe: number, data: UpdateUserRecipeData) =>
    prisma.userrecipe.update({
      where: { idUser_idRecipe: { idUser, idRecipe } },
      data: {
        isSaved: data.isSaved,
        savedAt: data.isSaved ? new Date() : null,
      },
      include: withRecipe,
    }),

  // Elimina el registro userrecipe por completo (ver nota de cascada arriba).
  delete: (idUser: number, idRecipe: number) =>
    prisma.userrecipe.delete({
      where: { idUser_idRecipe: { idUser, idRecipe } },
    }),

};
