// Modelo de dominio de la feature UserRecipe (recetas guardadas por un usuario).
// Factory functions simples, sin clases ni TypeScript.

// Convierte un registro userrecipe crudo del backend (la relación usuario-receta) al
// objeto que usa el frontend. La misma fila existe también si el usuario solo reseñó la
// receta: por eso isSaved dice si de verdad está guardada.
// Recibe: { idUser, idRecipe, isSaved, savedAt, ... }.
// Devuelve: { idUser, idRecipe, isSaved, savedAt }.
export const userRecipeFromApi = (raw) => ({
  idUser: raw.idUser,
  idRecipe: raw.idRecipe,
  isSaved: Boolean(raw.isSaved),
  savedAt: raw.savedAt ?? null,
});
