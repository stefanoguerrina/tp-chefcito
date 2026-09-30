// Controller de receta — maneja las rutas de /api/recipes.
// Delega toda la lógica de negocio al recipeService; solo se encarga de leer
// la request y armar la response HTTP correcta.
import { Response } from 'express';
import { validationResult } from 'express-validator';
import * as recipeService from '../services/recipeService.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';

// Devuelve la lista de recetas con sus categorías, creador e imágenes.
// Con ?userId=N devuelve solo las recetas de ese usuario.
// GET /api/recipes
export const searchRecipes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userIdParam = req.query.userId;
    const idUser = userIdParam !== undefined ? Number(userIdParam) : undefined;

    if (idUser !== undefined && (isNaN(idUser) || idUser <= 0)) {
      res.status(400).json({ message: 'El userId indicado no es válido.' });
      return;
    }

    const recipes = idUser !== undefined
      ? await recipeService.getRecipesByUser(idUser)
      : await recipeService.getAllRecipes();

    if (!recipes || recipes.length === 0) {
      res.status(404).json({ message: 'No se encontraron recetas.' });
      return;
    }
    res.status(200).json(recipes);
  } catch (error) {
    console.error('[searchRecipes] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Devuelve el detalle de una receta: la receta completa, sus valores nutricionales
// (`nutrition`) y, si hay sesión, `viewer` = { isSaved, pantryIngredientIds } del usuario
// logueado (sin sesión, viewer es null: la ruta es pública).
// GET /api/recipes/:id
export const getRecipeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'El ID de receta no es válido.' });
      return;
    }

    const recipe = await recipeService.getRecipeDetail(id, req.user?.id);
    if (!recipe) {
      res.status(404).json({ message: 'Receta no encontrada.' });
      return;
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error('[getRecipeById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Crea una nueva receta para el usuario autenticado. El creador (idUser) sale
// siempre del token, nunca del body. El body espera categoryIds como array
// opcional de IDs (ej. { "name": "Milanesa", "categoryIds": [1, 3] }).
// POST /api/recipes
export const createRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Error de validación.',
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? (e as any).path : 'general', mensaje: e.msg })),
    });
    return;
  }

  try {
    const { name, description, preparationTime, servings, difficulty, categoryIds } = req.body;
    const result = await recipeService.createRecipe(req.user!.id, {
      name,
      description,
      preparationTime,
      servings,
      difficulty,
      categoryIds: categoryIds !== undefined ? (categoryIds as number[]).map(Number) : undefined,
    });

    if (!result.ok) {
      res.status(404).json({ message: 'Una o más categorías indicadas no existen.' });
      return;
    }

    res.status(201).json(result.recipe);
  } catch (error) {
    console.error('[createRecipe] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualiza una receta existente. Solo su dueño o un admin pueden hacerlo.
// Si se envía categoryIds, reemplaza por completo el set de categorías actuales.
// PATCH /api/recipes/:id
export const updateRecipeById = async (req: AuthRequest, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Error de validación.',
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? (e as any).path : 'general', mensaje: e.msg })),
    });
    return;
  }

  try {
    const id = Number(req.params.id);
    const { name, description, preparationTime, servings, difficulty, categoryIds } = req.body;

    const result = await recipeService.updateRecipe(id, req.user!.id, req.user!.isAdmin, {
      name,
      description,
      preparationTime,
      servings,
      difficulty,
      categoryIds: categoryIds !== undefined ? (categoryIds as number[]).map(Number) : undefined,
    });

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Receta no encontrada.' });
        return;
      }
      if (result.reason === 'forbidden') {
        res.status(403).json({ message: 'Acceso denegado. Solo podés modificar tus propias recetas.' });
        return;
      }
      res.status(404).json({ message: 'Una o más categorías indicadas no existen.' });
      return;
    }

    res.status(200).json(result.recipe);
  } catch (error) {
    console.error('[updateRecipeById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Elimina una receta por ID. Solo su dueño o un admin pueden hacerlo.
// DELETE /api/recipes/:id
export const deleteRecipeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'El ID de receta no es válido.' });
      return;
    }

    const result = await recipeService.deleteRecipe(id, req.user!.id, req.user!.isAdmin);

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Receta no encontrada.' });
        return;
      }
      res.status(403).json({ message: 'Acceso denegado. Solo podés eliminar tus propias recetas.' });
      return;
    }

    res.status(200).json({ message: 'Receta eliminada correctamente.' });
  } catch (error) {
    console.error('[deleteRecipeById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
