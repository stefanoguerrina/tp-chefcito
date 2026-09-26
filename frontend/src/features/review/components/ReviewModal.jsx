// Modal de reseña: permite al usuario calificar una receta (1-5 estrellas con medias),
// escribir un comentario y guardar la receta (bookmark). Muestra una vista previa
// de la receta con imagen, título, autor, tiempo y dificultad.
// Se abre desde el detalle de receta y maneja sus propios estados de carga/error.
import { useState } from 'react';
import StarPicker from './StarPicker.jsx';
import { createReviewPayload } from '../models/reviewModel.js';
import { createReview } from '../services/reviewService.js';
import { getRecipeImageUrl } from '../../recipe/models/recipeModel.js';
import './_review-modal.scss';

// Recibe:
//   recipe    — objeto crudo de receta (con name, image, user, preparationTime, difficulty)
//   onClose   — cerrar el modal sin hacer nada
//   onSuccess — se llama cuando la review se guardó correctamente
//   onSave    — se llama cuando el usuario pulsa "Guardar receta" (bookmark)
//   isSaved   — boolean: indica si la receta ya está guardada
function ReviewModal({ recipe, onClose, onSuccess, onSave, isSaved }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const imageUrl = getRecipeImageUrl(recipe);
  const authorName = recipe.user?.username ?? 'Sin autor';
  const timeText = recipe.preparationTime ? `${recipe.preparationTime} min` : '—';
  const difficultyText = recipe.difficulty ?? 'Sin definir';

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (rating === 0) {
      setError('Seleccioná al menos 1 estrella para enviar tu reseña.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const payload = createReviewPayload({ rating, comment });
      await createReview(recipe.id, payload);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ReviewModal-overlay" onClick={onClose}>
      <div
        className="ReviewModal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Vista previa de la receta */}
        <div className="ReviewModal-preview">
          <div className="ReviewModal-previewImageWrapper">
            <img
              className="ReviewModal-previewImage"
              src={imageUrl}
              alt={recipe.name}
            />
          </div>
          <div className="ReviewModal-previewBody">
            <span className="ReviewModal-previewAuthor">Por @{authorName}</span>
            <h3 className="ReviewModal-previewTitle" id="review-modal-title">
              {recipe.name}
            </h3>
            <div className="ReviewModal-previewMeta">
              <span className="material-symbols-outlined">schedule</span>
              <span>{timeText}</span>
              <span className="ReviewModal-previewDot" />
              <span className="material-symbols-outlined">signal_cellular_alt</span>
              <span>{difficultyText}</span>
            </div>

            {/* Botón guardar receta (bookmark) */}
            <button
              type="button"
              className={`ReviewModal-saveBtn${isSaved ? ' ReviewModal-saveBtn--saved' : ''}`}
              onClick={onSave}
              aria-pressed={isSaved}
            >
              <span className="material-symbols-outlined">
                {isSaved ? 'bookmark' : 'bookmark'}
              </span>
              {isSaved ? 'Receta guardada' : 'Guardar receta'}
            </button>
          </div>
        </div>

        {/* Divisor */}
        <hr className="ReviewModal-divider" />

        {/* Formulario de reseña */}
        <form className="ReviewModal-form" onSubmit={handleSubmit}>
          <p className="ReviewModal-label">¿Qué te pareció esta receta?</p>

          <StarPicker value={rating} onChange={setRating} />

          <textarea
            className="ReviewModal-textarea"
            id="review-comment"
            placeholder="Contá tu experiencia (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
          />

          {error && <p className="ReviewModal-error">⚠ {error}</p>}

          <div className="ReviewModal-actions">
            <button
              type="button"
              className="ReviewModal-btn ReviewModal-btn--cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="ReviewModal-btn ReviewModal-btn--submit"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Enviando...' : 'Publicar reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
