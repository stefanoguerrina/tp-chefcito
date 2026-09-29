// Las 5 estrellas de la valoración de una receta: siempre se dibujan las 5 (solo el
// contorno) y se rellenan con el degradé de la marca hasta donde llega el promedio.
// Es solo la parte gráfica: el número y la cantidad de reseñas los pone quien la usa.
import './_rating-stars.scss';

// Recibe: rating (promedio de 0 a 5; 0 o vacío = ninguna estrella pintada).
function RatingStars({ rating = 0 }) {
  const clampedRating = Math.min(5, Math.max(0, rating));

  return (
    <span className="RatingStars" role="img" aria-label={`Valoración: ${clampedRating.toFixed(1)} de 5`}>
      {[0, 1, 2, 3, 4].map((index) => {
        // Cuánto de esta estrella se pinta (0 a 100%): 4.5 pinta 4 enteras y la 5ª a la mitad.
        const fillPercent = Math.min(1, Math.max(0, clampedRating - index)) * 100;

        return (
          <span key={index} className="RatingStars-star" aria-hidden="true">
            <span className="RatingStars-outline material-symbols-outlined">star</span>
            {fillPercent > 0 && (
              <span className="RatingStars-fill" style={{ width: `${fillPercent}%` }}>
                <span className="RatingStars-fillIcon material-symbols-outlined">star</span>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export default RatingStars;
