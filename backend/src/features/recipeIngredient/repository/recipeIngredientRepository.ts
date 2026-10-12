// Acceso a datos de la feature recipeIngredient: única capa que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de recipeIngredientService.
// La clave primaria de recipeingredient es compuesta: (idRecipe, idIngredient).
import prisma from '../../../core/prismaClient.js';
import type { Prisma } from '@prisma/client';
import type { RecipeIngredientInput } from '../models/recipeIngredientModel.js';

// Include reutilizable: trae, para cada vínculo, los datos del ingrediente
// (nombre y unidad de medida) sin necesidad de una consulta aparte.
const withIngredient = { ingredient: true } as const;

export const recipeIngredientRepository = {

  // Devuelve todos los ingredientes de una receta, con sus datos de ingrediente.
  findAllByRecipe: (idRecipe: number) =>
    prisma.recipeingredient.findMany({ where: { idRecipe }, include: withIngredient }),

  // Busca la receta padre (solo el campo idUser, para chequear propiedad sin traer todo).
  findRecipeOwner: (idRecipe: number) =>
    prisma.recipe.findUnique({ where: { id: idRecipe }, select: { idUser: true } }),

  // Verifica que TODOS los ingredientes pasados existan (para validar la FK antes de reemplazar).
  ingredientsExist: async (ingredientIds: number[]): Promise<boolean> => {
    if (ingredientIds.length === 0) return true;
    const count = await prisma.ingredient.count({ where: { id: { in: ingredientIds } } });
    return count === new Set(ingredientIds).size;
  },

  // Reemplaza por completo el set de ingredientes de una receta: borra los
  // actuales y crea los nuevos. Todo en una transacción para que no quede a
  // mitad de camino si algo falla.
  replaceAll: (idRecipe: number, items: RecipeIngredientInput[]) =>
    prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.recipeingredient.deleteMany({ where: { idRecipe } });
      await tx.recipeingredient.createMany({
        data: items.map((item) => ({
          idRecipe,
          idIngredient: item.idIngredient,
          requiredQuantity: item.requiredQuantity ?? null,
        })),
      });
      return tx.recipeingredient.findMany({ where: { idRecipe }, include: withIngredient });
    }),

};
