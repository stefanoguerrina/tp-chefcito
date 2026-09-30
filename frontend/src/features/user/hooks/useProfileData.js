// Hook que carga los datos de un perfil: el usuario, sus recetas y las estadísticas de
// reseñas de cada receta. Separa la carga de ProfilePage, que solo se ocupa de
// mostrar y filtrar esos datos.
// En el perfil propio el usuario NO se vuelve a pedir: se usa el que ya comparte
// CurrentUserContext (el mismo que muestra la sidebar), y al editarlo se actualiza ahí.
import { useState, useEffect } from 'react';
import { getUserByIdService } from '../services/getUserByIdService.js';
import { getAllRecipes } from '../../recipe/services/recipeService.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import { useCurrentUser } from '../../../app/CurrentUserContext.jsx';

// Pide las recetas del perfil y, si es un perfil ajeno, también el usuario (en
// paralelo). Cada receta ya viene con su averageRating y reviewCount calculados por el
// backend, así que no hace falta pedir las reseñas de cada una. No toca el estado:
// devuelve todo ya calculado.
// Recibe: userId e isOwnProfile. Devuelve: { user (null en el perfil propio), recipes,
// recipeReviewStats }.
const loadProfileData = async (userId, isOwnProfile) => {
  const [user, recipes] = await Promise.all([
    isOwnProfile ? null : getUserByIdService(userId),
    fetchListOrEmpty(() => getAllRecipes(userId)),
  ]);

  // Rating/cantidad de reseñas de cada receta, para su card y para ordenar
  // "mejor valoradas primero". Clave: id de receta.
  const recipeReviewStats = {};
  recipes.forEach((recipe) => {
    recipeReviewStats[recipe.id] = {
      averageRating: recipe.averageRating ?? 0,
      totalReviews: recipe.reviewCount ?? 0,
    };
  });

  return { user, recipes, recipeReviewStats };
};

// Recibe: userId e isOwnProfile. Devuelve los datos del perfil, los estados de
// carga/error, retry (para el botón "Reintentar") y setUser (para reflejar la edición
// del perfil).
export const useProfileData = (userId, isOwnProfile) => {
  const { currentUser, currentUserError, isCurrentUserLoading, updateCurrentUser, reloadCurrentUser } =
    useCurrentUser();

  // Usuario de un perfil ajeno (en el propio se usa currentUser).
  const [otherUser, setOtherUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [recipeReviewStats, setRecipeReviewStats] = useState({});
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede
  // llamar desde el useEffect sin renders en cascada.
  const fetchProfile = () =>
    loadProfileData(userId, isOwnProfile)
      .then((data) => {
        setOtherUser(data.user);
        setRecipes(data.recipes);
        setRecipeReviewStats(data.recipeReviewStats);
        setFetchError('');
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setIsLoadingProfile(false));

  // Reintenta lo que haya fallado: las recetas/usuario de este perfil y, en el propio,
  // también el usuario compartido si fue ese el que no cargó.
  const retry = () => {
    setIsLoadingProfile(true);
    if (isOwnProfile && currentUserError) reloadCurrentUser();
    fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isOwnProfile]);

  return {
    user: isOwnProfile ? currentUser : otherUser,
    setUser: isOwnProfile ? updateCurrentUser : setOtherUser,
    recipes,
    recipeReviewStats,
    isLoading: isLoadingProfile || (isOwnProfile && isCurrentUserLoading),
    fetchError: fetchError || (isOwnProfile ? currentUserError : ''),
    retry,
  };
};
