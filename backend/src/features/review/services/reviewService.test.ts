// Test unitario de las reglas de negocio del CU "Reseñar recetas de otros usuarios"
// (reviewService.createReview). Los repositorios se reemplazan por mocks: así se prueba solo
// la lógica del service, sin base de datos.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReview } from './reviewService.js';
import { reviewRepository } from '../repository/reviewRepository.js';
import { recipeRepository } from '../../recipe/repository/recipeRepository.js';

// vi.mock reemplaza los módulos antes de que reviewService los importe: cada función del
// repositorio pasa a ser un mock al que el test le dice qué devolver.
vi.mock('../repository/reviewRepository.js', () => ({
  reviewRepository: { findByUserAndRecipe: vi.fn(), create: vi.fn() },
}));
vi.mock('../../recipe/repository/recipeRepository.js', () => ({
  recipeRepository: { findById: vi.fn() },
}));

const AUTHOR_ID = 1;
const REVIEWER_ID = 2;
const RECIPE_ID = 10;
const reviewData = { rating: 4.5, comment: 'Muy rica' };

// Le hace devolver al repositorio una receta publicada por AUTHOR_ID. El service solo lee
// idUser, por eso el resto de la fila no hace falta (de ahí el cast).
const mockRecipeByAuthor = () => {
  vi.mocked(recipeRepository.findById).mockResolvedValue(
    { id: RECIPE_ID, idUser: AUTHOR_ID } as Awaited<ReturnType<typeof recipeRepository.findById>>
  );
};

describe('createReview', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('crea la reseña si la receta es de otro usuario y todavía no la reseñó', async () => {
    mockRecipeByAuthor();
    vi.mocked(reviewRepository.findByUserAndRecipe).mockResolvedValue(null);
    const createdReview = { idUser: REVIEWER_ID, idRecipe: RECIPE_ID, idReview: 1, ...reviewData };
    vi.mocked(reviewRepository.create).mockResolvedValue(
      createdReview as unknown as Awaited<ReturnType<typeof reviewRepository.create>>
    );

    const result = await createReview(REVIEWER_ID, RECIPE_ID, reviewData);

    expect(result).toEqual({ ok: true, review: createdReview });
    expect(reviewRepository.create).toHaveBeenCalledWith(REVIEWER_ID, RECIPE_ID, reviewData);
  });

  it('no deja reseñar una receta propia', async () => {
    mockRecipeByAuthor();

    const result = await createReview(AUTHOR_ID, RECIPE_ID, reviewData);

    expect(result).toEqual({ ok: false, reason: 'own_recipe' });
    expect(reviewRepository.create).not.toHaveBeenCalled();
  });

  it('no deja reseñar dos veces la misma receta', async () => {
    mockRecipeByAuthor();
    vi.mocked(reviewRepository.findByUserAndRecipe).mockResolvedValue(
      { idReview: 1 } as Awaited<ReturnType<typeof reviewRepository.findByUserAndRecipe>>
    );

    const result = await createReview(REVIEWER_ID, RECIPE_ID, reviewData);

    expect(result).toEqual({ ok: false, reason: 'already_reviewed' });
    expect(reviewRepository.create).not.toHaveBeenCalled();
  });

  it('responde recipe_not_found si la receta no existe', async () => {
    vi.mocked(recipeRepository.findById).mockResolvedValue(null);

    const result = await createReview(REVIEWER_ID, RECIPE_ID, reviewData);

    expect(result).toEqual({ ok: false, reason: 'recipe_not_found' });
    expect(reviewRepository.findByUserAndRecipe).not.toHaveBeenCalled();
  });
});
