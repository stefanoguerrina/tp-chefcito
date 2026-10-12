// Lógica de negocio de la feature recipeIngredient.
// Orquesta el repositorio, aplica reglas y transforma datos para el controller.
// Solo el dueño de la receta (o un admin) puede reemplazar sus ingredientes.
import { recipeIngredientRepository } from '../repository/recipeIngredientRepository.js';
import type { RecipeIngredientInput } from '../models/recipeIngredientModel.js';

// Devuelve los ingredientes de una receta. Devuelve 'recipe_not_found' si la receta no existe.
export async function getRecipeIngredientsByRecipe(idRecipe: number) {
  const recipe = await recipeIngredientRepository.findRecipeOwner(idRecipe);
  if (!recipe) return 'recipe_not_found' as const;
  return recipeIngredientRepository.findAllByRecipe(idRecipe);
}

// Reemplaza por completo los ingredientes de una receta. Requiere al menos un
// ingrediente, que no se repita ninguno y que quien pide el cambio sea el
// dueño de la receta o un admin.
export async function replaceRecipeIngredients(
  idRecipe: number,
  requestingUserId: number,
  isAdmin: boolean,
  items: RecipeIngredientInput[]
): Promise<
  | { ok: true; recipeIngredients: Awaited<ReturnType<typeof recipeIngredientRepository.replaceAll>> }
  | { ok: false; reason: 'not_found' | 'forbidden' | 'empty' | 'duplicate' | 'ingredients_not_found' }
> {
  const recipe = await recipeIngredientRepository.findRecipeOwner(idRecipe);
  if (!recipe) return { ok: false, reason: 'not_found' };

  if (recipe.idUser !== requestingUserId && !isAdmin) {
    return { ok: false, reason: 'forbidden' };
  }

  if (items.length === 0) return { ok: false, reason: 'empty' };

  const ingredientIds = items.map((item) => item.idIngredient);
  if (new Set(ingredientIds).size !== ingredientIds.length) {
    return { ok: false, reason: 'duplicate' };
  }

  const ingredientsExist = await recipeIngredientRepository.ingredientsExist(ingredientIds);
  if (!ingredientsExist) return { ok: false, reason: 'ingredients_not_found' };

  const recipeIngredients = await recipeIngredientRepository.replaceAll(idRecipe, items);
  return { ok: true, recipeIngredients };
}
