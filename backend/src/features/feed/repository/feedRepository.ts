// Acceso a datos de la feature feed (home): única capa de la feature que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de feedService.
import prisma from '../../../core/prismaClient.js';
import type { Prisma } from '@prisma/client';

// Usuarios activos a los que sigue idUser (sus "amigos"): tienen una fila en follow
// donde el que sigue es idUser.
const followedBy = (idUser: number): Prisma.UserWhereInput => ({
  deletedAt: null,
  followers: { some: { idFollower: idUser } },
});

// Datos públicos de un autor (nunca password, email ni teléfono).
const authorSelect = {
  id: true,
  username: true,
  name: true,
  lastName: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

// Solo la foto principal de la receta (o la primera, si ninguna está marcada).
const mainImageSelect = {
  select: { imageUrl: true, isMain: true },
  orderBy: [{ isMain: 'desc' }, { id: 'asc' }],
  take: 1,
} satisfies Prisma.recipe$imageArgs;

// Lo que muestran las cards de receta de la home: foto principal, bajada, tiempo,
// categorías, fecha de publicación y creador.
const recipeCardSelect = {
  id: true,
  idUser: true,
  name: true,
  description: true,
  preparationTime: true,
  createdAt: true,
  image: mainImageSelect,
  recipecategory: { select: { category: { select: { name: true } } } },
  user: { select: authorSelect },
} satisfies Prisma.recipeSelect;

export const feedRepository = {

  // Las últimas `limit` recetas publicadas por las personas que sigue idUser.
  findFriendsRecipes: (idUser: number, limit: number) =>
    prisma.recipe.findMany({
      where: { user: followedBy(idUser) },
      select: recipeCardSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
    }),

  // Las últimas `limit` reseñas escritas por las personas que sigue idUser, con su autor
  // y la receta reseñada (sin recetas de usuarios dados de baja).
  findFriendsReviews: (idUser: number, limit: number) =>
    prisma.review.findMany({
      where: {
        userrecipe: {
          user: followedBy(idUser),
          recipe: { user: { deletedAt: null } },
        },
      },
      select: {
        idUser: true,
        idRecipe: true,
        idReview: true,
        rating: true,
        comment: true,
        createdAt: true,
        userrecipe: {
          select: {
            user: { select: authorSelect },
            recipe: { select: { id: true, name: true, image: mainImageSelect } },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { idRecipe: 'desc' }],
      take: limit,
    }),

  // Datos de card de las recetas indicadas, salteando las de usuarios dados de baja.
  findRecipeCardsByIds: (recipeIds: number[]) =>
    prisma.recipe.findMany({
      where: { id: { in: recipeIds }, user: { deletedAt: null } },
      select: recipeCardSelect,
    }),

};
