// Transformaciones puras de la sección "Ingredientes" del panel de administración: arman
// el ranking de más usados y filtran la tabla por búsqueda. Sin fetch ni estado (lo maneja
// useAdminIngredients).

// Cuenta en cuántas recetas aparece cada ingrediente, recorriendo el recipeingredient[]
// que ya viene embebido en cada receta de getAllRecipes() (no hace falta un endpoint nuevo).
// Recibe: array de recetas crudas. Devuelve: Map de idIngredient -> cantidad de recetas.
export const countIngredientUsage = (recipes) => {
  const countByIngredient = new Map();
  recipes.forEach((recipe) => {
    (recipe.recipeingredient ?? []).forEach((item) => {
      const current = countByIngredient.get(item.idIngredient) ?? 0;
      countByIngredient.set(item.idIngredient, current + 1);
    });
  });
  return countByIngredient;
};

// Ranking de ingredientes más usados en recetas, para la tarjeta del dashboard.
// Recibe: ingredientes crudos, el Map de countIngredientUsage y el máximo de puestos.
// Devuelve: [{ label, value }] ordenado de mayor a menor (solo los que se usaron al menos una vez).
export const buildTopUsedIngredients = (ingredients, usageCountByIngredient, limit = 4) => {
  return ingredients
    .map((ingredient) => ({
      label: ingredient.name,
      value: usageCountByIngredient.get(ingredient.id) ?? 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

// Categoría "principal" de un ingrediente: un ingrediente puede tener varias (relación
// N:M), así que para pintar un solo badge/color en la tabla y en la distribución del
// catálogo se toma la primera — mismo criterio que ya usa recipeModel.js para el badge
// de categoría de una receta.
// Recibe: un ingrediente crudo. Devuelve: { id, name } o null si no tiene ninguna.
export const getPrimaryCategory = (ingredient) => {
  const link = ingredient.ingredientcategoryingredient?.[0];
  if (!link?.ingredientcategory) return null;
  return { id: link.ingredientcategory.id, name: link.ingredientcategory.name };
};

// Cuántas categorías además de la principal tiene un ingrediente (para el "+N" que se
// muestra al lado del badge cuando tiene más de una).
export const getExtraCategoriesCount = (ingredient) =>
  Math.max((ingredient.ingredientcategoryingredient ?? []).length - 1, 0);

// Distribución del catálogo por categoría principal, para la barra segmentada de la
// tarjeta "Total de ingredientes". Los ingredientes sin ninguna categoría (no debería
// pasar: el alta exige elegir al menos una) se agrupan en "Sin categoría"; a partir del
// puesto maxSegments todo el resto se agrupa en "Otros", así la barra nunca explota en
// franjas minúsculas ni depende de cuántas categorías haya creadas.
// Recibe: ingredientes crudos y el máximo de franjas propias a mostrar.
// Devuelve: [{ id, name, count, percent }] (percent redondeado, puede no sumar
// exactamente 100 por el redondeo — es solo para el ancho visual de cada franja).
export const buildCategoryDistribution = (ingredients, maxSegments = 4) => {
  const total = ingredients.length;
  if (total === 0) return [];

  const countByCategory = new Map();
  ingredients.forEach((ingredient) => {
    const primary = getPrimaryCategory(ingredient);
    const key = primary?.id ?? 'none';
    const name = primary?.name ?? 'Sin categoría';
    const current = countByCategory.get(key) ?? { id: key, name, count: 0 };
    current.count += 1;
    countByCategory.set(key, current);
  });

  const sorted = [...countByCategory.values()].sort((a, b) => b.count - a.count);
  const topSegments = sorted.slice(0, maxSegments);
  const rest = sorted.slice(maxSegments);
  const restCount = rest.reduce((sum, item) => sum + item.count, 0);

  const segments = [...topSegments];
  if (restCount > 0) segments.push({ id: 'other', name: 'Otros', count: restCount });

  return segments.map((segment) => ({
    ...segment,
    percent: Math.round((segment.count / total) * 100),
  }));
};

// Formatea el id de un ingrediente como código legible, ej: 12 -> "#ING-0012".
export const formatIngredientCode = (id) => `#ING-${String(id).padStart(4, '0')}`;

// Mapea cada franja de buildCategoryDistribution a un índice de color (0, 1, 2...), para
// que la misma categoría use el mismo color tanto en la barra segmentada como en los
// badges de la tabla. Recibe: el resultado de buildCategoryDistribution.
// Devuelve: Map de id de categoría (o 'none'/'other') -> índice.
export const buildCategoryColorMap = (distribution) => {
  const colorIndexByCategoryId = new Map();
  distribution.forEach((segment, index) => colorIndexByCategoryId.set(segment.id, index));
  return colorIndexByCategoryId;
};

// Índice de color para la categoría principal de un ingrediente puntual, usando el Map
// de buildCategoryColorMap. Si esa categoría no está entre las que tienen franja propia
// (quedó agrupada en "Otros"), cae en el color de "Otros"; si el ingrediente no tiene
// categoría, cae en el de "Sin categoría".
// Recibe: colorIndexByCategoryId (Map) y el ingrediente crudo. Devuelve: un número.
export const getIngredientColorIndex = (colorIndexByCategoryId, ingredient) => {
  const primary = getPrimaryCategory(ingredient);
  if (!primary) return colorIndexByCategoryId.get('none') ?? colorIndexByCategoryId.get('other') ?? 0;
  return (
    colorIndexByCategoryId.get(primary.id) ?? colorIndexByCategoryId.get('other') ?? 0
  );
};

// Filtra la lista de ingredientes por nombre (búsqueda case-insensitive, sin acentos no
// contemplado a propósito: se mantiene simple, igual que el resto de los buscadores del
// proyecto como SearchUsersForm).
// Recibe: ingredientes crudos y el término de búsqueda. Devuelve: array filtrado.
export const filterIngredientsByQuery = (ingredients, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return ingredients;
  return ingredients.filter((ingredient) => ingredient.name?.toLowerCase().includes(normalized));
};

// Pluraliza "ingrediente"/"ingredientes" según la cantidad. Recibe: un número.
// Devuelve: "1 ingrediente", "3 ingredientes".
export const formatIngredientsCount = (count) => `${count} ${count === 1 ? 'ingrediente' : 'ingredientes'}`;

// Pluraliza "categoría"/"categorías" según la cantidad. Recibe: un número.
// Devuelve: "1 categoría", "3 categorías".
export const formatCategoriesCount = (count) => `${count} ${count === 1 ? 'categoría' : 'categorías'}`;
