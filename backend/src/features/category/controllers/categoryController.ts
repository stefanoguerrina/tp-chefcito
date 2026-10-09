// Controller de categoría — maneja las rutas GET, POST, PATCH y DELETE de /api/categories.
// Delega toda la lógica de negocio al categoryService; solo se encarga de leer la request
// y armar la response HTTP correcta.
import { Request, Response } from 'express';
import * as categoryService from '../services/categoryService.js';

// Devuelve la lista de todas las categorías existentes.
// GET /api/categories — devuelve todas las categorías (requiere token de usuario)
export const searchCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error('[searchCategories] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Busca una categoría por su nombre exacto, recibido como parámetro en la URL.
// GET /api/categories/name/:name — devuelve una categoría por nombre (requiere token de usuario)
export const getCategoryByName = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = String(req.params.name);
    const category = await categoryService.getCategoryByName(name);
    if (!category) {
      res.status(404).json({ message: 'Categoría no encontrada.' });
      return;
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('[getCategoryByName] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Crea una nueva categoría a partir del body (name, description).
// Solo un admin puede realizar esta acción (controlado por verifyAdmin en el router).
// Devuelve 201 con la categoría creada, 409 si ya existe una con el mismo nombre, 422 si los datos son inválidos.
// POST /api/categories — crea una categoría (solo admin)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const result = await categoryService.createCategory({ name, description });

    if (!result.ok) {
      // result.reason === 'duplicate'
      res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' });
      return;
    }

    res.status(201).json(result.category);
  } catch (error) {
    console.error('[createCategory] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualiza los datos editables de una categoría (name, description).
// Solo un admin puede realizar esta acción (controlado por verifyAdmin en el router).
// Devuelve 200 con los datos actualizados, 404 si no existe, 409 si el nuevo nombre ya está en uso, 422 si los datos son inválidos.
// PATCH /api/categories/:id — actualiza una categoría (solo admin)
export const updateCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = Number(req.params.id);
    const { name, description } = req.body;

    const updated = await categoryService.updateCategory(categoryId, { name, description });

    if (updated === null) {
      res.status(404).json({ message: 'Categoría no encontrada.' });
      return;
    }
    if (updated === 'duplicate') {
      res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error('[updateCategoryById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Elimina definitivamente una categoría por ID (la tabla category no tiene baja lógica).
// Solo un admin puede realizar esta acción (controlado por verifyAdmin en el router).
// Recibe el ID como parámetro en la URL.
// Devuelve 200 con los datos de la categoría eliminada, 404 si no existe, 400 si el ID es inválido.
// DELETE /api/categories/:id — elimina una categoría (solo admin)
export const deleteCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = Number(req.params.id);

    if (isNaN(categoryId) || categoryId <= 0) {
      res.status(400).json({ message: 'El ID de categoría no es válido.' });
      return;
    }

    const deletedCategory = await categoryService.deleteCategory(categoryId);
    if (!deletedCategory) {
      res.status(404).json({ message: 'Categoría no encontrada.' });
      return;
    }

    res.status(200).json(deletedCategory);
  } catch (error) {
    console.error('[deleteCategoryById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
