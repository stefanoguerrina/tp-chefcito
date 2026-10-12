// Lógica de negocio de la feature userRecipe (guardar/desguardar recetas).
// Orquesta el repositorio y aplica reglas de negocio. El controller solo llama
// funciones de este archivo.
import { userRecipeRepository } from '../repository/userRecipeRepository.js';
import { recipeRepository } from '../../recipe/repository/recipeRepository.js';
import type { CreateUserRecipeData, UpdateUserRecipeData } from '../models/userRecipeModel.js';

// Devuelve todas las recetas guardadas por un usuario.
export async function getSavedRecipesByUser(idUser: number) {
  return userRecipeRepository.findAllByUser(idUser);
}

// Devuelve el registro userrecipe del usuario para una receta, si está guardada.
export async function getUserRecipe(
  idUser: number,
  idRecipe: number
): Promise<
  | { ok: true; userRecipe: NonNullable<Awaited<ReturnType<typeof userRecipeRepository.findOne>>> }
  | { ok: false; reason: 'not_found' }
> {
  const existing = await userRecipeRepository.findOne(idUser, idRecipe);
  if (!existing || !existing.isSaved) return { ok: false, reason: 'not_found' };
  return { ok: true, userRecipe: existing };
}

// Guarda una receta para el usuario autenticado.
// Reglas de negocio:
//   - La receta debe existir.
//   - Si ya estaba guardada, se rechaza (already_saved).
//   - Si existía un registro sin guardar (ej: quedó de una review previa), se reactiva.
export async function createUserRecipe(
  idUser: number,
  idRecipe: number,
  data: CreateUserRecipeData
): Promise<
  | { ok: true; userRecipe: Awaited<ReturnType<typeof userRecipeRepository.create>> }
  | { ok: false; reason: 'recipe_not_found' | 'already_saved' }
> {
  const recipe = await recipeRepository.findById(idRecipe);
  if (!recipe) return { ok: false, reason: 'recipe_not_found' };

  const existing = await userRecipeRepository.findOne(idUser, idRecipe);
  if (existing?.isSaved) return { ok: false, reason: 'already_saved' };

  const userRecipe = existing
    ? await userRecipeRepository.update(idUser, idRecipe, { isSaved: data.isSaved ?? true })
    : await userRecipeRepository.create(idUser, idRecipe, data);

  return { ok: true, userRecipe };
}

// Actualiza el estado de guardado (isSaved) de un registro userrecipe existente.
export async function updateUserRecipe(
  idUser: number,
  idRecipe: number,
  data: UpdateUserRecipeData
): Promise<
  | { ok: true; userRecipe: Awaited<ReturnType<typeof userRecipeRepository.update>> }
  | { ok: false; reason: 'not_found' }
> {
  const existing = await userRecipeRepository.findOne(idUser, idRecipe);
  if (!existing) return { ok: false, reason: 'not_found' };

  const userRecipe = await userRecipeRepository.update(idUser, idRecipe, data);
  return { ok: true, userRecipe };
}

// Elimina por completo el registro userrecipe del usuario para una receta.
export async function deleteUserRecipe(
  idUser: number,
  idRecipe: number
): Promise<{ ok: true } | { ok: false; reason: 'not_found' }> {
  const existing = await userRecipeRepository.findOne(idUser, idRecipe);
  if (!existing) return { ok: false, reason: 'not_found' };

  await userRecipeRepository.delete(idUser, idRecipe);
  return { ok: true };
}
