// Controller de ingrediente — maneja las rutas de /api/ingredients.
// Delega toda la lógica de negocio al ingredientService; solo se encarga de leer
// la request y armar la response HTTP correcta.
import { Request, Response } from 'express';
import * as ingredientService from '../services/ingredientService.js';
import { toPublicPath, deleteLocalUpload } from '../../../core/fileStorage.js';
import { INGREDIENT_IMAGES_FOLDER } from '../middleware/ingredientImageUploadMiddleware.js';
import type { CreateNutritionalValueData } from '../../nutritionalValue/models/nutritionalValueModel.js';

// El nombre de un ingrediente es único: el 409 indica el campo para que el formulario
// muestre el error debajo del nombre (mismo formato que los de validación).
const DUPLICATE_NAME_MESSAGE = 'Ya existe un ingrediente con ese nombre.';

// Normaliza los valores nutricionales que llegan en el body (ya validados): los números
// pueden venir como texto y los campos vacíos se guardan como null.
// Recibe: el array crudo del body (o undefined). Devuelve: el array listo para el service.
const parseNutritionalValues = (raw: unknown): CreateNutritionalValueData[] | undefined => {
  if (!Array.isArray(raw)) return undefined;
  const toNumberOrNull = (value: unknown) =>
    value === undefined || value === null || value === '' ? null : Number(value);
  return raw.map((item) => ({
    name: String(item.name).trim(),
    servingAmount: toNumberOrNull(item.servingAmount),
    servingUnit: item.servingUnit ? String(item.servingUnit).trim() : null,
    value: toNumberOrNull(item.value),
  }));
};

// Devuelve la lista de todos los ingredientes con sus categorías.
// GET /api/ingredients
export const searchIngredients = async (req: Request, res: Response): Promise<void> => {
  try {
    const ingredients = await ingredientService.getAllIngredients();
    res.status(200).json(ingredients);
  } catch (error) {
    console.error('[searchIngredients] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Devuelve un ingrediente por ID.
// GET /api/ingredients/:id
export const getIngredientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'El ID de ingrediente no es válido.' });
      return;
    }

    const ingredient = await ingredientService.getIngredientById(id);
    if (!ingredient) {
      res.status(404).json({ message: 'Ingrediente no encontrado.' });
      return;
    }

    res.status(200).json(ingredient);
  } catch (error) {
    console.error('[getIngredientById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Crea un nuevo ingrediente. El body espera categoryIds como array de IDs
// (ej. { "categoryIds": [1, 3], "name": "Tomate" }) y, opcionalmente, nutritionalValues
// ([{ name, servingAmount, servingUnit, value }]). La foto se sube aparte (PATCH /:id/image).
// POST /api/ingredients
export const createIngredient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryIds, name, description, unitOfMeasure, imagePath, nutritionalValues } = req.body;
    const result = await ingredientService.createIngredient({
      categoryIds: (categoryIds as number[]).map(Number),
      name,
      description,
      unitOfMeasure,
      imagePath,
      nutritionalValues: parseNutritionalValues(nutritionalValues),
    });

    if (!result.ok) {
      if (result.reason === 'categories_not_found') {
        res.status(404).json({ message: 'Una o más categorías de ingrediente indicadas no existen.' });
        return;
      }
      res.status(409).json({ message: DUPLICATE_NAME_MESSAGE, errors: [{ campo: 'name', mensaje: DUPLICATE_NAME_MESSAGE }] });
      return;
    }

    res.status(201).json(result.ingredient);
  } catch (error) {
    console.error('[createIngredient] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualiza un ingrediente existente. Si se envía categoryIds o nutritionalValues,
// reemplaza por completo ese set.
// PATCH /api/ingredients/:id
export const updateIngredientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { categoryIds, name, description, unitOfMeasure, imagePath, nutritionalValues } = req.body;

    const result = await ingredientService.updateIngredient(id, {
      categoryIds: categoryIds !== undefined ? (categoryIds as number[]).map(Number) : undefined,
      name,
      description,
      unitOfMeasure,
      imagePath,
      nutritionalValues: parseNutritionalValues(nutritionalValues),
    });

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Ingrediente no encontrado.' });
        return;
      }
      if (result.reason === 'duplicate_name') {
        res.status(409).json({ message: DUPLICATE_NAME_MESSAGE, errors: [{ campo: 'name', mensaje: DUPLICATE_NAME_MESSAGE }] });
        return;
      }
      res.status(404).json({ message: 'Una o más categorías de ingrediente indicadas no existen.' });
      return;
    }

    res.status(200).json(result.ingredient);
  } catch (error) {
    console.error('[updateIngredientById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Elimina un ingrediente por ID.
// DELETE /api/ingredients/:id
export const deleteIngredientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'El ID de ingrediente no es válido.' });
      return;
    }

    const result = await ingredientService.deleteIngredient(id);

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Ingrediente no encontrado.' });
        return;
      }
      res.status(409).json({ message: 'No se puede eliminar: el ingrediente está en uso en recetas o en el inventario de algún usuario.' });
      return;
    }

    res.status(200).json({ message: 'Ingrediente eliminado correctamente.' });
  } catch (error) {
    console.error('[deleteIngredientById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Sube (o reemplaza) la foto de un ingrediente. Body: multipart con el archivo en "image"
// (ya guardado en disco por uploadIngredientImage).
// PATCH /api/ingredients/:id/image
export const uploadIngredientImageHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(422).json({
      message: 'Error de validación. Revisá los campos enviados.',
      errors: [{ campo: 'image', mensaje: 'Tenés que enviar una imagen.' }],
    });
    return;
  }

  const imagePath = toPublicPath(INGREDIENT_IMAGES_FOLDER, req.file.filename);
  try {
    const result = await ingredientService.setIngredientImage(Number(req.params.id), imagePath);
    if (!result.ok) {
      // No se guardó en ningún lado: se borra para no dejar un archivo huérfano.
      await deleteLocalUpload(imagePath);
      res.status(404).json({ message: 'Ingrediente no encontrado.' });
      return;
    }
    res.status(200).json(result.ingredient);
  } catch (error) {
    await deleteLocalUpload(imagePath);
    console.error('[uploadIngredientImage] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Quita la foto de un ingrediente (vuelve al ícono genérico).
// DELETE /api/ingredients/:id/image
export const deleteIngredientImageHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ingredientService.removeIngredientImage(Number(req.params.id));
    if (!result.ok) {
      res.status(404).json({ message: 'Ingrediente no encontrado.' });
      return;
    }
    res.status(200).json(result.ingredient);
  } catch (error) {
    console.error('[deleteIngredientImage] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
