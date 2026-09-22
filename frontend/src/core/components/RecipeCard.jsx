// Card de receta (imagen + badge + título + tiempo/dificultad + rating).
// Reutilizable por cualquier feature que necesite listar recetas (landing, búsqueda, etc.).
import StarRating from './StarRating.jsx';
import './_recipe-card.scss';

// Recibe: recipe (ver landingMockData.createMockRecipe para la forma esperada),
// onClick (handler opcional al hacer click en la card) y, opcionalmente, onEdit/
// onDelete: cuando se pasan (ej. en "Mis recetas"), la card agrega su propia
// barra de acciones de administración integrada, en vez de dejar esos botones
// sueltos afuera. Si no se pasan, la card se ve igual que en cualquier otro lado.
// isSaved/onToggleSave: cuando se pasa onToggleSave (ej. en "Recetas guardadas"),
// el listón de arriba a la derecha se vuelve funcional y guarda/quita la receta
// en vez de mostrarse como un corazón decorativo.
function RecipeCard({ recipe, onClick, onEdit, onDelete, isSaved, onToggleSave }) {
  const { title, author, image, rating, reviewsCount, timeMinutes, difficulty, badge } = recipe;
  const canManage = Boolean(onEdit || onDelete);

  return (
    <article className="RecipeCard" onClick={onClick}>
      <div className="RecipeCard-imageWrapper">
        <img className="RecipeCard-image" src={image} alt={title} />
        {badge && (
          <span className="RecipeCard-badge">
            <span className="material-symbols-outlined">{badge.icon}</span>
            {badge.label}
          </span>
        )}
        {onToggleSave && (
          <button
            type="button"
            className={`RecipeCard-favoriteButton${isSaved ? ' RecipeCard-favoriteButton--saved' : ''}`}
            aria-label={isSaved ? 'Quitar receta guardada' : 'Guardar receta'}
            aria-pressed={isSaved}
            onClick={(event) => { event.stopPropagation(); onToggleSave(); }}
          >
            <span className="material-symbols-outlined">bookmark</span>
          </button>
        )}
      </div>

      <div className="RecipeCard-body">
        <span className="RecipeCard-author">Por {author}</span>
        <h3 className="RecipeCard-title">{title}</h3>

        <div className="RecipeCard-meta">
          <span className="material-symbols-outlined">schedule</span>
          <span>{timeMinutes}m</span>
          <span className="RecipeCard-metaDot" />
          <span className="material-symbols-outlined">signal_cellular_alt</span>
          <span>{difficulty}</span>
        </div>

        <StarRating rating={rating} reviewsCount={reviewsCount} />

        {canManage && (
          <div className="RecipeCard-manageActions">
            {onEdit && (
              <button
                type="button"
                className="RecipeCard-manageButton RecipeCard-manageButton--edit"
                onClick={(event) => { event.stopPropagation(); onEdit(); }}
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="RecipeCard-manageButton RecipeCard-manageButton--delete"
                onClick={(event) => { event.stopPropagation(); onDelete(); }}
              >
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default RecipeCard;
