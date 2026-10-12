// Servicio del feed de la home: una función por sección (requieren token).
// Reciben el query string ya armado (ver feedModel.js) para poder usarse con el hook
// genérico useSearchListing(servicio, query).
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { createFriendsRecipesFeed, createFriendsReviewsFeed, createWeeklyTop } from '../models/feedModel.js';

// Últimas recetas de las personas que sigo. Devuelve: ver createFriendsRecipesFeed.
export const getFriendsRecipesFeed = async (apiQuery) => {
  const raw = await apiFetch(`/feed/friends/recipes?${apiQuery}`);
  return createFriendsRecipesFeed(raw);
};

// Recetas mejor valoradas del plazo indicado (ej. la semana). Devuelve: ver createWeeklyTop.
export const getWeeklyTopRecipes = async (apiQuery) => {
  const raw = await apiFetch(`/feed/top-recipes?${apiQuery}`);
  return createWeeklyTop(raw);
};

// Últimas reseñas de las personas que sigo. Devuelve: ver createFriendsReviewsFeed.
export const getFriendsReviewsFeed = async (apiQuery) => {
  const raw = await apiFetch(`/feed/friends/reviews?${apiQuery}`);
  return createFriendsReviewsFeed(raw);
};
