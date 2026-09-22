// Controller de userRecipe — maneja las rutas de /api/recipes/:idRecipe/save
// y /api/saved-recipes/:idUser. Delega toda la lógica al userRecipeService; solo
// lee la request y arma la response HTTP.
// El idUser siempre sale del token JWT (req.user.id), nunca del body.
import { Response } from 'express';
import * as userRecipeService from '../services/userRecipeService.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';

// Devuelve las recetas guardadas por un usuario. Solo el propio usuario o un admin.
// GET /api/saved-recipes/:idUser
export const listSavedRecipesByUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idUser = Number(req.params.idUser);

    if (isNaN(idUser) || idUser <= 0) {
      res.status(400).json({ message: 'El ID de usuario no es válido.' });
      return;
    }

    if (req.user!.id !== idUser && !req.user!.isAdmin) {
      res.status(403).json({ message: 'Acceso denegado. Solo podés ver tus propias recetas guardadas.' });
      return;
    }

    const savedRecipes = await userRecipeService.getSavedRecipesByUser(idUser);
    res.status(200).json(savedRecipes);
  } catch (error) {
    console.error('[listSavedRecipesByUser] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Devuelve el estado de guardado del usuario autenticado para una receta.
// GET /api/recipes/:idRecipe/save
export const getUserRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);

    if (isNaN(idRecipe) || idRecipe <= 0) {
      res.status(400).json({ message: 'El ID de receta no es válido.' });
      return;
    }

    const result = await userRecipeService.getUserRecipe(req.user!.id, idRecipe);

    if (!result.ok) {
      res.status(404).json({ message: 'No guardaste esta receta.' });
      return;
    }

    res.status(200).json(result.userRecipe);
  } catch (error) {
    console.error('[getUserRecipe] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Guarda una receta para el usuario autenticado.
// POST /api/recipes/:idRecipe/save
export const createUserRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);
    // El body es opcional: "guardar receta" no requiere enviar ningún campo.
    const { isSaved } = req.body ?? {};

    if (isNaN(idRecipe) || idRecipe <= 0) {
      res.status(400).json({ message: 'El ID de receta no es válido.' });
      return;
    }

    const result = await userRecipeService.createUserRecipe(req.user!.id, idRecipe, { isSaved });

    if (!result.ok) {
      if (result.reason === 'recipe_not_found') {
        res.status(404).json({ message: 'Receta no encontrada.' });
        return;
      }
      // already_saved
      res.status(409).json({ message: 'Ya guardaste esta receta.' });
      return;
    }

    res.status(201).json(result.userRecipe);
  } catch (error) {
    console.error('[createUserRecipe] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualiza el estado de guardado (isSaved) para el usuario autenticado.
// PATCH /api/recipes/:idRecipe/save
export const updateUserRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);
    const { isSaved } = req.body;

    if (isNaN(idRecipe) || idRecipe <= 0) {
      res.status(400).json({ message: 'El ID de receta no es válido.' });
      return;
    }

    const result = await userRecipeService.updateUserRecipe(req.user!.id, idRecipe, { isSaved });

    if (!result.ok) {
      res.status(404).json({ message: 'No guardaste esta receta.' });
      return;
    }

    res.status(200).json(result.userRecipe);
  } catch (error) {
    console.error('[updateUserRecipe] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Elimina por completo el guardado de una receta para el usuario autenticado.
// DELETE /api/recipes/:idRecipe/save
export const deleteUserRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);

    if (isNaN(idRecipe) || idRecipe <= 0) {
      res.status(400).json({ message: 'El ID de receta no es válido.' });
      return;
    }

    const result = await userRecipeService.deleteUserRecipe(req.user!.id, idRecipe);

    if (!result.ok) {
      res.status(404).json({ message: 'No guardaste esta receta.' });
      return;
    }

    res.status(200).json({ message: 'Receta eliminada de guardados correctamente.' });
  } catch (error) {
    console.error('[deleteUserRecipe] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
