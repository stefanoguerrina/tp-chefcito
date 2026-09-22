// Servicio de reviews: centraliza las llamadas HTTP al backend para la feature review.
// Las lecturas son públicas (fetch directo); crear, editar y borrar usan apiFetch (token JWT).
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { reviewFromApi } from '../models/reviewModel.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Devuelve { reviews, averageRating } de la receta indicada (lectura pública).
// Recibe: idRecipe (number).
export const getReviewsByRecipe = async (idRecipe) => {
  const response = await fetch(`${API_BASE_URL}/recipes/${idRecipe}/reviews`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Error del servidor (${response.status}).`);
  }
  const data = await response.json();
  return {
    reviews: (data.reviews ?? []).map(reviewFromApi),
    averageRating: data.averageRating,
  };
};

// Crea una review para el usuario autenticado en la receta indicada.
// Recibe: idRecipe (number), payload { rating, comment? }.
// Devuelve la review creada.
export const createReview = async (idRecipe, payload) => {
  const raw = await apiFetch(`/recipes/${idRecipe}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return reviewFromApi(raw);
};

// Actualiza una review existente del usuario autenticado.
// Recibe: idRecipe, idReview, payload { rating?, comment? }.
export const updateReview = async (idRecipe, idReview, payload) => {
  const raw = await apiFetch(`/recipes/${idRecipe}/reviews/${idReview}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return reviewFromApi(raw);
};

// Elimina una review del usuario autenticado.
// Recibe: idRecipe, idReview.
export const deleteReview = async (idRecipe, idReview) => {
  return apiFetch(`/recipes/${idRecipe}/reviews/${idReview}`, {
    method: 'DELETE',
  });
};
