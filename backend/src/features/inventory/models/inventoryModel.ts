// Tipos de dominio para la feature Inventory.
// Esta capa no tiene lógica: solo describe la forma de los datos que fluyen
// entre el controller, el service y el repository.

// Datos necesarios para agregar un ingrediente al inventario de un usuario.
export interface AddInventoryData {
  idIngredient: number;
  availableQuantity: number;
  unitOfMeasure?: string | null;
}

// Campos que se pueden modificar de un ítem de inventario existente.
// Al menos uno debe estar presente (validado en el middleware).
export interface UpdateInventoryData {
  availableQuantity?: number;
  unitOfMeasure?: string | null;
}
