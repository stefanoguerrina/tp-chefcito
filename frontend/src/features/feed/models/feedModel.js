// Modelo del feed de la home: qué se le pide al backend en cada sección y cómo se mapean
// sus respuestas crudas a la forma que usan los componentes. Factory functions simples.
// "Amigos" = las personas que sigue el usuario logueado (feature follow).
import { recipeToCardProps, getRecipeImageUrl } from '../../recipe/models/recipeModel.js';
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Plazo del ranking de la 2ª sección, en días.
export const WEEKLY_TOP_DAYS = 7;

// Query string de cada sección (los servicios los reciben tal cual, ver useSearchListing).
// Recetas de amigos: 1 destacada + 3 compactas. Reseñas: 2 filas de 3 en escritorio.
export const FRIENDS_RECIPES_QUERY = 'limit=4';
export const WEEKLY_TOP_QUERY = `days=${WEEKLY_TOP_DAYS}&limit=10`;
export const FRIENDS_REVIEWS_QUERY = 'limit=6';

// Convierte un usuario crudo (autor de una receta o de una reseña) en lo que muestran las
// cards: nombre completo, @usuario y foto (o null, y UserAvatar pone las iniciales).
const toPerson = (user) => ({
  id: user?.id,
  username: user?.username ?? '',
  name: user?.name ?? '',
  lastName: user?.lastName ?? '',
  fullName: `${user?.name ?? ''} ${user?.lastName ?? ''}`.trim() || user?.username || 'Usuario',
  avatarUrl: resolveImageUrl(user?.avatarUrl),
});

// Receta de un amigo: las props de RecipeCard (misma forma que el resto de la app, con su
// valoración) + el creador completo y cuándo la publicó.
const toFriendRecipe = (recipe) => ({
  ...recipeToCardProps(recipe),
  rating: recipe.averageRating ?? 0,
  reviewsCount: recipe.reviewCount ?? 0,
  creator: toPerson(recipe.user),
  publishedAt: recipe.createdAt,
});

// Reseña de un amigo, con su autor y la receta reseñada (nombre + foto principal).
const toFriendReview = (review) => ({
  // La PK de review es compuesta: se arma una clave única para las listas de React.
  key: `${review.idUser}-${review.idRecipe}-${review.idReview}`,
  rating: Number(review.rating) || 0,
  comment: review.comment ?? '',
  createdAt: review.createdAt,
  author: toPerson(review.author),
  recipe: {
    id: review.recipe?.id,
    name: review.recipe?.name ?? '',
    image: getRecipeImageUrl(review.recipe ?? {}),
  },
});

// Respuesta de GET /api/feed/friends/recipes → { followingCount, items }.
export const createFriendsRecipesFeed = (raw) => ({
  followingCount: raw?.followingCount ?? 0,
  items: (raw?.items ?? []).map(toFriendRecipe),
});

// Respuesta de GET /api/feed/friends/reviews → { followingCount, items }.
export const createFriendsReviewsFeed = (raw) => ({
  followingCount: raw?.followingCount ?? 0,
  items: (raw?.items ?? []).map(toFriendReview),
});

// Respuesta de GET /api/feed/top-recipes → { items }. El backend ya las manda ordenadas:
// el puesto (rank) es la posición en la lista. authorId sirve para no ofrecer "Guardar"
// en las recetas propias.
export const createWeeklyTop = (raw) => ({
  items: (raw?.items ?? []).map((recipe, index) => ({
    ...recipeToCardProps(recipe),
    authorId: recipe.idUser,
    rank: index + 1,
    rating: recipe.averageRating ?? 0,
    reviewsCount: recipe.reviewCount ?? 0,
  })),
});
