// Lógica de negocio de la feature Inventory.
// Orquesta el repositorio, aplica reglas y transforma datos para el controller.
// Retorna discriminated unions { ok, reason } para que el controller mapee los HTTP codes.
import { inventoryRepository } from '../repository/inventoryRepository.js';
import prisma from '../../../core/prismaClient.js';
import type { AddInventoryData, UpdateInventoryData } from '../models/inventoryModel.js';

// Devuelve todos los ítems del inventario de un usuario.
// Retorna null si el inventario está vacío.
export async function getUserInventory(idUser: number) {
  const items = await inventoryRepository.findByUser(idUser);
  if (items.length === 0) return null;
  return items;
}

// Agrega un ingrediente al inventario del usuario.
// Flujo:
//   1. Verifica que el ingrediente exista en la tabla global (ingredient).
//   2. Si ya está en el inventario del usuario → 'already_exists' con los datos actuales
//      (el frontend usa esos datos para pre-llenar el modal de edición).
//   3. Si no está → lo crea.
export async function addToInventory(
  idUser: number,
  data: AddInventoryData
): Promise<
  | { ok: true; created: true; item: Awaited<ReturnType<typeof inventoryRepository.create>> }
  | { ok: false; reason: 'ingredient_not_found' }
  | { ok: false; reason: 'already_exists'; current: { availableQuantity: any; unitOfMeasure: string | null } }
> {
  // Verificar que el ingrediente exista en la BD global
  const ingredientExists = await prisma.ingredient.findUnique({
    where: { id: data.idIngredient },
    select: { id: true },
  });
  if (!ingredientExists) return { ok: false, reason: 'ingredient_not_found' };

  // Verificar si ya está en el inventario del usuario
  const existing = await inventoryRepository.findOne(idUser, data.idIngredient);
  if (existing) {
    return {
      ok: false,
      reason: 'already_exists',
      current: {
        availableQuantity: existing.availableQuantity,
        unitOfMeasure: existing.unitOfMeasure,
      },
    };
  }

  const item = await inventoryRepository.create(idUser, data);
  return { ok: true, created: true, item };
}

// Actualiza la cantidad y/o unidad de medida de un ítem del inventario.
// Devuelve 'not_found' si el ítem no existe en el inventario del usuario.
export async function updateInventoryItem(
  idUser: number,
  idIngredient: number,
  data: UpdateInventoryData
): Promise<
  | { ok: true; item: Awaited<ReturnType<typeof inventoryRepository.update>> }
  | { ok: false; reason: 'not_found' }
> {
  const existing = await inventoryRepository.findOne(idUser, idIngredient);
  if (!existing) return { ok: false, reason: 'not_found' };

  const item = await inventoryRepository.update(idUser, idIngredient, data);
  return { ok: true, item };
}

// Elimina un ítem del inventario del usuario.
// Devuelve 'not_found' si no existe.
export async function removeFromInventory(
  idUser: number,
  idIngredient: number
): Promise<{ ok: true } | { ok: false; reason: 'not_found' }> {
  const existing = await inventoryRepository.findOne(idUser, idIngredient);
  if (!existing) return { ok: false, reason: 'not_found' };

  await inventoryRepository.delete(idUser, idIngredient);
  return { ok: true };
}
