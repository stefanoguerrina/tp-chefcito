// Controller de valor nutricional — maneja las rutas anidadas bajo
// /api/ingredients/:idIngredient/nutritional-values.
// Delega toda la lógica de negocio al nutritionalValueService; solo se encarga de leer
// la request y armar la response HTTP correcta.
import { Request, Response } from 'express';
import * as nutritionalValueService from '../services/nutritionalValueService.js';

// Devuelve todos los valores nutricionales de un ingrediente.
// GET /api/ingredients/:idIngredient/nutritional-values
export const searchNutritionalValuesByIngredient = async (req: Request, res: Response): Promise<void> => {
  try {
    const idIngredient = Number(req.params.idIngredient);

    if (isNaN(idIngredient) || idIngredient <= 0) {
      res.status(400).json({ message: 'El ID de ingrediente no es válido.' });
      return;
    }

    const result = await nutritionalValueService.getAllByIngredient(idIngredient);
    if (result === 'ingredient_not_found') {
      res.status(404).json({ message: 'Ingrediente no encontrado.' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    console.error('[searchNutritionalValuesByIngredient] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Devuelve un valor nutricional puntual por su número de secuencia.
// GET /api/ingredients/:idIngredient/nutritional-values/:num
export const getNutritionalValue = async (req: Request, res: Response): Promise<void> => {
  try {
    const idIngredient = Number(req.params.idIngredient);
    const num = Number(req.params.num);

    if (isNaN(idIngredient) || idIngredient <= 0 || isNaN(num) || num <= 0) {
      res.status(400).json({ message: 'Los identificadores enviados no son válidos.' });
      return;
    }

    const nutritionalValue = await nutritionalValueService.getOne(idIngredient, num);
    if (!nutritionalValue) {
      res.status(404).json({ message: 'Valor nutricional no encontrado.' });
      return;
    }

    res.status(200).json(nutritionalValue);
  } catch (error) {
    console.error('[getNutritionalValue] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Crea un nuevo valor nutricional para un ingrediente. El número de secuencia (num)
// se asigna automáticamente en el service/repository.
// POST /api/ingredients/:idIngredient/nutritional-values
export const createNutritionalValue = async (req: Request, res: Response): Promise<void> => {
  try {
    const idIngredient = Number(req.params.idIngredient);
    const { name, servingAmount, servingUnit, value } = req.body;

    const result = await nutritionalValueService.create(idIngredient, { name, servingAmount, servingUnit, value });
    if (!result.ok) {
      res.status(404).json({ message: 'Ingrediente no encontrado.' });
      return;
    }

    res.status(201).json(result.nutritionalValue);
  } catch (error) {
    console.error('[createNutritionalValue] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualiza un valor nutricional existente.
// PATCH /api/ingredients/:idIngredient/nutritional-values/:num
export const updateNutritionalValueByNum = async (req: Request, res: Response): Promise<void> => {
  try {
    const idIngredient = Number(req.params.idIngredient);
    const num = Number(req.params.num);
    const { name, servingAmount, servingUnit, value } = req.body;

    const updated = await nutritionalValueService.update(idIngredient, num, { name, servingAmount, servingUnit, value });
    if (!updated) {
      res.status(404).json({ message: 'Valor nutricional no encontrado.' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('[updateNutritionalValueByNum] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Elimina un valor nutricional por su número de secuencia.
// DELETE /api/ingredients/:idIngredient/nutritional-values/:num
export const deleteNutritionalValueByNum = async (req: Request, res: Response): Promise<void> => {
  try {
    const idIngredient = Number(req.params.idIngredient);
    const num = Number(req.params.num);

    if (isNaN(idIngredient) || idIngredient <= 0 || isNaN(num) || num <= 0) {
      res.status(400).json({ message: 'Los identificadores enviados no son válidos.' });
      return;
    }

    const deleted = await nutritionalValueService.remove(idIngredient, num);
    if (!deleted) {
      res.status(404).json({ message: 'Valor nutricional no encontrado.' });
      return;
    }

    res.status(200).json(deleted);
  } catch (error) {
    console.error('[deleteNutritionalValueByNum] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
