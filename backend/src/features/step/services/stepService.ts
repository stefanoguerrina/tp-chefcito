// Lógica de negocio de la feature step.
// Orquesta el repositorio, aplica reglas y transforma datos para el controller.
// Solo el dueño de la receta (o un admin) puede reemplazar sus pasos.
import { stepRepository } from '../repository/stepRepository.js';
import type { StepInput } from '../models/stepModel.js';

// Devuelve los pasos de una receta. Devuelve 'recipe_not_found' si la receta no existe.
export async function getStepsByRecipe(idRecipe: number) {
  const recipe = await stepRepository.findRecipeOwner(idRecipe);
  if (!recipe) return 'recipe_not_found' as const;
  return stepRepository.findAllByRecipe(idRecipe);
}

// Reemplaza por completo los pasos de una receta. Requiere al menos un paso
// (una receta sin pasos no tiene sentido) y que quien pide el cambio sea el
// dueño de la receta o un admin.
export async function replaceSteps(
  idRecipe: number,
  requestingUserId: number,
  isAdmin: boolean,
  steps: StepInput[]
): Promise<
  | { ok: true; steps: Awaited<ReturnType<typeof stepRepository.replaceAll>> }
  | { ok: false; reason: 'not_found' | 'forbidden' | 'empty' }
> {
  const recipe = await stepRepository.findRecipeOwner(idRecipe);
  if (!recipe) return { ok: false, reason: 'not_found' };

  if (recipe.idUser !== requestingUserId && !isAdmin) {
    return { ok: false, reason: 'forbidden' };
  }

  if (steps.length === 0) return { ok: false, reason: 'empty' };

  const updated = await stepRepository.replaceAll(idRecipe, steps);
  return { ok: true, steps: updated };
}
