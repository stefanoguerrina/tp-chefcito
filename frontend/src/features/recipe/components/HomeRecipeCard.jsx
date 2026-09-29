// Card de receta compacta usada en los carruseles horizontales de la home. Mismo diseño
// que core/components/RecipeCard (categorías sobre la foto, botón de guardar, bajada,
// autor + valoración), pero de ancho fijo para desplazarse en fila. onClick opcional: si
// se pasa, la card se vuelve clickeable (navegación al detalle).
import { useState } from 'react';
import '../styles/_home-recipe-card.scss';

// Cuántas categorías entran sobre la foto; el resto se resume en un chip "+N" (mismo
// límite que RecipeCard, ver core/components/RecipeCard.jsx).
const MAX_VISIBLE_CATEGORIES = 2;

// Recibe: timeMinutes (número, string o null). Devuelve: el texto del tiempo de la receta.
const formatTime = (timeMinutes) =>
  timeMinutes === null || timeMinutes === undefined || timeMinutes === '' ? 'Sin definir' : `${timeMinutes} min`;

// Recibe: rating (número o undefined) y reviewsCount (número o undefined). Devuelve el
// texto de valoración que va debajo del nombre del autor (mismo criterio que RecipeCard).
const formatRating = (rating, reviewsCount) =>
  reviewsCount ? `${rating.toFixed(1)} (${reviewsCount})` : 'Sin reseñas';

// Recibe: recipe (ver recipeToCardProps en features/recipe/models/recipeModel.js, más
// isSaved), onClick (handler opcional para abrir el detalle de la receta) y onToggleSave
// (handler opcional para guardar/quitar la receta sin entrar al detalle).
function HomeRecipeCard({ recipe, onClick, onToggleSave }) {
  const { title, description, image, author, authorAvatar, categories = [], timeMinutes, rating, reviewsCount, isSaved } = recipe;
  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenCategoriesCount = categories.length - visibleCategories.length;
  // Se activa si la foto del autor no llega a cargar (URL rota, sin conexión, etc.).
  const [avatarBroken, setAvatarBroken] = useState(false);
  const authorInitial = author?.replace('@', '')[0]?.toUpperCase() ?? '?';

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
        <div className="HomeRecipeCard-imageShade" />

        {visibleCategories.length > 0 && (
          <div className="HomeRecipeCard-categories">
            {visibleCategories.map((category) => (
              <span key={category} className="HomeRecipeCard-category">{category}</span>
            ))}
            {hiddenCategoriesCount > 0 && (
              <span className="HomeRecipeCard-category">+{hiddenCategoriesCount}</span>
            )}
          </div>
        )}

        {onToggleSave && (
          <button
            type="button"
            className={`HomeRecipeCard-saveButton${isSaved ? ' HomeRecipeCard-saveButton--saved' : ''}`}
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
        {description && <p className="HomeRecipeCard-description">{description}</p>}

        <div className="HomeRecipeCard-footer">
          {author && (
            <div className="HomeRecipeCard-author">
              {authorAvatar && !avatarBroken ? (
                <img src={authorAvatar} alt="" onError={() => setAvatarBroken(true)} />
              ) : (
                <span className="HomeRecipeCard-avatar--initial">{authorInitial}</span>
              )}
              <span className="HomeRecipeCard-authorText">
                <span className="HomeRecipeCard-authorName">{author}</span>
                <span className="HomeRecipeCard-rating">
                  <span className="material-symbols-outlined">star</span>
                  {formatRating(rating, reviewsCount)}
                </span>
              </span>
            </div>
          )}

          <span className="HomeRecipeCard-metaItem">
            <span className="material-symbols-outlined">schedule</span>
            {formatTime(timeMinutes)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default HomeRecipeCard;
