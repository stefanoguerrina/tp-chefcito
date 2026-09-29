// Lógica de negocio de la feature feed: arma las tres secciones de la home (recetas de
// amigos, ranking de recetas mejor valoradas en un plazo y reseñas de amigos).
// "Amigos" = los usuarios que sigue el usuario autenticado (feature follow).
import { feedRepository } from '../repository/feedRepository.js';
import { followRepository } from '../../follow/repository/followRepository.js';
import type { RecipeRanking } from '../models/feedModel.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Recetas publicadas por las personas que sigue idUser, las más nuevas primero.
// Devuelve: { followingCount, items }, cada receta con su averageRating y reviewCount (0 si
// no tiene reseñas). followingCount le sirve al frontend para distinguir "todavía no seguís
// a nadie" de "las personas que seguís no publicaron nada".
export async function getFriendsRecipes(idUser: number, limit: number) {
  const [followingCount, recipes] = await Promise.all([
    followRepository.countFollowing(idUser),
    feedRepository.findFriendsRecipes(idUser, limit),
  ]);

  // La valoración se pide después porque depende de qué recetas salieron.
  const stats = recipes.length > 0
    ? await feedRepository.findReviewStats({ recipeIds: recipes.map((recipe) => recipe.id) })
    : [];
  const statsById = new Map(stats.map((stat) => [stat.idRecipe, stat]));

  const items = recipes.map((recipe) => {
    const recipeStats = statsById.get(recipe.id);
    return {
      ...recipe,
      averageRating: recipeStats?._avg.rating ? Number(recipeStats._avg.rating) : 0,
      reviewCount: recipeStats?._count._all ?? 0,
    };
  });
  return { followingCount, items };
}

// Reseñas escritas por las personas que sigue idUser, las más nuevas primero.
// Devuelve: { followingCount, items }, cada item con author y recipe aplanados (sin el
// userrecipe intermedio, que es un detalle del modelo de datos).
export async function getFriendsReviews(idUser: number, limit: number) {
  const [followingCount, reviews] = await Promise.all([
    followRepository.countFollowing(idUser),
    feedRepository.findFriendsReviews(idUser, limit),
  ]);

  const items = reviews.map(({ userrecipe, ...review }) => ({
    ...review,
    // Prisma devuelve el Decimal como objeto: se pasa a número para la API.
    rating: Number(review.rating),
    author: userrecipe.user,
    recipe: userrecipe.recipe,
  }));
  return { followingCount, items };
}

// Ranking de las `limit` recetas mejor valoradas con las reseñas de los últimos `days`
// días (ej. "Top 10 de la semana"). Una receta sin reseñas en ese plazo no entra.
// Orden: mayor promedio primero y, a igual promedio, la que tiene más reseñas (mismo
// criterio que "Mejor puntuadas" del buscador).
// Devuelve: { days, items }, cada item con los datos de su card + averageRating y
// reviewCount (calculados solo con las reseñas del plazo).
export async function getTopRecipes(days: number, limit: number) {
  const since = new Date(Date.now() - days * DAY_MS);
  const stats = await feedRepository.findReviewStats({ since });

  const ranking: RecipeRanking[] = stats
    .map((stat) => ({
      idRecipe: stat.idRecipe,
      averageRating: stat._avg.rating ? Number(stat._avg.rating) : 0,
      reviewCount: stat._count._all,
    }))
    .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);

  if (ranking.length === 0) return { days, items: [] };

  // Se piden las cards de todo el ranking (no solo de las primeras `limit`) porque
  // algunas pueden quedar afuera por ser de un usuario dado de baja: así el top igual se
  // completa con las siguientes. Se recorre `ranking` para respetar el orden.
  const cards = await feedRepository.findRecipeCardsByIds(ranking.map((row) => row.idRecipe));
  const cardsById = new Map(cards.map((card) => [card.id, card]));

  const items = ranking
    .filter((row) => cardsById.has(row.idRecipe))
    .slice(0, limit)
    .map((row) => ({
      ...cardsById.get(row.idRecipe)!,
      averageRating: row.averageRating,
      reviewCount: row.reviewCount,
    }));

  return { days, items };
}
