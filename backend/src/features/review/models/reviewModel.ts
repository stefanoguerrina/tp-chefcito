// Tipos de dominio para la feature Review (reseñas de recetas).
// Esta capa no tiene lógica: solo describe la forma de los datos.
// El idUser siempre sale del token JWT, nunca del body.
// El idReview es calculado internamente (secuencial por par idUser/idRecipe).

// Límites de rating aceptados (1 a 5, con medias estrellas: 1, 1.5, 2, ..., 5).
// El campo en la DB es Decimal(3,1), por eso se permiten valores como 1.5, 2.5, etc.
export const RATING_MIN = 1;
export const RATING_MAX = 5;

// Datos necesarios para crear una nueva reseña.
export interface CreateReviewData {
  rating: number;
  comment?: string | null;
}

// Campos que se pueden modificar de una reseña existente.
// Al menos uno de los dos debe enviarse.
export interface UpdateReviewData {
  rating?: number;
  comment?: string | null;
}
