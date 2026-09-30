// Una reseña dentro de ReviewList: avatar, nombre, hace cuánto se escribió, estrellas y
// comentario. Si es del usuario logueado, suma la etiqueta "Tu reseña" junto al nombre y,
// al costado del comentario, los botones (solo ícono) para editarla y eliminarla.
import { useState } from 'react';
import StarRating from '../../../core/components/StarRating.jsx';

const DAY_MS = 24 * 60 * 60 * 1000;

// Recibe: una fecha ISO. Devuelve: cuánto pasó desde entonces ("Hoy", "Ayer", "Hace 3
// días", "Hace 2 semanas") o, si pasó más de un mes, la fecha ("12/5/2026").
const formatRelativeDate = (isoDate) => {
  if (!isoDate) return '';
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / DAY_MS);
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `Hace ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  }
  return new Date(isoDate).toLocaleDateString('es-AR');
};

// Iniciales para el avatar de respaldo (sin foto o con la URL rota).
const getInitials = ({ name, lastName, username }) =>
  `${name?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || username?.[0]?.toUpperCase() || '?';

// Recibe: review (ver reviewFromApi en models/reviewModel.js), isOwn (si la escribió el
// usuario logueado), onEdit (abre el modal de reseña para editarla) y onDelete (pide
// confirmación para eliminarla).
function ReviewItem({ review, isOwn, onEdit, onDelete }) {
  const [avatarBroken, setAvatarBroken] = useState(false);
  const { author } = review;
  const fullName = `${author.name} ${author.lastName}`.trim() || `@${author.username}`;

  return (
    <li className="ReviewItem">
      <div className="ReviewItem-header">
        <span className="ReviewItem-avatar">
          {author.avatarUrl && !avatarBroken ? (
            <img src={author.avatarUrl} alt="" onError={() => setAvatarBroken(true)} />
          ) : (
            getInitials(author)
          )}
        </span>
        <div className="ReviewItem-authorInfo">
          <span className="ReviewItem-nameRow">
            <span className="ReviewItem-name">{fullName}</span>
            {isOwn && <span className="ReviewItem-ownTag">Tu reseña</span>}
          </span>
          <span className="ReviewItem-date">
            @{author.username} • {formatRelativeDate(review.createdAt)}
          </span>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {/* Comentario a la izquierda y, en la reseña propia, los botones a la derecha. */}
      {(review.comment || isOwn) && (
        <div className="ReviewItem-body">
          {review.comment && <p className="ReviewItem-comment">“{review.comment}”</p>}

          {isOwn && (
            <div className="ReviewItem-actions">
              <button
                type="button"
                className="ReviewItem-iconBtn"
                onClick={onEdit}
                title="Editar reseña"
                aria-label="Editar reseña"
              >
                <span className="material-symbols-outlined" aria-hidden="true">edit</span>
              </button>
              <button
                type="button"
                className="ReviewItem-iconBtn ReviewItem-iconBtn--danger"
                onClick={onDelete}
                title="Eliminar reseña"
                aria-label="Eliminar reseña"
              >
                <span className="material-symbols-outlined" aria-hidden="true">delete</span>
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default ReviewItem;
