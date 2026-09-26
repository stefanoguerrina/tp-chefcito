// Hook que carga los datos de un perfil: el usuario, sus recetas y las estadísticas de
// reseñas (por receta y en total). Separa la carga de ProfilePage, que solo se ocupa de
// mostrar y filtrar esos datos.
import { useState, useEffect } from 'react';
import { getUserByIdService } from '../services/getUserByIdService.js';
import { getAllRecipes } from '../../recipe/services/recipeService.js';
import { getReviewsByRecipe } from '../../review/services/reviewService.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';

// Calcula el promedio de un array de ratings (null si está vacío).
const average = (ratings) =>
  ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null;

// Pide el usuario y sus recetas, y después las reseñas de cada receta en paralelo.
// El backend solo expone reseñas por receta (no un agregado por usuario), por eso los
// totales se calculan acá. No toca el estado: devuelve todo ya calculado.
// Recibe: userId. Devuelve: { user, recipes, recipeReviewStats, reviewStats }.
const loadProfileData = async (userId) => {
  const [user, recipes] = await Promise.all([
    getUserByIdService(userId),
    fetchListOrEmpty(() => getAllRecipes(userId)),
  ]);

  // Si falla la carga de las reseñas de una receta, esa receta queda sin valoraciones
  // en vez de romper todo el perfil.
  const reviewsPerRecipe = await Promise.all(
    recipes.map((recipe) => getReviewsByRecipe(recipe.id).catch(() => ({ reviews: [] })))
  );

  // Rating/cantidad de reseñas de cada receta, para su card y para ordenar
  // "mejor valoradas primero". Clave: id de receta.
  const recipeReviewStats = {};
  recipes.forEach((recipe, index) => {
    const ratings = reviewsPerRecipe[index].reviews.map((review) => review.rating);
    recipeReviewStats[recipe.id] = { averageRating: average(ratings) ?? 0, totalReviews: ratings.length };
  });

  const allRatings = reviewsPerRecipe.flatMap((data) => data.reviews.map((review) => review.rating));
  const reviewStats = { totalReviews: allRatings.length, averageRating: average(allRatings) };

  return { user, recipes, recipeReviewStats, reviewStats };
};

// Recibe: userId. Devuelve los datos del perfil, los estados de carga/error, retry
// (para el botón "Reintentar") y setUser (para reflejar la edición del perfil).
export const useProfileData = (userId) => {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [recipeReviewStats, setRecipeReviewStats] = useState({});
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: null });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede
  // llamar desde el useEffect sin renders en cascada.
  const fetchProfile = () =>
    loadProfileData(userId)
      .then((data) => {
        setUser(data.user);
        setRecipes(data.recipes);
        setRecipeReviewStats(data.recipeReviewStats);
        setReviewStats(data.reviewStats);
        setFetchError('');
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setIsLoading(false));

  const retry = () => {
    setIsLoading(true);
    fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { user, setUser, recipes, recipeReviewStats, reviewStats, isLoading, fetchError, retry };
};
