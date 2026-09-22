// Modelo de Inventory: factory function que mapea la respuesta cruda del backend
// a un objeto con forma bien definida para usarlo en los componentes.

// Recibe: ítem crudo de la API (con el objeto 'ingredient' anidado).
// Devuelve: un objeto de inventario listo para la UI.
export const inventoryItemFromApi = (raw) => ({
  idIngredient: raw.idIngredient,
  idUser: raw.idUser,
  availableQuantity: raw.availableQuantity !== null ? Number(raw.availableQuantity) : null,
  unitOfMeasure: raw.unitOfMeasure ?? null,
  // Datos del ingrediente aplanados para no tener que navegar raw.ingredient en cada componente
  ingredientName: raw.ingredient?.name ?? '—',
  ingredientBaseUnit: raw.ingredient?.unitOfMeasure ?? null,
  ingredientImagePath: raw.ingredient?.imagePath ?? null,
});
