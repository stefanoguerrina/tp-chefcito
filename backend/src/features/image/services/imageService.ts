// Lógica de negocio de la feature image.
// Orquesta el repositorio, aplica reglas y transforma datos para el controller.
// Solo el dueño de la receta (o un admin) puede agregar, modificar o borrar sus imágenes.
import { imageRepository } from '../repository/imageRepository.js';
import type { CreateImageData, UpdateImageData } from '../models/imageModel.js';
import { deleteLocalUpload } from '../../../core/fileStorage.js';

// Devuelve las imágenes de una receta. Devuelve 'recipe_not_found' si la receta no existe.
export async function getImagesByRecipe(idRecipe: number) {
  const recipe = await imageRepository.findRecipeOwner(idRecipe);
  if (!recipe) return 'recipe_not_found' as const;
  return imageRepository.findAllByRecipe(idRecipe);
}

// Agrega una imagen a una receta. Requiere ser el dueño de la receta o un admin.
export async function addImage(
  idRecipe: number,
  requestingUserId: number,
  isAdmin: boolean,
  data: CreateImageData
): Promise<
  | { ok: true; image: Awaited<ReturnType<typeof imageRepository.create>> }
  | { ok: false; reason: 'not_found' | 'forbidden' }
> {
  const recipe = await imageRepository.findRecipeOwner(idRecipe);
  if (!recipe) return { ok: false, reason: 'not_found' };
  if (recipe.idUser !== requestingUserId && !isAdmin) return { ok: false, reason: 'forbidden' };

  const image = await imageRepository.create(idRecipe, data);
  return { ok: true, image };
}

// Actualiza una imagen existente. Requiere ser el dueño de la receta o un admin.
export async function updateImage(
  idRecipe: number,
  id: number,
  requestingUserId: number,
  isAdmin: boolean,
  data: UpdateImageData
): Promise<
  | { ok: true; image: Awaited<ReturnType<typeof imageRepository.update>> }
  | { ok: false; reason: 'not_found' | 'forbidden' }
> {
  const recipe = await imageRepository.findRecipeOwner(idRecipe);
  if (!recipe) return { ok: false, reason: 'not_found' };
  if (recipe.idUser !== requestingUserId && !isAdmin) return { ok: false, reason: 'forbidden' };

  const existing = await imageRepository.findOne(idRecipe, id);
  if (!existing) return { ok: false, reason: 'not_found' };

  const image = await imageRepository.update(idRecipe, id, data);

  // Si se reemplazó la foto, el archivo anterior ya no lo usa nadie: se borra del disco.
  if (data.imageUrl !== undefined && data.imageUrl !== existing.imageUrl) {
    await deleteLocalUpload(existing.imageUrl);
  }
  return { ok: true, image };
}

// Elimina una imagen. Requiere ser el dueño de la receta o un admin.
export async function deleteImage(
  idRecipe: number,
  id: number,
  requestingUserId: number,
  isAdmin: boolean
): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'forbidden' }> {
  const recipe = await imageRepository.findRecipeOwner(idRecipe);
  if (!recipe) return { ok: false, reason: 'not_found' };
  if (recipe.idUser !== requestingUserId && !isAdmin) return { ok: false, reason: 'forbidden' };

  const existing = await imageRepository.findOne(idRecipe, id);
  if (!existing) return { ok: false, reason: 'not_found' };

  await imageRepository.delete(idRecipe, id);
  await deleteLocalUpload(existing.imageUrl);
  return { ok: true };
}
