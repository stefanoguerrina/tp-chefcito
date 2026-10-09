// Controller de categoría de ingrediente — maneja las rutas de /api/ingredient-categories.
// Delega toda la lógica de negocio al ingredientCategoryService; solo se encarga de leer
// la request y armar la response HTTP correcta.
import { Request, Response } from 'express';
import * as ingredientCategoryService from '../services/ingredientCategoryService.js';

// Devuelve la lista de todas las categorías de ingrediente.
// GET /api/ingredient-categories
export const searchIngredientCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await ingredientCategoryService.getAllIngredientCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error('[searchIngredientCategories] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Devuelve una categoría de ingrediente por ID.
// GET /api/ingredient-categories/:id
export const getIngredientCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'El ID de la categoría no es válido.' });
      return;
    }

    const category = await ingredientCategoryService.getIngredientCategoryById(id);
    if (!category) {
      res.status(404).json({ message: 'Categoría de ingrediente no encontrada.' });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    console.error('[getIngredientCategoryById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Crea una nueva categoría de ingrediente.
// POST /api/ingredient-categories
export const createIngredientCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const result = await ingredientCategoryService.createIngredientCategory({ name, description });

    if (!result.ok) {
      res.status(409).json({ message: 'Ya existe una categoría de ingrediente con ese nombre.' });
      return;
    }

    res.status(201).json(result.category);
  } catch (error) {
    console.error('[createIngredientCategory] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualiza una categoría de ingrediente existente.
// PATCH /api/ingredient-categories/:id
export const updateIngredientCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    const updated = await ingredientCategoryService.updateIngredientCategory(id, { name, description });
    if (!updated) {
      res.status(404).json({ message: 'Categoría de ingrediente no encontrada.' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('[updateIngredientCategoryById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Elimina una categoría de ingrediente por ID.
// DELETE /api/ingredient-categories/:id
export const deleteIngredientCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'El ID de la categoría no es válido.' });
      return;
    }

    const result = await ingredientCategoryService.deleteIngredientCategory(id);

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Categoría de ingrediente no encontrada.' });
        return;
      }
      res.status(409).json({ message: 'No se puede eliminar: la categoría tiene ingredientes asociados.' });
      return;
    }

    res.status(200).json({ message: 'Categoría de ingrediente eliminada correctamente.' });
  } catch (error) {
    console.error('[deleteIngredientCategoryById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
