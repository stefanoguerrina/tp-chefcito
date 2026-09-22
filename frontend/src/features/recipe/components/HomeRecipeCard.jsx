// Card de receta compacta usada en los carruseles horizontales de la home. Es más
// angosta que RecipeCard (core/components) y admite dos variantes de body: una bajada
// corta (description) o el tiempo/dificultad + autor, según lo que traiga la receta.
// onClick opcional: si se pasa, la card se vuelve clickeable (navegación al detalle).
import '../styles/_home-recipe-card.scss';

// Recibe: recipe (ver recipeToHomeCardProps en features/recipe/models/recipeModel.js,
// incluye isSaved), onClick (handler opcional para abrir el detalle de la receta),
// onToggleSave (handler opcional para guardar/quitar la receta sin entrar al detalle).
function HomeRecipeCard({ recipe, onClick, onToggleSave }) {
  const { title, image, badge, description, time, difficulty, author, authorAvatar, isSaved } = recipe;

  // El botón de guardar vive dentro de la card clickeable: evita que el click
  // también dispare la navegación al detalle. El error (si lo hay) ya lo
  // muestra HomePage, que es quien revierte el estado optimista.
  const handleToggleSave = (event) => {
    event.stopPropagation();
    onToggleSave?.(recipe.id).catch(() => {});
  };

  return (
    <article
      className={`HomeRecipeCard${onClick ? ' HomeRecipeCard--clickable' : ''}`}
      onClick={onClick}
    >
      <div className="HomeRecipeCard-imageWrapper">
        <img className="HomeRecipeCard-image" src={image} alt={title} />
        {badge && <span className="HomeRecipeCard-badge">{badge.label}</span>}
        {onToggleSave && (
          <button
            type="button"
            className={`HomeRecipeCard-favoriteButton${isSaved ? ' HomeRecipeCard-favoriteButton--saved' : ''}`}
            aria-label={isSaved ? 'Quitar receta guardada' : 'Guardar receta'}
            aria-pressed={isSaved}
            onClick={handleToggleSave}
          >
            <span className="material-symbols-outlined">bookmark</span>
          </button>
        )}
      </div>

      <div className="HomeRecipeCard-body">
        <h3 className="HomeRecipeCard-title">{title}</h3>

        {description ? (
          <p className="HomeRecipeCard-description">{description}</p>
        ) : (
          <div className="HomeRecipeCard-meta">
            <span className="material-symbols-outlined">schedule</span>
            <span>{time}</span>
            <span className="HomeRecipeCard-metaDot" />
            <span>{difficulty}</span>
          </div>
        )}

        {author && (
          <div className="HomeRecipeCard-author">
            <img src={authorAvatar} alt={author} />
            <span>{author}</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default HomeRecipeCard;