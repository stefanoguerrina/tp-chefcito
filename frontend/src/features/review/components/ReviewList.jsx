// Reseñas de la comunidad sobre una receta (tarjeta del detalle de receta): promedio con
// estrellas, botón "Escribir reseña" (abre ReviewModal), las 3 más recientes y "Ver todas"
// para desplegar el resto. El autor de una reseña puede eliminarla.
// Carga sus propios datos al montarse.
import { useState, useEffect } from 'react';
import { getReviewsByRecipe, deleteReview } from '../services/reviewService.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import StarRating from '../../../core/components/StarRating.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import ReviewModal from './ReviewModal.jsx';
import ReviewItem from './ReviewItem.jsx';
import './_review-list.scss';

// Cuántas reseñas se ven antes de tocar "Ver todas".
const VISIBLE_REVIEWS = 3;

// Recibe:
//   recipe       — objeto crudo de receta (necesario para pasarle al modal)
//   isLoggedIn   — boolean: controla si se muestra el botón "Escribir reseña"
//   onSaveRecipe — handler para guardar/quitar la receta (el modal también lo ofrece)
//   isSaved      — boolean: estado actual de guardado
function ReviewList({ recipe, isLoggedIn, onSaveRecipe, isSaved }) {
  const { userId: currentUserId } = useAuthContext();

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  // Reseña propia que se pidió eliminar (se confirma en un modal) o null.
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // La reseña del usuario actual, si existe (para ocultar el botón de escribir otra).
  const userReview = reviews.find((review) => review.author.id === currentUserId) ?? null;
  // Solo quien no es el autor de la receta y todavía no la reseñó puede escribir una.
  const canReview = isLoggedIn && !userReview && recipe.idUser !== currentUserId;
  const visibleReviews = showAll ? reviews : reviews.slice(0, VISIBLE_REVIEWS);

  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede
  // llamar desde el useEffect sin renders en cascada.
  const loadReviews = () =>
    getReviewsByRecipe(recipe.id)
      .then((data) => {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setFetchError('');
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setIsLoading(false));

  // Reintento manual después de un error de carga.
  const handleRetry = () => {
    setIsLoading(true);
    loadReviews();
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe.id]);

  const handleReviewSuccess = () => {
    setShowModal(false);
    loadReviews();
  };

  // Elimina la reseña confirmada en el modal. Si falla, se avisa en un modal.
  const handleConfirmDelete = async () => {
    const review = reviewToDelete;
    setReviewToDelete(null);
    try {
      await deleteReview(review.idRecipe, review.idReview);
      loadReviews();
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  return (
    <section className="ReviewList">
      <div className="ReviewList-header">
        <div>
          <h2 className="ReviewList-title">Reseñas de la comunidad</h2>
          {averageRating !== null ? (
            <StarRating rating={averageRating} reviewsCount={reviews.length} />
          ) : (
            !isLoading && <p className="ReviewList-noRating">Sin calificaciones todavía</p>
          )}
        </div>

        {canReview && (
          <button type="button" className="ReviewList-reviewBtn" onClick={() => setShowModal(true)}>
            <span className="material-symbols-outlined">rate_review</span>
            Escribir reseña
          </button>
        )}
      </div>

      {isLoading && <p className="ReviewList-status">Cargando reseñas...</p>}
      {fetchError && <ErrorState title="No pudimos cargar las reseñas" message={fetchError} onRetry={handleRetry} />}

      {!isLoading && !fetchError && reviews.length === 0 && (
        <p className="ReviewList-status">Todavía no hay reseñas. ¡Sé el primero en opinar!</p>
      )}

      {!isLoading && reviews.length > 0 && (
        <ul className="ReviewList-list">
          {visibleReviews.map((review) => (
            <ReviewItem
              key={`${review.idUser}-${review.idReview}`}
              review={review}
              isOwn={review.author.id === currentUserId}
              onDelete={() => setReviewToDelete(review)}
            />
          ))}
        </ul>
      )}

      {reviews.length > VISIBLE_REVIEWS && (
        <div className="ReviewList-footer">
          <span>Mostrando {visibleReviews.length} de {reviews.length} reseñas</span>
          <button type="button" className="ReviewList-moreBtn" onClick={() => setShowAll((value) => !value)}>
            {showAll ? 'Ver menos' : 'Ver todas las reseñas'}
            <span className="material-symbols-outlined">{showAll ? 'expand_less' : 'arrow_forward'}</span>
          </button>
        </div>
      )}

      {reviewToDelete && (
        <ConfirmModal
          title="Eliminar reseña"
          message="¿Querés eliminar tu reseña de esta receta?"
          confirmLabel="Eliminar"
          danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setReviewToDelete(null)}
        />
      )}

      {deleteError && (
        <AlertModal title="No se pudo eliminar la reseña" message={deleteError} onClose={() => setDeleteError('')} />
      )}

      {showModal && (
        <ReviewModal
          recipe={recipe}
          onClose={() => setShowModal(false)}
          onSuccess={handleReviewSuccess}
          onSave={onSaveRecipe}
          isSaved={isSaved}
        />
      )}
    </section>
  );
}

export default ReviewList;
