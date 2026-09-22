// Acceso a datos de la feature Inventory: única capa que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de inventoryService.
import prisma from '../../../core/prismaClient.js';
import type { AddInventoryData, UpdateInventoryData } from '../models/inventoryModel.js';

export const inventoryRepository = {

  // Devuelve todos los ítems del inventario de un usuario, incluyendo los datos
  // del ingrediente (nombre, unidad de medida base) para mostrarlos en la UI.
  findByUser: (idUser: number) =>
    prisma.inventory.findMany({
      where: { idUser },
      include: {
        ingredient: {
          select: { id: true, name: true, unitOfMeasure: true, imagePath: true },
        },
      },
      orderBy: { ingredient: { name: 'asc' } },
    }),

  // Busca un ítem específico del inventario por la PK compuesta (idUser, idIngredient).
  findOne: (idUser: number, idIngredient: number) =>
    prisma.inventory.findUnique({
      where: { idUser_idIngredient: { idUser, idIngredient } },
      include: {
        ingredient: {
          select: { id: true, name: true, unitOfMeasure: true },
        },
      },
    }),

  // Crea un nuevo ítem en el inventario. Solo se llama cuando se sabe que
  // el ingrediente NO está aún en el inventario del usuario (verificado en el service).
  create: (idUser: number, data: AddInventoryData) =>
    prisma.inventory.create({
      data: {
        idUser,
        idIngredient: data.idIngredient,
        availableQuantity: data.availableQuantity,
        unitOfMeasure: data.unitOfMeasure ?? null,
      },
      include: {
        ingredient: {
          select: { id: true, name: true, unitOfMeasure: true },
        },
      },
    }),

  // Actualiza los campos de un ítem de inventario existente.
  // Recibe solo los campos a modificar (partial update).
  update: (idUser: number, idIngredient: number, data: UpdateInventoryData) =>
    prisma.inventory.update({
      where: { idUser_idIngredient: { idUser, idIngredient } },
      data: {
        ...(data.availableQuantity !== undefined && { availableQuantity: data.availableQuantity }),
        ...(data.unitOfMeasure !== undefined && { unitOfMeasure: data.unitOfMeasure }),
      },
      include: {
        ingredient: {
          select: { id: true, name: true, unitOfMeasure: true },
        },
      },
    }),

  // Elimina un ítem del inventario por la PK compuesta.
  delete: (idUser: number, idIngredient: number) =>
    prisma.inventory.delete({
      where: { idUser_idIngredient: { idUser, idIngredient } },
    }),

};
