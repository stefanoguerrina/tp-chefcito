// Modelo de la feature Category (categorías de receta): mapea la forma cruda que devuelve
// el backend al objeto que usa el frontend. Factory function simple, como el resto del
// frontend.

// Convierte una categoría cruda del backend al objeto que usa el frontend.
// Recibe: { id, name, description, _count? }. El listado trae _count.recipecategory
// (cuántas recetas la usan, sin las de usuarios dados de baja); el alta y la edición no.
// Devuelve: { id, name, description, recipesCount } (recipesCount = 0 si no vino el dato).
export const categoryFromApi = (category) => ({
  id: category.id,
  name: category.name,
  description: category.description ?? null,
  recipesCount: category._count?.recipecategory ?? 0,
});
