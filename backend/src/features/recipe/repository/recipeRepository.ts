// Acceso a datos de la feature recipe: única capa que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de recipeService.
// Una receta puede tener varias categorías (N:M vía recipecategory), así que
// crear/actualizar una receta implica también escribir esa tabla intermedia.
import prisma from '../../../core/prismaClient.js';
import type { Prisma } from '@prisma/client';
import type { CreateRecipeData, UpdateRecipeData } from '../models/recipeModel.js';

// Include reutilizable: trae, para cada receta, sus categorías ya "aplanadas",
// los datos públicos de su creador (sin password), sus imágenes, sus ingredientes
// (con nombre y unidad de medida) y sus pasos de preparación (ordenados), para
// poder recargar todo tal cual en el editor.
const withRelations = {
  recipecategory: {
    include: { category: true },
  },
  user: {
    select: { id: true, username: true, name: true, lastName: true, avatarUrl: true },
  },
  image: true,
  recipeingredient: {
    include: { ingredient: true },
  },
  step: {
    orderBy: { stepNumber: 'asc' },
  },
} as const;

export const recipeRepository = {

  // Devuelve todas las recetas junto con sus categorías, creador e imágenes.
  findAll: () =>
    prisma.recipe.findMany({
      include: withRelations,
      orderBy: { createdAt: 'desc' },
    }),

  // Devuelve todas las recetas creadas por un usuario puntual.
  findAllByUser: (idUser: number) =>
    prisma.recipe.findMany({
      where: { idUser },
      include: withRelations,
      orderBy: { createdAt: 'desc' },
    }),

  // Busca una receta por ID, incluyendo sus categorías, creador e imágenes.
  findById: (id: number) =>
    prisma.recipe.findUnique({
      where: { id },
      include: withRelations,
    }),

  // Crea una nueva receta junto con sus vínculos a categorías, en una sola operación
  // (nested create de Prisma: crea las filas de recipecategory al mismo tiempo).
  create: (idUser: number, data: CreateRecipeData) =>
    prisma.recipe.create({
      data: {
        idUser,
        name: data.name,
        description: data.description ?? null,
        preparationTime: data.preparationTime ?? null,
        difficulty: data.difficulty ?? null,
        recipecategory: data.categoryIds
          ? { create: data.categoryIds.map((idCategory) => ({ idCategory })) }
          : undefined,
      },
      include: withRelations,
    }),

  // Actualiza los campos escalares de una receta y, si se pasa categoryIds,
  // reemplaza por completo el set de categorías (borra los vínculos viejos y crea los nuevos).
  // Todo en una transacción para que no quede a mitad de camino si algo falla.
  update: (id: number, data: UpdateRecipeData) =>
    prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const { categoryIds, ...scalarData } = data;

      if (categoryIds !== undefined) {
        await tx.recipecategory.deleteMany({ where: { idRecipe: id } });
        await tx.recipecategory.createMany({
          data: categoryIds.map((idCategory) => ({ idCategory, idRecipe: id })),
        });
      }

      return tx.recipe.update({
        where: { id },
        data: scalarData,
        include: withRelations,
      });
    }),

  // Elimina una receta. Las filas relacionadas (recipecategory, recipeingredient, step,
  // image, userrecipe) se borran en cascada (onDelete: Cascade en el schema).
  delete: (id: number) =>
    prisma.recipe.delete({ where: { id } }),

  // Promedio y cantidad de reseñas de cada receta de la lista, en UNA sola consulta
  // agrupada (así el frontend no tiene que pedir las reseñas receta por receta).
  // Las recetas sin reseñas no aparecen en el resultado.
  findReviewStats: (recipeIds: number[]) =>
    prisma.review.groupBy({
      by: ['idRecipe'],
      where: { idRecipe: { in: recipeIds } },
      _avg: { rating: true },
      _count: { _all: true },
    }),

  // Verifica que TODAS las categorías pasadas existan (para validar la FK antes de crear/actualizar).
  categoriesExist: async (categoryIds: number[]): Promise<boolean> => {
    if (categoryIds.length === 0) return true;
    const count = await prisma.category.count({ where: { id: { in: categoryIds } } });
    return count === new Set(categoryIds).size;
  },

};
