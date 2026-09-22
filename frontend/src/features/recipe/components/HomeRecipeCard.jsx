// Card de receta compacta usada en los carruseles horizontales de la home. Es más
// angosta que RecipeCard (core/components) y admite dos variantes de body: una bajada
// corta (description) o el tiempo/dificultad + autor, según lo que traiga la receta.
// onClick opcional: si se pasa, la card se vuelve clickeable (navegación al detalle).
import '../styles/_home-recipe-card.scss';

// Recibe: recipe (ver recipeToHomeCardProps en features/recipe/models/recipeModel.js),
// onClick (handler opcional para abrir el detalle de la receta).
function HomeRecipeCard({ recipe, onClick }) {
  const { title, image, description, time, difficulty, author, authorAvatar } = recipe;

  return (
    <article
      className={`HomeRecipeCard${onClick ? ' HomeRecipeCard--clickable' : ''}`}
      onClick={onClick}
    >
      <div className="HomeRecipeCard-imageWrapper">
        <img className="HomeRecipeCard-image" src={image} alt={title} />
        <button type="button" className="HomeRecipeCard-favoriteButton" aria-label="Guardar receta">
          <span className="material-symbols-outlined">bookmark</span>
        </button>
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
