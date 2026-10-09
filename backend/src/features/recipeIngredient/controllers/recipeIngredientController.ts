// Controller de recipeIngredient — maneja las rutas anidadas de
// /api/recipes/:idRecipe/ingredients.
// Delega toda la lógica de negocio al recipeIngredientService; solo se encarga
// de leer la request y armar la response HTTP correcta.
import { Response } from 'express';
import * as recipeIngredientService from '../services/recipeIngredientService.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';

// Devuelve los ingredientes de una receta, con nombre y unidad de medida incluidos.
// GET /api/recipes/:idRecipe/ingredients
export const searchRecipeIngredientsByRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);

    if (isNaN(idRecipe) || idRecipe <= 0) {
      res.status(400).json({ message: 'El ID de receta no es válido.' });
      return;
    }

    const items = await recipeIngredientService.getRecipeIngredientsByRecipe(idRecipe);
    if (items === 'recipe_not_found') {
      res.status(404).json({ message: 'Receta no encontrada.' });
      return;
    }

    res.status(200).json(items);
  } catch (error) {
    console.error('[searchRecipeIngredientsByRecipe] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Reemplaza por completo los ingredientes de una receta (solo su dueño o un admin).
// Body: { ingredients: [{ idIngredient, requiredQuantity? }, ...] }.
// PUT /api/recipes/:idRecipe/ingredients
export const replaceRecipeIngredientsForRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);
    const { ingredients } = req.body;

    const result = await recipeIngredientService.replaceRecipeIngredients(
      idRecipe,
      req.user!.id,
      req.user!.isAdmin,
      ingredients
    );

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Receta no encontrada.' });
        return;
      }
      if (result.reason === 'forbidden') {
        res.status(403).json({ message: 'Acceso denegado. Solo podés modificar los ingredientes de tus propias recetas.' });
        return;
      }
      if (result.reason === 'duplicate') {
        res.status(422).json({ message: 'No se puede repetir el mismo ingrediente más de una vez.' });
        return;
      }
      if (result.reason === 'ingredients_not_found') {
        res.status(404).json({ message: 'Uno o más ingredientes indicados no existen.' });
        return;
      }
      res.status(422).json({ message: 'La receta debe tener al menos un ingrediente.' });
      return;
    }

    res.status(200).json(result.recipeIngredients);
  } catch (error) {
    console.error('[replaceRecipeIngredientsForRecipe] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
