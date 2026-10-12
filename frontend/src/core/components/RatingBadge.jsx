// Etiqueta de valoración que va sobre la foto de una receta: estrella, promedio y cantidad
// de reseñas y, si se indica, el puesto en un ranking ("#1 · ★ 4.8 (12)"). La usan las
// recetas destacadas del perfil y el Top 10 de la home. Dónde se ubica sobre la foto lo
// decide quien la usa (con className).
import './_rating-badge.scss';

// Recibe: rating (promedio, 0 si no tiene reseñas), reviewsCount, rank (opcional, puesto
// en el ranking), isHighlighted (el primero del ranking: fondo verde de la marca) y
// className (para posicionarla).
function RatingBadge({ rating = 0, reviewsCount = 0, rank, isHighlighted = false, className = '' }) {
  const label = `${rank ? `Puesto ${rank}. ` : ''}Valoración ${rating.toFixed(1)} de 5, ${reviewsCount} reseñas`;

  return (
    <span
      className={`RatingBadge${isHighlighted ? ' RatingBadge--highlighted' : ''} ${className}`.trim()}
      role="img"
      aria-label={label}
    >
      {rank && (
        <>
          <span className="RatingBadge-rank">#{rank}</span>
          <span className="RatingBadge-separator" aria-hidden="true">·</span>
        </>
      )}
      <span className="RatingBadge-star material-symbols-outlined" aria-hidden="true">star</span>
      {rating.toFixed(1)}
      <span className="RatingBadge-reviews">({reviewsCount})</span>
    </span>
  );
}

export default RatingBadge;
