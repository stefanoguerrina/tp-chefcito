// Modelo de dominio de la feature UserRecipe (recetas guardadas por un usuario).
// Factory functions simples, sin clases ni TypeScript.
import { recipeToCardProps } from '../../recipe/models/recipeModel.js';

// Convierte un registro userrecipe crudo del backend (con su receta anidada) a la
// forma que usan los componentes: la receta lista para RecipeCard + el idRecipe
// (necesario para las llamadas de guardar/quitar).
export const savedRecipeFromApi = (raw) => ({
  idUser: raw.idUser,
  idRecipe: raw.idRecipe,
  savedAt: raw.savedAt,
  recipe: recipeToCardProps(raw.recipe),
});
