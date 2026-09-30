// Valoración de solo lectura con número: las 5 estrellas (RatingStars, con el degradé verde
// de la marca, igual que "Reseñas de amigos") seguidas del valor y, opcionalmente, la
// cantidad de reseñas. La usan las reseñas del detalle de receta (ReviewList, ReviewItem).
import RatingStars from './RatingStars.jsx';
import './_star-rating.scss';

// Recibe: rating (número 0-5) y, opcionalmente, reviewsCount. El tamaño de las estrellas
// lo define quien la usa con --rating-star-size (ver RatingStars).
function StarRating({ rating, reviewsCount }) {
  return (
    <div className="StarRating">
      <RatingStars rating={rating} />
      <span className="StarRating-value">{rating.toFixed(1)}</span>
      {typeof reviewsCount === 'number' && (
        <span className="StarRating-count">({reviewsCount} reseñas)</span>
      )}
    </div>
  );
}

export default StarRating;
