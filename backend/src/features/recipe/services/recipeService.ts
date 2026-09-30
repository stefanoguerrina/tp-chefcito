// Lógica de negocio de la feature recipe.
// Orquesta el repositorio, aplica reglas y transforma datos para el controller.
// A diferencia de category/ingredient (catálogos globales de solo-admin), una receta
// le pertenece a quien la crea: cualquier usuario autenticado puede crear las suyas,
// pero solo su dueño o un admin puede modificarlas o eliminarlas.
import { recipeRepository } from '../repository/recipeRepository.js';
import type { CreateRecipeData, UpdateRecipeData } from '../models/recipeModel.js';
import { deleteLocalUpload } from '../../../core/fileStorage.js';

// Le suma a cada receta su valoración: averageRating (0 si no tiene reseñas) y
// reviewCount. Mismos nombres que usan los listados de search y feed.
// Recibe: recetas del repositorio. Devuelve: las mismas recetas con esos dos campos.
async function withReviewStats<T extends { id: number }>(recipes: T[]) {
  const stats = await recipeRepository.findReviewStats(recipes.map((recipe) => recipe.id));
  const statsByRecipeId = new Map(stats.map((stat) => [stat.idRecipe, stat]));

  return recipes.map((recipe) => {
    const recipeStats = statsByRecipeId.get(recipe.id);
    return {
      ...recipe,
      averageRating: recipeStats?._avg.rating ? Number(recipeStats._avg.rating) : 0,
      reviewCount: recipeStats?._count._all ?? 0,
    };
  });
}

// Devuelve todas las recetas con sus categorías, creador, imágenes y valoración.
export async function getAllRecipes() {
  const recipes = await recipeRepository.findAll();
  if (recipes.length === 0) return null;
  return withReviewStats(recipes);
}

// Devuelve todas las recetas creadas por un usuario puntual, con su valoración.
export async function getRecipesByUser(idUser: number) {
  const recipes = await recipeRepository.findAllByUser(idUser);
  if (recipes.length === 0) return null;
  return withReviewStats(recipes);
}

// Busca una receta por ID. Devuelve null si no existe.
export async function getRecipeById(id: number) {
  return recipeRepository.findById(id);
}

// Crea una nueva receta para el usuario autenticado. Verifica que todas las
// categorías indicadas (si las hay) existan.
export async function createRecipe(
  idUser: number,
  data: CreateRecipeData
): Promise<
  | { ok: true; recipe: Awaited<ReturnType<typeof recipeRepository.create>> }
  | { ok: false; reason: 'categories_not_found' }
> {
  const categoriesExist = await recipeRepository.categoriesExist(data.categoryIds ?? []);
  if (!categoriesExist) return { ok: false, reason: 'categories_not_found' };

  const recipe = await recipeRepository.create(idUser, data);
  return { ok: true, recipe };
}

// Actualiza una receta existente. Solo puede hacerlo su dueño o un admin.
// Si se envían categoryIds, verifica que todas existan (y reemplaza el set completo).
export async function updateRecipe(
  id: number,
  requestingUserId: number,
  isAdmin: boolean,
  data: UpdateRecipeData
): Promise<
  | { ok: true; recipe: Awaited<ReturnType<typeof recipeRepository.update>> }
  | { ok: false; reason: 'not_found' | 'forbidden' | 'categories_not_found' }
> {
  const existing = await recipeRepository.findById(id);
  if (!existing) return { ok: false, reason: 'not_found' };

  if (existing.idUser !== requestingUserId && !isAdmin) {
    return { ok: false, reason: 'forbidden' };
  }

  if (data.categoryIds !== undefined) {
    const categoriesExist = await recipeRepository.categoriesExist(data.categoryIds);
    if (!categoriesExist) return { ok: false, reason: 'categories_not_found' };
  }

  const recipe = await recipeRepository.update(id, data);
  return { ok: true, recipe };
}

// Elimina una receta. Solo puede hacerlo su dueño o un admin.
export async function deleteRecipe(
  id: number,
  requestingUserId: number,
  isAdmin: boolean
): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'forbidden' }> {
  const existing = await recipeRepository.findById(id);
  if (!existing) return { ok: false, reason: 'not_found' };

  if (existing.idUser !== requestingUserId && !isAdmin) {
    return { ok: false, reason: 'forbidden' };
  }

  await recipeRepository.delete(id);

  // Las filas de image se borran en cascada, pero los archivos subidos quedan en disco:
  // se limpian acá para no acumular fotos de recetas que ya no existen.
  await Promise.all(existing.image.map((img) => deleteLocalUpload(img.imageUrl)));
  return { ok: true };
}
