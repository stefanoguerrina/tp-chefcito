// Controller de Inventory — maneja las rutas de /api/users/:userId/inventory.
// Solo lee la request y arma la response HTTP; delega toda la lógica al inventoryService.
import { Request, Response } from 'express';
import * as inventoryService from '../services/inventoryService.js';

// Devuelve todos los ítems del inventario de un usuario.
// GET /api/users/:userId/inventory
export const getInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const idUser = Number(req.params.userId);

    if (isNaN(idUser) || idUser <= 0) {
      res.status(400).json({ message: 'El ID de usuario no es válido.' });
      return;
    }

    const items = await inventoryService.getUserInventory(idUser);
    if (!items) {
      res.status(404).json({ message: 'El inventario está vacío.' });
      return;
    }

    res.status(200).json(items);
  } catch (error) {
    console.error('[getInventory] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Agrega un ingrediente al inventario del usuario.
// Si el ingrediente ya está en el inventario devuelve 409 con los datos actuales,
// para que el frontend los use para pre-llenar el modal de edición de cantidad.
// POST /api/users/:userId/inventory
export const addToInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const idUser = Number(req.params.userId);
    const { idIngredient, availableQuantity, unitOfMeasure } = req.body;

    const result = await inventoryService.addToInventory(idUser, {
      idIngredient: Number(idIngredient),
      availableQuantity: Number(availableQuantity),
      unitOfMeasure: unitOfMeasure ?? null,
    });

    if (!result.ok) {
      if (result.reason === 'ingredient_not_found') {
        res.status(404).json({ message: 'El ingrediente indicado no existe.' });
        return;
      }
      // already_exists: incluimos los datos actuales para que el frontend pre-llene el modal
      res.status(409).json({
        message: 'El ingrediente ya está en tu inventario.',
        reason: 'already_exists',
        current: (result as any).current,
      });
      return;
    }

    res.status(201).json(result.item);
  } catch (error) {
    console.error('[addToInventory] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualiza la cantidad y/o unidad de un ítem del inventario existente.
// PATCH /api/users/:userId/inventory/:ingredientId
export const updateInventoryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const idUser = Number(req.params.userId);
    const idIngredient = Number(req.params.ingredientId);
    const { availableQuantity, unitOfMeasure } = req.body;

    const result = await inventoryService.updateInventoryItem(idUser, idIngredient, {
      availableQuantity: availableQuantity !== undefined ? Number(availableQuantity) : undefined,
      unitOfMeasure: unitOfMeasure,
    });

    if (!result.ok) {
      res.status(404).json({ message: 'El ingrediente no se encuentra en tu inventario.' });
      return;
    }

    res.status(200).json(result.item);
  } catch (error) {
    console.error('[updateInventoryItem] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Elimina un ingrediente del inventario del usuario.
// DELETE /api/users/:userId/inventory/:ingredientId
export const removeFromInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const idUser = Number(req.params.userId);
    const idIngredient = Number(req.params.ingredientId);

    const result = await inventoryService.removeFromInventory(idUser, idIngredient);

    if (!result.ok) {
      res.status(404).json({ message: 'El ingrediente no se encuentra en tu inventario.' });
      return;
    }

    res.status(200).json({ message: 'Ingrediente eliminado del inventario correctamente.' });
  } catch (error) {
    console.error('[removeFromInventory] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
