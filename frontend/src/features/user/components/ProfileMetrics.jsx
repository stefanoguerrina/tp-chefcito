// Métricas del perfil en formato "bento", debajo de la portada: una tarjeta grande a la
// izquierda (valoración promedio) y tres apiladas a la derecha (recetas por mes,
// categorías y categoría principal), cada una con su dato a la izquierda y un gráfico o
// ícono a la derecha.
import RatingStars from '../../../core/components/RatingStars.jsx';
import '../styles/_profile-metrics.scss';

// Recibe: metrics (ver buildProfileMetrics en models/profileMetricsModel.js).
function ProfileMetrics({ metrics }) {
  const { rating, recipesCount, recipesPerMonth, categories } = metrics;
  // Las barras se miden contra el mes con más recetas (si todos están en 0, contra 1).
  const maxPerMonth = Math.max(1, ...recipesPerMonth.map((month) => month.count));

  return (
    <div className="ProfileMetrics">
      <article className="ProfileMetrics-card ProfileMetrics-primary">
        <div className="ProfileMetrics-pattern" aria-hidden="true" />
        <div>
          <span className="ProfileMetrics-chip">Valoración</span>
          <p className="ProfileMetrics-primaryValue">{rating.averageRating.toFixed(1)}</p>
          <RatingStars rating={rating.averageRating} />
        </div>
        <p className="ProfileMetrics-primaryNote">
          {rating.totalReviews} {rating.totalReviews === 1 ? 'reseña' : 'reseñas'}
        </p>
      </article>

      <div className="ProfileMetrics-group">
        <article className="ProfileMetrics-card">
          <div>
            <p className="ProfileMetrics-label">Recetas</p>
            <p className="ProfileMetrics-value">{recipesCount}</p>
          </div>
          {/* Recetas publicadas en cada uno de los últimos meses (el detalle, al pasar el mouse). */}
          <div className="ProfileMetrics-bars">
            {recipesPerMonth.map((month) => (
              <span
                key={month.label}
                className="ProfileMetrics-bar"
                style={{ height: `${Math.max(8, (month.count / maxPerMonth) * 100)}%` }}
                title={`${month.label}: ${month.count}`}
              />
            ))}
          </div>
        </article>

        <article className="ProfileMetrics-card">
          <div>
            <p className="ProfileMetrics-label">Categorías</p>
            <p className="ProfileMetrics-value">{categories.distinctCount}</p>
          </div>
          <span className="ProfileMetrics-icon material-symbols-outlined" aria-hidden="true">category</span>
        </article>

        <article className="ProfileMetrics-card">
          <div className="ProfileMetrics-text">
            <p className="ProfileMetrics-label">Categoría principal</p>
            <p className="ProfileMetrics-value ProfileMetrics-value--text">{categories.topName ?? '—'}</p>
          </div>
          <span className="ProfileMetrics-icon material-symbols-outlined" aria-hidden="true">
            workspace_premium
          </span>
        </article>
      </div>
    </div>
  );
}

export default ProfileMetrics;
