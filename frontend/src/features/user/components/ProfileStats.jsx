// Estadísticas del perfil, en tarjetas sueltas debajo de ProfileCard: recetas publicadas,
// categorías distintas, valoración promedio y veces que la comunidad guardó sus recetas.
// Todo se calcula acá con las recetas ya cargadas (sin pedir nada extra al backend).
// Estilos en _profile-card.scss (mismo bloque visual que la tarjeta de perfil).

// Recibe: recipes (crudas del backend) y reviewStats ({ totalReviews, averageRating }).
// Devuelve las tarjetas a mostrar: { key, icon, label, value, note, isPositive }.
// isPositive pinta la nota de verde con flecha hacia arriba (un crecimiento real).
const buildStats = (recipes, reviewStats) => {
  const distinctCategoryCount = new Set(
    recipes.map((recipe) => recipe.recipecategory?.[0]?.category?.name).filter(Boolean)
  ).size;

  // Recetas creadas en el mes en curso (para el dato "+N este mes").
  const now = new Date();
  const recipesThisMonth = recipes.filter((recipe) => {
    if (!recipe.createdAt) return false;
    const createdAt = new Date(recipe.createdAt);
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
  }).length;

  // saveCount es un contador real que el backend lleva por receta.
  const totalSaves = recipes.reduce((sum, recipe) => sum + (recipe.saveCount ?? 0), 0);
  const { totalReviews, averageRating } = reviewStats;

  return [
    {
      key: 'recipes',
      icon: 'menu_book',
      label: 'Recetas publicadas',
      value: recipes.length,
      note: recipesThisMonth > 0 ? `${recipesThisMonth} este mes` : 'Ninguna este mes',
      isPositive: recipesThisMonth > 0,
    },
    {
      key: 'categories',
      icon: 'category',
      label: 'Categorías distintas',
      value: distinctCategoryCount,
      note: 'en las recetas publicadas',
    },
    {
      key: 'rating',
      icon: 'star',
      label: 'Valoración promedio',
      value: averageRating != null ? averageRating.toFixed(1) : '—',
      note: `${totalReviews} reseña${totalReviews !== 1 ? 's' : ''} de comensales`,
    },
    {
      key: 'saves',
      icon: 'bookmark',
      label: 'Veces guardada',
      value: totalSaves,
      note: 'por la comunidad',
    },
  ];
};

function ProfileStats({ recipes, reviewStats }) {
  const stats = buildStats(recipes, reviewStats);

  return (
    <ul className="ProfileStats">
      {stats.map((stat) => (
        <li key={stat.key} className="ProfileStats-stat">
          <div className="ProfileStats-header">
            <span className="ProfileStats-label">{stat.label}</span>
            <span className="ProfileStats-icon material-symbols-outlined">{stat.icon}</span>
          </div>
          <span className="ProfileStats-value">{stat.value}</span>
          <span className={`ProfileStats-note${stat.isPositive ? ' ProfileStats-note--positive' : ''}`}>
            {stat.isPositive && <span className="material-symbols-outlined">arrow_upward</span>}
            {stat.note}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default ProfileStats;
