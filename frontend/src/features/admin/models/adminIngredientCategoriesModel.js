// Transformaciones puras propias de la sección "Categorías de Ingredientes" del panel de
// administración. Lo que comparte con "Categorías de Recetas" (ranking, distribución,
// filtro) está en adminCategoriesModel.js.

// Cuántos ingredientes tiene cada categoría. El backend ya lo cuenta en el listado (ver
// ingredientCategoryFromApi): así no hace falta pedir todos los ingredientes solo para contar.
// Recibe: categorías (ingredientCategoryFromApi). Devuelve: Map idCategory -> cantidad.
export const countIngredientsByCategory = (categories) =>
  new Map(categories.map((category) => [category.id, category.ingredientsCount]));

// Formatea el id de una categoría como código legible, ej: 3 -> "#CAT-0003".
export const formatCategoryCode = (id) => `#CAT-${String(id).padStart(4, '0')}`;
