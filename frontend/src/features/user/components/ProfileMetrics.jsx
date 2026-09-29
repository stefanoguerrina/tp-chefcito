// Métricas del perfil en formato "bento", debajo de la portada: una tarjeta grande a la
// izquierda (recetas publicadas y valoración promedio) y tres apiladas a la derecha
// (seguidores, seguidos y categoría principal), cada una con su ícono a la izquierda y el
// dato a su lado.
import RatingStars from '../../../core/components/RatingStars.jsx';
import '../styles/_profile-metrics.scss';

// Recibe: metrics (ver buildProfileMetrics en models/profileMetricsModel.js) y followStatus
// ({ followersCount, followingCount } de useFollow, o null mientras carga o si falló: ahí
// las dos tarjetas muestran "—").
function ProfileMetrics({ metrics, followStatus }) {
  const { rating, recipesCount, categories } = metrics;

  return (
    <div className="ProfileMetrics">
      <article className="ProfileMetrics-card ProfileMetrics-primary">
        <div className="ProfileMetrics-pattern" aria-hidden="true" />
        <div>
          <span className="ProfileMetrics-chip">Recetas publicadas</span>
        </div>

        {/* El número ocupa todo el espacio que hay entre la etiqueta y la valoración: su
            tamaño sale del alto de esta caja y, para que no se salga del ancho, de cuántos
            dígitos tiene (ver primaryValue en _profile-metrics.scss). */}
        <div
          className="ProfileMetrics-primaryValueBox"
          style={{ '--metrics-digits': String(recipesCount).length }}
        >
          <p className="ProfileMetrics-primaryValue">{recipesCount}</p>
        </div>

        <div className="ProfileMetrics-rating">
          <div className="ProfileMetrics-ratingLine">
            <RatingStars rating={rating.averageRating} />
            <span>{rating.averageRating.toFixed(1)}</span>
          </div>
          <p className="ProfileMetrics-primaryNote">
            Valoración promedio ·{' '}
            {rating.totalReviews > 0
              ? `${rating.totalReviews} ${rating.totalReviews === 1 ? 'reseña' : 'reseñas'}`
              : 'sin reseñas todavía'}
          </p>
        </div>
      </article>

      <div className="ProfileMetrics-group">
        <article className="ProfileMetrics-card">
          <span className="ProfileMetrics-icon material-symbols-outlined" aria-hidden="true">group</span>
          <div>
            <p className="ProfileMetrics-label">Seguidores</p>
            <p className="ProfileMetrics-value">{followStatus?.followersCount ?? '—'}</p>
          </div>
        </article>

        <article className="ProfileMetrics-card">
          <span className="ProfileMetrics-icon material-symbols-outlined" aria-hidden="true">person_add</span>
          <div>
            <p className="ProfileMetrics-label">Seguidos</p>
            <p className="ProfileMetrics-value">{followStatus?.followingCount ?? '—'}</p>
          </div>
        </article>

        <article className="ProfileMetrics-card">
          <span className="ProfileMetrics-icon material-symbols-outlined" aria-hidden="true">
            workspace_premium
          </span>
          <div className="ProfileMetrics-text">
            <p className="ProfileMetrics-label">Categoría principal</p>
            <p className="ProfileMetrics-value ProfileMetrics-value--text">{categories.topName ?? '—'}</p>
          </div>
        </article>
      </div>
    </div>
  );
}

export default ProfileMetrics;
