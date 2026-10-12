// Modelo de la feature IngredientCategory (categorías de ingrediente): mapea la forma cruda
// que devuelve el backend al objeto que usa el frontend. Factory function simple, como el
// resto del frontend.

// Convierte una categoría de ingrediente cruda del backend al objeto que usa el frontend.
// Recibe: { id, name, description, _count? }. El listado trae
// _count.ingredientcategoryingredient (cuántos ingredientes la tienen); el alta y la
// edición no.
// Devuelve: { id, name, description, ingredientsCount } (0 si no vino el dato).
export const ingredientCategoryFromApi = (category) => ({
  id: category.id,
  name: category.name,
  description: category.description ?? null,
  ingredientsCount: category._count?.ingredientcategoryingredient ?? 0,
});
