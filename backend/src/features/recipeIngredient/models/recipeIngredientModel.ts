// Tipos e interfaces de dominio para la feature RecipeIngredient.
// Esta capa no tiene lógica: solo describe la forma de los datos.
// RecipeIngredient es una entidad dependiente de Recipe: su clave primaria
// compuesta (idRecipe, idIngredient) no existe sin una receta asociada. Igual
// que Step, los ingredientes de una receta se editan siempre como una lista
// completa (agregar/quitar en el mismo formulario), por eso la única operación
// de escritura es "reemplazar todo el set" en vez de crear/actualizar/borrar
// de a uno. La unidad de medida no se guarda acá: es la que ya tiene el
// ingrediente (`ingredient.unitOfMeasure`), no un dato propio de la receta.

// Un ingrediente de receta tal como lo envía el formulario.
export interface RecipeIngredientInput {
  idIngredient: number;
  requiredQuantity?: number | null;
}
