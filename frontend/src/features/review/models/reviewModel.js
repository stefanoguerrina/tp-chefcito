// Modelo de dominio de la feature Review: mapea la forma cruda del backend
// a la forma que usan los componentes del frontend.
// Factory functions simples, sin clases ni TypeScript.

// Convierte una review cruda del backend a la forma que usan los componentes.
// Recibe el objeto review con su userrecipe.user anidado.
export const reviewFromApi = (raw) => ({
  idUser: raw.idUser,
  idRecipe: raw.idRecipe,
  idReview: raw.idReview,
  // Prisma serializa Decimal como string en JSON ("1.5"), parseFloat lo convierte a número.
  rating: parseFloat(raw.rating),
  comment: raw.comment ?? '',
  createdAt: raw.createdAt,
  author: {
    id: raw.userrecipe?.user?.id ?? raw.idUser,
    username: raw.userrecipe?.user?.username ?? 'Usuario',
    name: raw.userrecipe?.user?.name ?? '',
    lastName: raw.userrecipe?.user?.lastName ?? '',
    avatarUrl: raw.userrecipe?.user?.avatarUrl ?? null,
  },
});

// Arma el body para POST /api/recipes/:idRecipe/reviews.
export const createReviewPayload = ({ rating, comment }) => ({
  rating: Number(rating),
  comment: comment?.trim() || undefined,
});

// Arma el body para PATCH /api/recipes/:idRecipe/reviews/:idReview.
export const updateReviewPayload = ({ rating, comment }) => {
  const payload = {};
  if (rating !== undefined) payload.rating = Number(rating);
  if (comment !== undefined) payload.comment = comment?.trim() || null;
  return payload;
};
