// Transformaciones puras de las recetas del perfil (ProfilePage): las destacadas y las
// categorías que usa el autor. Sin fetch ni estado.

// Recetas Destacadas: las 3 con mejor valoración promedio (0 si todavía no tienen reseñas,
// así igual se completan los 3 huecos si hay pocas reseñas).
// Recibe: recipes y recipeReviewStats ({ [idReceta]: { averageRating } }).
// Devuelve: hasta 3 recetas, de mejor a peor valoradas.
export const getFeaturedRecipes = (recipes, recipeReviewStats) =>
  [...recipes]
    .sort((a, b) => (recipeReviewStats[b.id]?.averageRating ?? 0) - (recipeReviewStats[a.id]?.averageRating ?? 0))
    .slice(0, 3);

// Recibe: una lista de recetas crudas. Devuelve sus categorías sin repetir ([{ id, name }]),
// ordenadas por nombre: son las opciones del filtro de la galería (solo las que usa el autor).
export const getRecipeCategories = (recipes) =>
  Array.from(
    new Map(
      recipes
        .flatMap((recipe) => recipe.recipecategory ?? [])
        .map(({ category }) => category)
        .filter(Boolean)
        .map((category) => [category.id, { id: category.id, name: category.name }])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name, 'es'));
