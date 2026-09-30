// Lógica de negocio de la feature recipe.
// Orquesta el repositorio, aplica reglas y transforma datos para el controller.
// A diferencia de category/ingredient (catálogos globales de solo-admin), una receta
// le pertenece a quien la crea: cualquier usuario autenticado puede crear las suyas,
// pero solo su dueño o un admin puede modificarlas o eliminarlas.
import { recipeRepository } from '../repository/recipeRepository.js';
import type { CreateRecipeData, UpdateRecipeData } from '../models/recipeModel.js';
import { deleteLocalUpload } from '../../../core/fileStorage.js';
import { computeRecipeNutrition } from './recipeNutritionService.js';

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

// Detalle de una receta (GET /api/recipes/:id): la receta completa + sus valores
// nutricionales + los datos del usuario que la mira, todo en una sola respuesta para que
// la página de detalle no tenga que hacer un pedido por cada cosa.
// Recibe: el id de la receta y el id del usuario logueado (undefined si no hay sesión).
// Devuelve: la receta con `nutrition` (ver computeRecipeNutrition) y `viewer`
// ({ isSaved, pantryIngredientIds } o null sin sesión), o null si no existe.
export async function getRecipeDetail(id: number, viewerId?: number) {
  // Las tres consultas son independientes: van en paralelo.
  const [recipe, savedRow, pantryRows] = await Promise.all([
    recipeRepository.findDetailById(id),
    viewerId ? recipeRepository.findSavedByUser(viewerId, id) : Promise.resolve(null),
    viewerId ? recipeRepository.findPantryIngredientIds(viewerId, id) : Promise.resolve([]),
  ]);
  if (!recipe) return null;

  const nutrition = computeRecipeNutrition(
    recipe.recipeingredient.map((item) => ({
      name: item.ingredient.name,
      unitOfMeasure: item.ingredient.unitOfMeasure,
      requiredQuantity: item.requiredQuantity,
      nutritionalValues: item.ingredient.nutritionalvalue,
    })),
    recipe.servings
  );

  return {
    ...recipe,
    nutrition,
    viewer: viewerId
      ? { isSaved: savedRow !== null, pantryIngredientIds: pantryRows.map((row) => row.idIngredient) }
      : null,
  };
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
