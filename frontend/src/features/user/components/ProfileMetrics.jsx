// Panel de métricas del perfil: recetas publicadas, categorías distintas, valoración
// promedio y cuántas veces la comunidad guardó sus recetas. Todo se calcula acá a partir
// de las recetas ya cargadas (sin pedir nada extra al backend).

// Recibe: recipes (crudas del backend), reviewStats ({ totalReviews, averageRating }) e
// isOwnProfile (para el texto "mi"/"su").
function ProfileMetrics({ recipes, reviewStats, isOwnProfile }) {
  const distinctCategoryCount = new Set(
    recipes
      .map((recipe) => recipe.recipecategory?.[0]?.category?.name)
      .filter(Boolean)
  ).size;

  // Recetas creadas en el mes en curso (para el badge "+N este mes").
  const now = new Date();
  const recipesThisMonth = recipes.filter((recipe) => {
    if (!recipe.createdAt) return false;
    const createdAt = new Date(recipe.createdAt);
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;

  // Cuántas veces, en total, la comunidad guardó alguna receta propia (saveCount
  // es un contador real que ya lleva el backend por receta).
  const totalSaves = recipes.reduce((sum, recipe) => sum + (recipe.saveCount ?? 0), 0);

  return (
    <section className="ProfilePage-metrics">
      <div className="ProfilePage-metricsHeader">
        <div className="ProfilePage-metricsTitle">
          <span className="ProfilePage-metricsDot" />
          <span className="ProfilePage-metricsEyebrow">
            Panel de creador • Estadísticas de {isOwnProfile ? 'mi' : 'su'} contenido
          </span>
        </div>
        <button
          type="button"
          className="ProfilePage-metricsLink"
          disabled
          title="Todavía no disponible"
        >
          <span className="material-symbols-outlined">analytics</span>
          Ver estadísticas detalladas
        </button>
      </div>

      <div className="ProfilePage-metricsGrid">
        <div className="ProfilePage-metric">
          <div className="ProfilePage-metricTop">
            <span className="ProfilePage-metricValue">{recipes.length}</span>
            {recipesThisMonth > 0 && (
              <span className="ProfilePage-metricBadge">+{recipesThisMonth} este mes</span>
            )}
          </div>
          <span className="ProfilePage-metricLabel">Recetas publicadas</span>
        </div>

        <div className="ProfilePage-metric">
          <div className="ProfilePage-metricTop">
            <span className="ProfilePage-metricValue">{distinctCategoryCount}</span>
          </div>
          <span className="ProfilePage-metricLabel">Categorías distintas</span>
        </div>

        <div className="ProfilePage-metric">
          <div className="ProfilePage-metricTop">
            <span className="ProfilePage-metricValue">
              {reviewStats.averageRating != null ? reviewStats.averageRating.toFixed(1) : '—'}
            </span>
            {reviewStats.averageRating != null && <span className="ProfilePage-metricStar">★</span>}
          </div>
          <span className="ProfilePage-metricLabel">
            {reviewStats.totalReviews} reseña{reviewStats.totalReviews !== 1 ? 's' : ''} de comensales
          </span>
        </div>

        <div className="ProfilePage-metric">
          <div className="ProfilePage-metricTop">
            <span className="ProfilePage-metricValue">{totalSaves}</span>
          </div>
          <span className="ProfilePage-metricLabel">Veces guardada por la comunidad</span>
        </div>
      </div>
    </section>
  );
}

export default ProfileMetrics;
