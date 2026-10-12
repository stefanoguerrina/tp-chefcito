// Acceso a datos de la feature ingredientCategory: única capa que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de ingredientCategoryService.
import prisma from '../../../core/prismaClient.js';
import type { CreateIngredientCategoryData, UpdateIngredientCategoryData } from '../models/ingredientCategoryModel.js';

export const ingredientCategoryRepository = {

  // Devuelve todas las categorías de ingrediente, ordenadas por nombre, con cuántos
  // ingredientes tiene cada una (_count.ingredientcategoryingredient): el panel admin lo
  // muestra sin tener que pedir todos los ingredientes.
  findAll: () =>
    prisma.ingredientcategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { ingredientcategoryingredient: true } } },
    }),

  // Busca una categoría de ingrediente por ID.
  findById: (id: number) =>
    prisma.ingredientcategory.findUnique({ where: { id } }),

  // Busca una categoría de ingrediente por nombre (usado para verificar duplicados).
  findByName: (name: string) =>
    prisma.ingredientcategory.findFirst({ where: { name: name.trim() } }),

  // Crea una nueva categoría de ingrediente.
  create: (data: CreateIngredientCategoryData) =>
    prisma.ingredientcategory.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    }),

  // Actualiza los datos de una categoría de ingrediente existente.
  update: (id: number, data: UpdateIngredientCategoryData) =>
    prisma.ingredientcategory.update({ where: { id }, data }),

  // Elimina una categoría de ingrediente. El service la protege antes con countIngredients;
  // si igual llegara a ejecutarse con ingredientes asociados, los vínculos se borran en
  // cascada (onDelete: Cascade en ingredientcategoryingredient) sin afectar a los ingredientes.
  delete: (id: number) =>
    prisma.ingredientcategory.delete({ where: { id } }),

  // Cuenta cuántos ingredientes usan esta categoría, vía la tabla intermedia N:M
  // (para validar antes de borrar).
  countIngredients: (id: number) =>
    prisma.ingredientcategoryingredient.count({ where: { idIngredientCategory: id } }),

};
