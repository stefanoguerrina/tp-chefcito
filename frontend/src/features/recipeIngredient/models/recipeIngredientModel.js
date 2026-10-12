// Modelo de la feature RecipeIngredient (ingredientes de una receta, con su cantidad):
// mapea la forma cruda que devuelve el backend y arma la que espera el editor de recetas,
// y viceversa. Factory functions simples, como el resto del frontend.

// Convierte un ingrediente de receta crudo (fila de recipeingredient, con su ingredient
// anidado) al objeto que usa el frontend. La cantidad llega como Decimal (texto): se pasa
// a número, o null si es "a gusto".
// Devuelve: { idIngredient, requiredQuantity, ingredient: { id, name, unitOfMeasure } | null }.
export const recipeIngredientFromApi = (item) => ({
  idIngredient: item.idIngredient,
  requiredQuantity: item.requiredQuantity != null ? Number(item.requiredQuantity) : null,
  ingredient: item.ingredient
    ? { id: item.ingredient.id, name: item.ingredient.name, unitOfMeasure: item.ingredient.unitOfMeasure ?? null }
    : null,
});

// Convierte los ingredientes crudos del backend (recipeingredient[], con su
// ingredient anidado) al estado que espera RecipeIngredientsStage.
export const recipeIngredientsToDraft = (recipeIngredients) =>
  (recipeIngredients ?? []).map((item) => ({
    idIngredient: String(item.idIngredient),
    quantity: item.requiredQuantity != null ? String(item.requiredQuantity) : '',
  }));

// Arma el array de ingredientes para PUT /api/recipes/:id/ingredients a partir
// del estado del formulario.
export const recipeIngredientsToPayload = (ingredients) =>
  ingredients.map((item) => ({
    idIngredient: Number(item.idIngredient),
    requiredQuantity: item.quantity ? Number(item.quantity) : undefined,
  }));
