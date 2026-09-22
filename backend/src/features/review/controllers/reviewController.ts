// Controller de review — maneja las rutas de /api/recipes/:idRecipe/reviews.
// Delega toda la lógica al reviewService; solo lee la request y arma la response HTTP.
// El idUser siempre sale del token JWT (req.user.id), nunca del body.
// El idRecipe sale del param de la ruta (heredado de recipeRouter como req.params.idRecipe).
import { Response } from 'express';
import * as reviewService from '../services/reviewService.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';

// Devuelve todas las reviews de una receta con el promedio de rating.
// GET /api/recipes/:idRecipe/reviews
export const listReviewsByRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);

    if (isNaN(idRecipe) || idRecipe <= 0) {
      res.status(400).json({ message: 'El ID de receta no es válido.' });
      return;
    }

    const result = await reviewService.getReviewsByRecipe(idRecipe);
    res.status(200).json(result);
  } catch (error) {
    console.error('[listReviewsByRecipe] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Crea una nueva review para el usuario autenticado en la receta indicada.
// POST /api/recipes/:idRecipe/reviews
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);
    const { rating, comment } = req.body;

    if (isNaN(idRecipe) || idRecipe <= 0) {
      res.status(400).json({ message: 'El ID de receta no es válido.' });
      return;
    }

    const result = await reviewService.createReview(req.user!.id, idRecipe, { rating, comment });

    if (!result.ok) {
      if (result.reason === 'recipe_not_found') {
        res.status(404).json({ message: 'Receta no encontrada.' });
        return;
      }
      if (result.reason === 'own_recipe') {
        res.status(403).json({ message: 'No podés reseñar tu propia receta.' });
        return;
      }
      // already_reviewed
      res.status(409).json({ message: 'Ya dejaste una reseña para esta receta.' });
      return;
    }

    res.status(201).json(result.review);
  } catch (error) {
    console.error('[createReview] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualiza una review existente (rating y/o comment). Solo el dueño o un admin.
// PATCH /api/recipes/:idRecipe/reviews/:idReview
export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);
    const idReview = Number(req.params.idReview);
    // El idUser de la review es el del usuario autenticado que la creó.
    // Para editar la tuya propia: idUser = req.user.id.
    // Para que un admin edite la de otro, necesitaría el idUser: lo sacamos del query param.
    // Por simplicidad, asumimos que solo el dueño (o admin sobre su propia) puede editar.
    // El dueño siempre es el usuario autenticado: pasamos req.user.id como idUser de la review.
    const idUser = req.user!.id;
    const { rating, comment } = req.body;

    if (isNaN(idRecipe) || idRecipe <= 0 || isNaN(idReview) || idReview <= 0) {
      res.status(400).json({ message: 'Los IDs indicados no son válidos.' });
      return;
    }

    const result = await reviewService.updateReview(
      idUser, idRecipe, idReview,
      req.user!.id, req.user!.isAdmin,
      { rating, comment }
    );

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Reseña no encontrada.' });
        return;
      }
      res.status(403).json({ message: 'Acceso denegado. Solo podés editar tus propias reseñas.' });
      return;
    }

    res.status(200).json(result.review);
  } catch (error) {
    console.error('[updateReview] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Elimina una review. Solo el dueño o un admin.
// DELETE /api/recipes/:idRecipe/reviews/:idReview
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);
    const idReview = Number(req.params.idReview);
    const idUser = req.user!.id;

    if (isNaN(idRecipe) || idRecipe <= 0 || isNaN(idReview) || idReview <= 0) {
      res.status(400).json({ message: 'Los IDs indicados no son válidos.' });
      return;
    }

    const result = await reviewService.deleteReview(
      idUser, idRecipe, idReview,
      req.user!.id, req.user!.isAdmin
    );

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Reseña no encontrada.' });
        return;
      }
      res.status(403).json({ message: 'Acceso denegado. Solo podés eliminar tus propias reseñas.' });
      return;
    }

    res.status(200).json({ message: 'Reseña eliminada correctamente.' });
  } catch (error) {
    console.error('[deleteReview] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
