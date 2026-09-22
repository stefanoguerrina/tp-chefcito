// Acceso a datos de la feature review: única capa que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de reviewService.
//
// Particularidades del modelo:
//   - La PK de review es compuesta: (idUser, idRecipe, idReview).
//   - idReview es secuencial dentro del par (idUser, idRecipe), no global.
//   - review tiene FK a userrecipe(idUser, idRecipe): si no existe el registro
//     de userrecipe, se crea en el mismo upsert antes de insertar la review.
//   - Limitamos a 1 review por par (idUser, idRecipe).
import prisma from '../../../core/prismaClient.js';
import type { CreateReviewData, UpdateReviewData } from '../models/reviewModel.js';

// Include reutilizable: trae los datos públicos del autor de la review.
const withAuthor = {
  userrecipe: {
    include: {
      user: {
        select: { id: true, username: true, name: true, lastName: true, avatarUrl: true },
      },
    },
  },
} as const;

export const reviewRepository = {

  // Devuelve todas las reviews de una receta, incluyendo los datos del autor.
  findAllByRecipe: (idRecipe: number) =>
    prisma.review.findMany({
      where: { idRecipe },
      include: withAuthor,
      orderBy: { createdAt: 'desc' },
    }),

  // Busca la review de un usuario para una receta puntual.
  // Usamos findFirst porque solo hay 1 review por (idUser, idRecipe).
  findByUserAndRecipe: (idUser: number, idRecipe: number) =>
    prisma.review.findFirst({
      where: { idUser, idRecipe },
      include: withAuthor,
    }),

  // Busca una review por su PK completa.
  findOne: (idUser: number, idRecipe: number, idReview: number) =>
    prisma.review.findUnique({
      where: { idUser_idRecipe_idReview: { idUser, idRecipe, idReview } },
      include: withAuthor,
    }),

  // Crea una review para el par (idUser, idRecipe).
  // 1. Hace upsert de userrecipe para garantizar que la FK se satisfaga.
  //    Si el usuario ya guardó la receta (isSaved: true) se mantiene ese valor.
  // 2. Calcula el próximo idReview secuencial.
  // 3. Crea la review. Todo en una transacción.
  create: async (idUser: number, idRecipe: number, data: CreateReviewData) => {
    return prisma.$transaction(async (tx) => {
      // Garantizar que exista el registro userrecipe (FK requerida por el schema).
      await tx.userrecipe.upsert({
        where: { idUser_idRecipe: { idUser, idRecipe } },
        create: { idUser, idRecipe, isSaved: false },
        // Si ya existe, no modificamos isSaved ni savedAt.
        update: {},
      });

      // Calcular el próximo idReview secuencial para este (idUser, idRecipe).
      const lastReview = await tx.review.findFirst({
        where: { idUser, idRecipe },
        orderBy: { idReview: 'desc' },
        select: { idReview: true },
      });
      const nextIdReview = (lastReview?.idReview ?? 0) + 1;

      return tx.review.create({
        data: {
          idUser,
          idRecipe,
          idReview: nextIdReview,
          rating: data.rating,
          comment: data.comment ?? null,
        },
        include: withAuthor,
      });
    });
  },

  // Actualiza los campos editables (rating y/o comment) de una review existente.
  update: (idUser: number, idRecipe: number, idReview: number, data: UpdateReviewData) =>
    prisma.review.update({
      where: { idUser_idRecipe_idReview: { idUser, idRecipe, idReview } },
      data: {
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.comment !== undefined && { comment: data.comment }),
      },
      include: withAuthor,
    }),

  // Elimina una review por su PK completa.
  delete: (idUser: number, idRecipe: number, idReview: number) =>
    prisma.review.delete({
      where: { idUser_idRecipe_idReview: { idUser, idRecipe, idReview } },
    }),

};
