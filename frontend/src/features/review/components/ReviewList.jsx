// Lista de reseñas de una receta con el promedio de rating.
// Carga sus propios datos al montarse. Muestra un botón "Reseñar receta" que
// abre ReviewModal solo si el usuario está autenticado y aún no reseñó la receta.
import { useState, useEffect } from 'react';
import { getReviewsByRecipe, deleteReview } from '../services/reviewService.js';
import { getCurrentUserId } from '../../../shared/utils/decodeToken.js';
import StarRating from '../../../core/components/StarRating.jsx';
import ReviewModal from './ReviewModal.jsx';
import { RECIPE_PLACEHOLDER_AVATAR } from '../../recipe/models/recipeModel.js';
import './_review-list.scss';

// Recibe:
//   recipe         — objeto crudo de receta (necesario para pasarle al modal)
//   isLoggedIn     — boolean: controla si se muestra el botón "Reseñar"
//   onSaveRecipe   — handler para guardar/quitar la receta (bookmark)
//   isSaved        — boolean: estado actual de guardado
function ReviewList({ recipe, isLoggedIn, onSaveRecipe, isSaved }) {
  const currentUserId = getCurrentUserId();

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // La review del usuario actual, si existe (para ocultar el botón de reseñar).
  const userReview = reviews.find((r) => r.author.id === currentUserId) ?? null;

  const loadReviews = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const data = await getReviewsByRecipe(recipe.id);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe.id]);

  const handleReviewSuccess = () => {
    setShowModal(false);
    loadReviews();
  };

  const handleDelete = async (review) => {
    setDeleteError('');
    try {
      await deleteReview(review.idRecipe, review.idReview);
      loadReviews();
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  // Formatea una fecha ISO a "DD/MM/YYYY".
  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString('es-AR');
  };

  return (
    <section className="ReviewList">
      <div className="ReviewList-header">
        <h2 className="ReviewList-title">Reseñas</h2>

        {/* Promedio general de la receta */}
        {averageRating !== null && (
          <div className="ReviewList-average">
            <StarRating rating={averageRating} reviewsCount={reviews.length} />
          </div>
        )}
        {averageRating === null && !isLoading && (
          <p className="ReviewList-noRating">Sin calificaciones todavía</p>
        )}
      </div>

      {/* Botón para reseñar (solo si está logueado, la receta no es suya y aún no la reseñó) */}
      {isLoggedIn && !userReview && recipe.idUser !== currentUserId && (
        <button
          type="button"
          className="ReviewList-reviewBtn"
          onClick={() => setShowModal(true)}
        >
          <span className="material-symbols-outlined">rate_review</span>
          Reseñar esta receta
        </button>
      )}

      {/* Error al eliminar */}
      {deleteError && <p className="ReviewList-deleteError">⚠ {deleteError}</p>}

      {/* Estados de carga y error */}
      {isLoading && <p className="ReviewList-loading">Cargando reseñas...</p>}
      {fetchError && <p className="ReviewList-error">⚠ {fetchError}</p>}

      {/* Lista de reseñas */}
      {!isLoading && !fetchError && reviews.length === 0 && (
        <p className="ReviewList-empty">Todavía no hay reseñas. ¡Sé el primero en opinar!</p>
      )}

      {!isLoading && reviews.length > 0 && (
        <ul className="ReviewList-list">
          {reviews.map((review) => {
            const isOwn = review.author.id === currentUserId;
            return (
              <li key={`${review.idUser}-${review.idReview}`} className="ReviewItem">
                <div className="ReviewItem-header">
                  <img
                    className="ReviewItem-avatar"
                    src={review.author.avatarUrl ?? RECIPE_PLACEHOLDER_AVATAR}
                    alt={review.author.username}
                  />
                  <div className="ReviewItem-authorInfo">
                    <span className="ReviewItem-username">@{review.author.username}</span>
                    <span className="ReviewItem-date">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="ReviewItem-stars">
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                {review.comment && (
                  <p className="ReviewItem-comment">{review.comment}</p>
                )}
                {/* Botón de eliminar: solo visible para el propio autor */}
                {isOwn && (
                  <button
                    type="button"
                    className="ReviewItem-deleteBtn"
                    onClick={() => handleDelete(review)}
                  >
                    Eliminar mi reseña
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal de nueva reseña */}
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
