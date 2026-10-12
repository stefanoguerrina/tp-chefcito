// Tipos e interfaces de dominio para la feature Recipe.
// Esta capa no tiene lógica: solo describe la forma de los datos.
// Una receta puede pertenecer a varias categorías (relación N:M vía la tabla
// intermedia recipecategory), por eso se maneja como un array de IDs (categoryIds)
// en vez de un único idCategory. idUser no se recibe del body: siempre sale del
// usuario autenticado (req.user.id), nunca de un dato enviado por el cliente.

// Porciones que puede indicar una receta (servings).
export const RECIPE_SERVINGS_MIN = 1;
export const RECIPE_SERVINGS_MAX = 50;

// Niveles de dificultad aceptados (coinciden con el selector del formulario).
export const RECIPE_DIFFICULTIES = ['Fácil', 'Media', 'Avanzada'] as const;
export type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number];

// Datos necesarios para crear una nueva receta.
export interface CreateRecipeData {
  name: string;
  description?: string | null;
  preparationTime?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  categoryIds?: number[];
}

// Campos que se pueden modificar de una receta existente.
// Si se envía categoryIds, se reemplaza por completo el set de categorías actuales.
export interface UpdateRecipeData {
  name?: string;
  description?: string | null;
  preparationTime?: number | null;
  servings?: number | null;
  difficulty?: string | null;
  categoryIds?: number[];
}
