// Transformaciones puras propias de la sección "Categorías de Recetas" del panel de
// administración. Lo que comparte con "Categorías de Ingredientes" (ranking, distribución,
// filtro) está en adminCategoriesModel.js.

// Cuántas recetas tiene cada categoría. El backend ya lo cuenta en el listado (ver
// categoryFromApi): así no hace falta pedir todas las recetas solo para contar.
// Recibe: categorías (categoryFromApi). Devuelve: Map de idCategory -> cantidad de recetas.
export const countRecipesByCategory = (categories) =>
  new Map(categories.map((category) => [category.id, category.recipesCount]));

// Formatea el id de una categoría de receta como código legible, ej: 3 -> "#CAT-REC-0003"
// (distinto prefijo que formatCategoryCode de ingredientes, para no confundir ids de dos
// tablas distintas que arrancan las dos desde 1).
export const formatCategoryCode = (id) => `#CAT-REC-${String(id).padStart(4, '0')}`;
