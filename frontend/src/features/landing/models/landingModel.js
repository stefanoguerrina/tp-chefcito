// Modelo de la landing: qué se le pide al backend para "Las 5 recetas del momento" y cómo
// se mapea la respuesta a las props de RecipeCard. Factory functions simples.
import { recipeToCardProps } from '../../recipe/models/recipeModel.js';

// Plazo del ranking ("del momento" = el último mes) y cuántas recetas se muestran.
const LANDING_TOP_DAYS = 30;
const LANDING_TOP_LIMIT = 5;
export const LANDING_TOP_QUERY = `days=${LANDING_TOP_DAYS}&limit=${LANDING_TOP_LIMIT}`;

// Respuesta de GET /api/feed/top-recipes → recetas listas para RecipeCard, en el orden del
// ranking (el backend ya las manda de mejor a peor valorada).
// Recibe: { days, items }. Devuelve: [{ ...props de RecipeCard, rating, reviewsCount }].
export const createLandingTopRecipes = (raw) =>
  (raw?.items ?? []).map((recipe) => ({
    ...recipeToCardProps(recipe),
    rating: recipe.averageRating ?? 0,
    reviewsCount: recipe.reviewCount ?? 0,
  }));
