// Lógica de negocio de la feature feed: arma las tres secciones de la home (recetas de
// amigos, ranking de recetas mejor valoradas en un plazo y reseñas de amigos).
// "Amigos" = los usuarios que sigue el usuario autenticado (feature follow).
import { feedRepository } from '../repository/feedRepository.js';
import { followRepository } from '../../follow/repository/followRepository.js';
import { reviewRepository } from '../../review/repository/reviewRepository.js';
import { withReviewStats } from '../../review/services/reviewService.js';
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
  const items = await withReviewStats(recipes);
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
  const stats = await reviewRepository.findReviewStats({ since });

  const ranking: RecipeRanking[] = stats
    .map((stat) => ({
      idRecipe: stat.idRecipe,
      averageRating: stat._avg.rating ? Number(stat._avg.rating) : 0,
      reviewCount: stat._count._all,
    }))
    .sort((a, b) => b.averageRating - a.averageRating || b.reviewCount - a.reviewCount);

  if (ranking.length === 0) return { days, items: [] };

  // Las cards se piden de a `limit` (no de todo el ranking): casi siempre alcanza con un
  // pedido. Si alguna receta queda afuera por ser de un usuario dado de baja, se pide el
  // siguiente tramo del ranking hasta completar el top o quedarse sin recetas.
  const items = [];
  for (let start = 0; start < ranking.length && items.length < limit; start += limit) {
    const batch = ranking.slice(start, start + limit);
    const cards = await feedRepository.findRecipeCardsByIds(batch.map((row) => row.idRecipe));
    const cardsById = new Map(cards.map((card) => [card.id, card]));

    // Se recorre `batch` (no `cards`) para respetar el orden del ranking.
    for (const row of batch) {
      const card = cardsById.get(row.idRecipe);
      if (card && items.length < limit) {
        items.push({ ...card, averageRating: row.averageRating, reviewCount: row.reviewCount });
      }
    }
  }

  return { days, items };
}
