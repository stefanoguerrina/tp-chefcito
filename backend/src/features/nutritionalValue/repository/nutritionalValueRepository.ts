// Acceso a datos de la feature nutritionalValue: única capa que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de nutritionalValueService.
// La clave primaria de nutritionalvalue es compuesta: (idIngredient, num).
import prisma from '../../../core/prismaClient.js';
import type { CreateNutritionalValueData, UpdateNutritionalValueData } from '../models/nutritionalValueModel.js';

export const nutritionalValueRepository = {

  // Devuelve todos los valores nutricionales de un ingrediente, ordenados por num.
  findAllByIngredient: (idIngredient: number) =>
    prisma.nutritionalvalue.findMany({
      where: { idIngredient },
      orderBy: { num: 'asc' },
    }),

  // Busca un valor nutricional puntual por su clave compuesta.
  findOne: (idIngredient: number, num: number) =>
    prisma.nutritionalvalue.findUnique({
      where: { idIngredient_num: { idIngredient, num } },
    }),

  // Calcula el próximo número de secuencia dentro del ingrediente (1 si es el primero).
  getNextNum: async (idIngredient: number): Promise<number> => {
    const last = await prisma.nutritionalvalue.findFirst({
      where: { idIngredient },
      orderBy: { num: 'desc' },
    });
    return (last?.num ?? 0) + 1;
  },

  // Crea un nuevo valor nutricional para el ingrediente, asignando el num siguiente.
  create: async (idIngredient: number, data: CreateNutritionalValueData) => {
    const num = await nutritionalValueRepository.getNextNum(idIngredient);
    return prisma.nutritionalvalue.create({
      data: {
        idIngredient,
        num,
        name: data.name,
        servingAmount: data.servingAmount ?? null,
        servingUnit: data.servingUnit ?? null,
        value: data.value ?? null,
      },
    });
  },

  // Actualiza un valor nutricional existente.
  update: (idIngredient: number, num: number, data: UpdateNutritionalValueData) =>
    prisma.nutritionalvalue.update({
      where: { idIngredient_num: { idIngredient, num } },
      data,
    }),

  // Elimina un valor nutricional puntual.
  delete: (idIngredient: number, num: number) =>
    prisma.nutritionalvalue.delete({ where: { idIngredient_num: { idIngredient, num } } }),

  // Verifica que exista el ingrediente padre (para validar la FK antes de operar).
  ingredientExists: async (idIngredient: number): Promise<boolean> => {
    const ingredient = await prisma.ingredient.findUnique({ where: { id: idIngredient } });
    return ingredient !== null;
  },

};
