// Tipos y constantes de la feature Feed: lo que muestra la home de un usuario (recetas de
// las personas que sigue, el top de recetas mejor valoradas en un plazo y las reseñas de
// las personas que sigue). Esta capa no tiene lógica: solo describe la forma de los datos.

// Cuántos elementos trae cada sección si no se indica ?limit=, y el máximo aceptado.
export const FRIENDS_RECIPES_DEFAULT_LIMIT = 4;
export const FRIENDS_REVIEWS_DEFAULT_LIMIT = 6;
export const TOP_RECIPES_DEFAULT_LIMIT = 10;
export const FEED_MAX_LIMIT = 20;

// Plazo del ranking de recetas, en días (?days=). Por defecto, la última semana.
export const TOP_RECIPES_DEFAULT_DAYS = 7;
export const TOP_RECIPES_MAX_DAYS = 365;

// Valoración de una receta calculada solo con las reseñas del plazo pedido.
export interface RecipeRanking {
  idRecipe: number;
  averageRating: number;
  reviewCount: number;
}
