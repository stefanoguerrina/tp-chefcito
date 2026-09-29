// Métricas del perfil (valoración, recetas por mes, categorías y categoría principal),
// calculadas con las recetas y reseñas que ya carga useProfileData: sin pedidos extra.

// Cuántos meses muestra el gráfico de barras de "Recetas" (el actual y los anteriores).
const MONTHS_IN_CHART = 6;

// Recibe: recipeReviewStats ({ [idReceta]: { averageRating, totalReviews } }).
// Devuelve: { averageRating, totalReviews } de todas las recetas juntas. El promedio se
// pondera por cantidad de reseñas: una receta con 10 reseñas pesa más que una con 1.
const buildOverallRating = (recipeReviewStats) => {
  const allStats = Object.values(recipeReviewStats);
  const totalReviews = allStats.reduce((sum, stats) => sum + stats.totalReviews, 0);
  const ratingSum = allStats.reduce((sum, stats) => sum + stats.averageRating * stats.totalReviews, 0);
  return { averageRating: totalReviews > 0 ? ratingSum / totalReviews : 0, totalReviews };
};

// Recibe: recipes (crudas, con createdAt). Devuelve las barras del gráfico, de la más vieja
// a la actual: [{ label: 'abr', count }].
const buildRecipesPerMonth = (recipes) => {
  const now = new Date();
  return Array.from({ length: MONTHS_IN_CHART }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (MONTHS_IN_CHART - 1 - index), 1);
    const count = recipes.filter((recipe) => {
      if (!recipe.createdAt) return false;
      const createdAt = new Date(recipe.createdAt);
      return createdAt.getMonth() === month.getMonth() && createdAt.getFullYear() === month.getFullYear();
    }).length;
    return { label: month.toLocaleDateString('es-AR', { month: 'short' }), count };
  });
};

// Recibe: recipes. Devuelve: { distinctCount, topName, topCount } — cuántas categorías
// distintas usa y cuál es la que más se repite en sus recetas (o null si no usa ninguna).
const buildCategoryStats = (recipes) => {
  const countByName = new Map();
  recipes
    .flatMap((recipe) => recipe.recipecategory ?? [])
    .map(({ category }) => category?.name)
    .filter(Boolean)
    .forEach((name) => countByName.set(name, (countByName.get(name) ?? 0) + 1));

  let topName = null;
  let topCount = 0;
  countByName.forEach((count, name) => {
    if (count > topCount) {
      topName = name;
      topCount = count;
    }
  });
  return { distinctCount: countByName.size, topName, topCount };
};

// Recibe: recipes y recipeReviewStats (de useProfileData).
// Devuelve: { rating, recipesCount, recipesPerMonth, categories } (ver funciones de arriba).
export const buildProfileMetrics = (recipes, recipeReviewStats) => ({
  rating: buildOverallRating(recipeReviewStats),
  recipesCount: recipes.length,
  recipesPerMonth: buildRecipesPerMonth(recipes),
  categories: buildCategoryStats(recipes),
});
