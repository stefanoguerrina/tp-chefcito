// Acceso a datos de la feature ingredient: única capa que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de ingredientService.
// Un ingrediente puede tener varias categorías (N:M vía ingredientcategoryingredient),
// así que crear/actualizar un ingrediente implica también escribir esa tabla intermedia.
import prisma from '../../../core/prismaClient.js';
import type { Prisma } from '@prisma/client';
import type { CreateIngredientData, UpdateIngredientData } from '../models/ingredientModel.js';
import type { CreateNutritionalValueData } from '../../nutritionalValue/models/nutritionalValueModel.js';

// Include reutilizable: trae, para cada ingrediente, sus categorías (con el nombre de cada
// una) y sus valores nutricionales ordenados, así el panel admin puede precargar el
// formulario de edición sin pedir nada más.
const withCategories = {
  ingredientcategoryingredient: {
    include: { ingredientcategory: true },
  },
  nutritionalvalue: {
    orderBy: { num: 'asc' },
  },
  // En cuántas recetas visibles se usa (sin las de usuarios dados de baja): el panel admin
  // lo muestra sin tener que pedir todas las recetas.
  _count: {
    select: { recipeingredient: { where: { recipe: { user: { deletedAt: null } } } } },
  },
} as const;

// Convierte la lista de valores nutricionales del formulario en filas de la tabla
// nutritionalvalue: el num (parte de la PK compuesta) es simplemente la posición + 1.
// Devuelve las filas sin idIngredient: lo pone Prisma en el nested create, o se agrega a
// mano en el createMany del update.
const toNutritionalRows = (values: CreateNutritionalValueData[]) =>
  values.map((value, index) => ({
    num: index + 1,
    name: value.name,
    servingAmount: value.servingAmount ?? null,
    servingUnit: value.servingUnit ?? null,
    value: value.value ?? null,
  }));

export const ingredientRepository = {

  // Devuelve todos los ingredientes junto con sus categorías.
  findAll: () =>
    prisma.ingredient.findMany({
      include: withCategories,
      orderBy: { name: 'asc' },
    }),

  // Busca un ingrediente por ID, incluyendo sus categorías.
  findById: (id: number) =>
    prisma.ingredient.findUnique({
      where: { id },
      include: withCategories,
    }),

  // Busca un ingrediente por nombre en toda la tabla, sin importar la categoría
  // (usado para verificar duplicados; el nombre es único globalmente).
  // excludeId se usa en el update, para no chocar contra el propio registro que se está editando.
  findByName: (name: string, excludeId?: number) =>
    prisma.ingredient.findFirst({
      where: {
        name: name.trim(),
        ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
      },
    }),

  // Crea un nuevo ingrediente junto con sus vínculos a categorías y sus valores
  // nutricionales, en una sola operación (nested create de Prisma: crea las filas de
  // ingredientcategoryingredient y nutritionalvalue al mismo tiempo).
  create: (data: CreateIngredientData) =>
    prisma.ingredient.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        unitOfMeasure: data.unitOfMeasure ?? null,
        imagePath: data.imagePath ?? null,
        ingredientcategoryingredient: {
          create: data.categoryIds.map((idIngredientCategory) => ({ idIngredientCategory })),
        },
        nutritionalvalue: {
          create: toNutritionalRows(data.nutritionalValues ?? []),
        },
      },
      include: withCategories,
    }),

  // Actualiza los campos escalares de un ingrediente y, si se pasa categoryIds o
  // nutritionalValues, reemplaza por completo ese set (borra las filas viejas y crea las
  // nuevas). Todo en una transacción para que no quede a mitad de camino si algo falla.
  update: (id: number, data: UpdateIngredientData) =>
    prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const { categoryIds, nutritionalValues, ...scalarData } = data;

      if (categoryIds !== undefined) {
        await tx.ingredientcategoryingredient.deleteMany({ where: { idIngredient: id } });
        await tx.ingredientcategoryingredient.createMany({
          data: categoryIds.map((idIngredientCategory) => ({ idIngredientCategory, idIngredient: id })),
        });
      }

      if (nutritionalValues !== undefined) {
        await tx.nutritionalvalue.deleteMany({ where: { idIngredient: id } });
        await tx.nutritionalvalue.createMany({
          data: toNutritionalRows(nutritionalValues).map((row) => ({ ...row, idIngredient: id })),
        });
      }

      return tx.ingredient.update({
        where: { id },
        data: scalarData,
        include: withCategories,
      });
    }),

  // Elimina un ingrediente. Falla si está en uso (inventory, recipeingredient: onDelete Restrict).
  // Sus categorías y valores nutricionales sí se borran en cascada (onDelete: Cascade en el schema).
  delete: (id: number) =>
    prisma.ingredient.delete({ where: { id } }),

  // Verifica que TODAS las categorías pasadas existan (para validar la FK antes de crear/actualizar).
  categoriesExist: async (categoryIds: number[]): Promise<boolean> => {
    if (categoryIds.length === 0) return false;
    const count = await prisma.ingredientcategory.count({ where: { id: { in: categoryIds } } });
    return count === new Set(categoryIds).size;
  },

};
