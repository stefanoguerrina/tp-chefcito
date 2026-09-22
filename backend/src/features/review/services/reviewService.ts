// Lógica de negocio de la feature review.
// Orquesta el repositorio, aplica reglas de autorización y calcula el promedio
// de rating. El controller solo llama funciones de este archivo.
import { reviewRepository } from '../repository/reviewRepository.js';
import { recipeRepository } from '../../recipe/repository/recipeRepository.js';
import type { CreateReviewData, UpdateReviewData } from '../models/reviewModel.js';

// Devuelve todas las reviews de una receta junto con el promedio de rating.
// El promedio es null si no hay reviews.
export async function getReviewsByRecipe(idRecipe: number) {
  const reviews = await reviewRepository.findAllByRecipe(idRecipe);

  const averageRating =
    reviews.length > 0
      ? parseFloat(
          (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)
        )
      : null;

  return { reviews, averageRating };
}

// Crea una review para el usuario autenticado en una receta.
// Reglas de negocio:
//   - La receta debe existir.
//   - El usuario no puede reseñar su propia receta.
//   - Solo se permite 1 review por (idUser, idRecipe).
export async function createReview(
  idUser: number,
  idRecipe: number,
  data: CreateReviewData
): Promise<
  | { ok: true; review: Awaited<ReturnType<typeof reviewRepository.create>> }
  | { ok: false; reason: 'recipe_not_found' | 'own_recipe' | 'already_reviewed' }
> {
  const recipe = await recipeRepository.findById(idRecipe);
  if (!recipe) return { ok: false, reason: 'recipe_not_found' };

  if (recipe.idUser === idUser) return { ok: false, reason: 'own_recipe' };

  const existing = await reviewRepository.findByUserAndRecipe(idUser, idRecipe);
  if (existing) return { ok: false, reason: 'already_reviewed' };

  const review = await reviewRepository.create(idUser, idRecipe, data);
  return { ok: true, review };
}

// Actualiza una review existente. Solo puede hacerlo su autor o un admin.
export async function updateReview(
  idUser: number,
  idRecipe: number,
  idReview: number,
  requestingUserId: number,
  isAdmin: boolean,
  data: UpdateReviewData
): Promise<
  | { ok: true; review: Awaited<ReturnType<typeof reviewRepository.update>> }
  | { ok: false; reason: 'not_found' | 'forbidden' }
> {
  const existing = await reviewRepository.findOne(idUser, idRecipe, idReview);
  if (!existing) return { ok: false, reason: 'not_found' };

  // Solo el dueño de la review o un admin pueden editarla.
  if (existing.idUser !== requestingUserId && !isAdmin) {
    return { ok: false, reason: 'forbidden' };
  }

  const review = await reviewRepository.update(idUser, idRecipe, idReview, data);
  return { ok: true, review };
}

// Elimina una review. Solo puede hacerlo su autor o un admin.
export async function deleteReview(
  idUser: number,
  idRecipe: number,
  idReview: number,
  requestingUserId: number,
  isAdmin: boolean
): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'forbidden' }> {
  const existing = await reviewRepository.findOne(idUser, idRecipe, idReview);
  if (!existing) return { ok: false, reason: 'not_found' };

  if (existing.idUser !== requestingUserId && !isAdmin) {
    return { ok: false, reason: 'forbidden' };
  }

  await reviewRepository.delete(idUser, idRecipe, idReview);
  return { ok: true };
}
