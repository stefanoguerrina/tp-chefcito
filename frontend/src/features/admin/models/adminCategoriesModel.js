// Transformaciones puras que comparten las dos secciones de categorías del panel admin
// (de receta y de ingrediente): ranking, distribución y filtro de la tabla. Cada sección
// arma antes su Map idCategory -> cantidad (recetas o ingredientes) con su propio modelo.
// Sin fetch ni estado.

// Ranking de categorías con más elementos asociados, para la tarjeta "Top" del dashboard
// (lo muestra AdminTopIngredientsGrid).
// Recibe: categorías crudas, el Map idCategory -> cantidad y el máximo de puestos.
// Devuelve: [{ label, value }] ordenado de mayor a menor (solo las que tienen al menos uno).
export const buildTopCategoriesByCount = (categories, countByCategory, limit = 3) => {
  return categories
    .map((category) => ({
      label: category.name,
      value: countByCategory.get(category.id) ?? 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

// Distribución de elementos por categoría, para la barra segmentada de la tarjeta "Total de
// categorías" (AdminCategoryDistribution). A partir del puesto maxSegments todo el resto se
// agrupa en "Otras".
// Devuelve: [{ id, name, count, percent }]. El percent es sobre el total de vínculos
// categoría-elemento (no sobre la cantidad de elementos: por la relación N:M uno puede
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

// Filtra la lista de categorías por nombre (búsqueda case-insensitive, mismo criterio
// simple que el resto de los buscadores del panel).
export const filterCategoriesByQuery = (categories, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return categories;
  return categories.filter((category) => category.name?.toLowerCase().includes(normalized));
};

// Reemplaza en la lista el nombre y la descripción de la categoría editada (lo único que
// se edita). La cantidad de elementos asociados se conserva: el PATCH no la devuelve.
// Recibe: categorías y la categoría que respondió el backend. Devuelve: la lista nueva.
export const replaceCategory = (categories, updatedCategory) =>
  categories.map((category) =>
    category.id === updatedCategory.id
      ? { ...category, name: updatedCategory.name, description: updatedCategory.description }
      : category
  );
