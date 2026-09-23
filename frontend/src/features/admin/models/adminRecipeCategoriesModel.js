// Transformaciones puras de la sección "Categorías de Recetas" del panel de
// administración: cuántas recetas tiene cada categoría, el ranking de las más usadas y el
// filtro de la tabla por búsqueda. Sin fetch ni estado (lo maneja useAdminRecipeCategories).

// Cuenta cuántas recetas están vinculadas a cada categoría, recorriendo el
// recipecategory[] que ya viene embebido en cada receta de getAllRecipes() (no hace falta
// un endpoint nuevo: por ser una relación N:M, una categoría puede repetirse en varias recetas).
// Recibe: array de recetas crudas. Devuelve: Map de idCategory -> cantidad de recetas.
export const countRecipesByCategory = (recipes) => {
  const countByCategory = new Map();
  recipes.forEach((recipe) => {
    (recipe.recipecategory ?? []).forEach((link) => {
      const id = link.category?.id ?? link.idCategory;
      if (id === undefined) return;
      countByCategory.set(id, (countByCategory.get(id) ?? 0) + 1);
    });
  });
  return countByCategory;
};

// Ranking de categorías con más recetas, para la tarjeta del dashboard (reutiliza el
// mismo componente AdminTopIngredientsGrid que ya usan Ingredientes y Cat. de Ingredientes).
// Recibe: categorías crudas, el Map de countRecipesByCategory y el máximo de puestos.
// Devuelve: [{ label, value }] ordenado de mayor a menor (solo las que tienen al menos una receta).
export const buildTopCategoriesByRecipeCount = (categories, countByCategory, limit = 3) => {
  return categories
    .map((category) => ({
      label: category.name,
      value: countByCategory.get(category.id) ?? 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

// Distribución de recetas por categoría, para la barra segmentada de la tarjeta "Total de
// categorías" (reutiliza AdminCategoryDistribution, que ya es genérico). A partir del
// puesto maxSegments todo el resto se agrupa en "Otras", mismo criterio que
// buildCategoriesDistribution de Cat. de Ingredientes.
// Devuelve: [{ id, name, count, percent }]. El percent es sobre el total de vínculos
// categoría-receta (no sobre la cantidad de recetas: por la relación N:M una receta puede
// aportar a más de una franja).
export const buildCategoriesDistribution = (categories, countByCategory, maxSegments = 4) => {
  const withCounts = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      count: countByCategory.get(category.id) ?? 0,
    }))
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count);

  const total = withCounts.reduce((sum, category) => sum + category.count, 0);
  if (total === 0) return [];

  const topSegments = withCounts.slice(0, maxSegments);
  const rest = withCounts.slice(maxSegments);
  const restCount = rest.reduce((sum, category) => sum + category.count, 0);

  const segments = [...topSegments];
  if (restCount > 0) segments.push({ id: 'other', name: 'Otras', count: restCount });

  return segments.map((segment) => ({
    ...segment,
    percent: Math.round((segment.count / total) * 100),
  }));
};

// Formatea el id de una categoría de receta como código legible, ej: 3 -> "#CAT-REC-0003"
// (distinto prefijo que formatCategoryCode de ingredientes, para no confundir ids de dos
// tablas distintas que arrancan las dos desde 1).
export const formatCategoryCode = (id) => `#CAT-REC-${String(id).padStart(4, '0')}`;

// Filtra la lista de categorías por nombre (búsqueda case-insensitive, mismo criterio
// simple que el resto de los buscadores del panel).
export const filterCategoriesByQuery = (categories, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return categories;
  return categories.filter((category) => category.name?.toLowerCase().includes(normalized));
};
