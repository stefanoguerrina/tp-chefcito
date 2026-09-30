// Transformaciones puras de la sección "Categorías de Ingredientes" del panel de
// administración: cuántos ingredientes tiene cada categoría, el ranking de las más usadas
// y el filtro de la tabla por búsqueda. Sin fetch ni estado (lo maneja
// useAdminIngredientCategories).

// Cuántos ingredientes tiene cada categoría. El backend ya lo cuenta y lo manda en cada
// categoría (_count.ingredientcategoryingredient): así no hace falta pedir todos los
// ingredientes solo para contar.
// Recibe: categorías crudas. Devuelve: Map de idCategory -> cantidad de ingredientes.
export const countIngredientsByCategory = (categories) =>
  new Map(categories.map((category) => [category.id, category._count?.ingredientcategoryingredient ?? 0]));

// Ranking de categorías con más ingredientes, para la tarjeta del dashboard (reutiliza el
// mismo componente AdminTopIngredientsGrid que ya usa la sección de Ingredientes).
// Recibe: categorías crudas, el Map de countIngredientsByCategory y el máximo de puestos.
// Devuelve: [{ label, value }] ordenado de mayor a menor (solo las que tienen al menos un ingrediente).
export const buildTopCategoriesByIngredientCount = (categories, countByCategory, limit = 3) => {
  return categories
    .map((category) => ({
      label: category.name,
      value: countByCategory.get(category.id) ?? 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

// Distribución de ingredientes por categoría, para la barra segmentada de la tarjeta
// "Total de categorías" (reutiliza AdminCategoryDistribution, que ya es genérico). A
// partir del puesto maxSegments todo el resto se agrupa en "Otras", mismo criterio que
// buildCategoryDistribution de Ingredientes.
// Devuelve: [{ id, name, count, percent }]. El percent es sobre el total de vínculos
// categoría-ingrediente (no sobre la cantidad de ingredientes: por la relación N:M un
// ingrediente puede aportar a más de una franja).
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

// Formatea el id de una categoría como código legible, ej: 3 -> "#CAT-0003".
export const formatCategoryCode = (id) => `#CAT-${String(id).padStart(4, '0')}`;

// Filtra la lista de categorías por nombre (búsqueda case-insensitive, mismo criterio
// simple que filterIngredientsByQuery).
export const filterCategoriesByQuery = (categories, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return categories;
  return categories.filter((category) => category.name?.toLowerCase().includes(normalized));
};
