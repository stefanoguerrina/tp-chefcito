// Controller de step — maneja las rutas anidadas de /api/recipes/:idRecipe/steps.
// Delega toda la lógica de negocio al stepService; solo se encarga de leer
// la request y armar la response HTTP correcta.
import { Response } from 'express';
import * as stepService from '../services/stepService.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';

// Devuelve los pasos de una receta, ordenados.
// GET /api/recipes/:idRecipe/steps
export const handleSearchStepsByRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);

    if (isNaN(idRecipe) || idRecipe <= 0) {
      res.status(400).json({ message: 'El ID de receta no es válido.' });
      return;
    }

    const steps = await stepService.getStepsByRecipe(idRecipe);
    if (steps === 'recipe_not_found') {
      res.status(404).json({ message: 'Receta no encontrada.' });
      return;
    }

    res.status(200).json(steps);
  } catch (error) {
    console.error('[handleSearchStepsByRecipe] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Reemplaza por completo los pasos de una receta (solo su dueño o un admin).
// Body: { steps: [{ instruction, estimatedTime? }, ...] }, en el orden final deseado.
// PUT /api/recipes/:idRecipe/steps
export const handleReplaceStepsForRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);
    const { steps } = req.body;

    const result = await stepService.replaceSteps(idRecipe, req.user!.id, req.user!.isAdmin, steps);

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Receta no encontrada.' });
        return;
      }
      if (result.reason === 'forbidden') {
        res.status(403).json({ message: 'Acceso denegado. Solo podés modificar los pasos de tus propias recetas.' });
        return;
      }
      res.status(422).json({ message: 'La receta debe tener al menos un paso.' });
      return;
    }

    res.status(200).json(result.steps);
  } catch (error) {
    console.error('[handleReplaceStepsForRecipe] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
