// Acceso a datos de la feature step: única capa que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de stepService.
// La clave primaria de step es compuesta: (idRecipe, id).
import prisma from '../../../core/prismaClient.js';
import type { Prisma } from '@prisma/client';
import type { StepInput } from '../models/stepModel.js';

export const stepRepository = {

  // Devuelve todos los pasos de una receta, ordenados por stepNumber.
  findAllByRecipe: (idRecipe: number) =>
    prisma.step.findMany({
      where: { idRecipe },
      orderBy: { stepNumber: 'asc' },
    }),

  // Busca la receta padre (solo el campo idUser, para chequear propiedad sin traer todo).
  findRecipeOwner: (idRecipe: number) =>
    prisma.recipe.findUnique({ where: { id: idRecipe }, select: { idUser: true } }),

  // Reemplaza por completo la lista de pasos de una receta: borra los actuales y
  // crea los nuevos en el orden recibido, numerándolos 1..N. Todo en una transacción
  // para que no quede a mitad de camino si algo falla.
  replaceAll: (idRecipe: number, steps: StepInput[]) =>
    prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.step.deleteMany({ where: { idRecipe } });
      await tx.step.createMany({
        data: steps.map((step, index) => ({
          idRecipe,
          id: index + 1,
          stepNumber: index + 1,
          instruction: step.instruction,
          estimatedTime: step.estimatedTime ?? null,
        })),
      });
      return tx.step.findMany({ where: { idRecipe }, orderBy: { stepNumber: 'asc' } });
    }),

};
