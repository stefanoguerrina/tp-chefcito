// Hook que trae el promedio de valoraciones y la cantidad de reseñas de cada receta de
// una lista, para mostrarlos en su card (RecipeCard/HomeRecipeCard). El backend solo
// expone las reseñas por receta individual (no un agregado para una lista completa), así
// que se piden todas en paralelo. Mismo patrón que ya usa useProfileData para las
// recetas propias del perfil.
import { useState, useEffect } from 'react';
import { getReviewsByRecipe } from '../services/reviewService.js';

// Recibe: recipeIds (array de ids de receta). Devuelve: { [idReceta]: { averageRating,
// reviewsCount } }. Mientras carga (o si una receta todavía no tiene reseñas), esa
// entrada no está en el objeto y la card muestra "Sin reseñas".
export const useRecipeReviewStats = (recipeIds) => {
  const [statsByRecipeId, setStatsByRecipeId] = useState({});
  // Clave estable de la lista de ids: evita volver a pedir las reseñas en cada render
  // aunque el array de recetas sea una referencia nueva (ej. se recalcula en el padre).
  const recipeIdsKey = recipeIds.join(',');

  // El estado se actualiza solo dentro del callback de la promesa (incluso con la lista
  // vacía, Promise.all([]) resuelve igual por microtask), así se puede llamar sin
  // renders en cascada.
  useEffect(() => {
    let isCancelled = false;
    const ids = recipeIdsKey ? recipeIdsKey.split(',').map(Number) : [];

    // Si falla el pedido de reseñas de una receta puntual, esa receta queda sin
    // valoración en vez de romper la lista entera.
    Promise.all(ids.map((id) => getReviewsByRecipe(id).catch(() => ({ reviews: [], averageRating: null }))))
      .then((results) => {
        if (isCancelled) return;
        const next = {};
        ids.forEach((id, index) => {
          next[id] = {
            averageRating: results[index].averageRating ?? 0,
            reviewsCount: results[index].reviews.length,
          };
        });
        setStatsByRecipeId(next);
      });

    return () => {
      isCancelled = true;
    };
  }, [recipeIdsKey]);

  return statsByRecipeId;
};
