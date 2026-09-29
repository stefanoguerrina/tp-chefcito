// Card de receta de toda la app (landing, home, "Mis recetas", perfil, guardadas, vista
// previa del wizard). Adapta a nuestro stack el diseño "Glass Blog Card" (shadcn): foto
// con zoom y categorías encima, botón de guardar, bajada, y pie con autor + valoración.
// Sin Tailwind, framer-motion ni lucide-react: SASS, animaciones CSS y Material Symbols.
import { useState } from 'react';
import './_recipe-card.scss';

// Cuántas categorías entran sobre la foto; el resto se resume en un chip "+N".
const MAX_VISIBLE_CATEGORIES = 3;

// Recibe: timeMinutes (número, string o null). Devuelve: el texto del tiempo de la receta.
const formatTime = (timeMinutes) =>
  timeMinutes === null || timeMinutes === undefined || timeMinutes === '' ? 'Sin definir' : `${timeMinutes} min`;

// Recibe: rating (número o undefined) y reviewsCount (número o undefined). Devuelve el
// texto de valoración que va debajo del nombre del autor.
const formatRating = (rating, reviewsCount) =>
  reviewsCount ? `${rating.toFixed(1)} (${reviewsCount})` : 'Sin reseñas';

// Recibe:
//   recipe: { title, description?, image, author, authorAvatar?, categories?, timeMinutes,
//             rating?, reviewsCount? } (ver recipeToCardProps). Sin rating/reviewsCount,
//             o con reviewsCount en 0, muestra "Sin reseñas".
//   onClick: abre la receta (opcional; si no viene, la card no es clickeable).
//   showSaveButton: oculta el botón de guardar donde no tiene sentido (ej. tus propias recetas).
//   showAuthor / showTime: ocultan el autor y el tiempo de preparación donde son obvios o
//   no aportan (ej. "Mis recetas": ya sabés que la creaste vos y cuánto tarda).
//   showRating: oculta la valoración (ej. las recetas del perfil propio, que se abren para
//   editarlas: ahí la card queda limpia, sin reseñas).
//   isSaved / onToggleSave: estado y handler del botón de guardar de arriba a la derecha.
//   onEdit / onDelete: si se pasan (ej. "Mis recetas"), la card suma su barra de acciones.
function RecipeCard({
  recipe, onClick, showSaveButton = true, showAuthor = true, showTime = true, showRating = true,
  isSaved, onToggleSave, onEdit, onDelete,
}) {
  const {
    title, description, image, author, authorAvatar,
    categories = [], timeMinutes, rating, reviewsCount,
  } = recipe;
  const canManage = Boolean(onEdit || onDelete);
  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenCategoriesCount = categories.length - visibleCategories.length;
  // Si la foto del autor no carga (o no tiene), se muestra la inicial de su nombre.
  const [avatarBroken, setAvatarBroken] = useState(false);
  const authorInitial = author?.replace('@', '')[0]?.toUpperCase() ?? '?';

  // Los botones viven dentro de la card clickeable: stopPropagation evita que el click
  // también abra la receta.
  const handleToggleSave = (event) => {
    event.stopPropagation();
    onToggleSave?.();
  };

  return (
    <article className={`RecipeCard${onClick ? ' RecipeCard--clickable' : ''}`} onClick={onClick}>
      <div className="RecipeCard-imageWrapper">
        <img className="RecipeCard-image" src={image} alt={title} />
        <div className="RecipeCard-imageShade" />

        {/* Aparece al pasar el mouse. Es solo visual (un span, no un botón): el click lo
            maneja la card entera. Texto genérico porque el destino varía según quién la
            use (ver detalle, ir al editor...): lo decide el onClick de quien la llama. */}
        {onClick && (
          <div className="RecipeCard-hoverOverlay">
            <span className="RecipeCard-viewAction">
              <span className="material-symbols-outlined">menu_book</span>
              Abrir receta
            </span>
          </div>
        )}

        {visibleCategories.length > 0 && (
          <div className="RecipeCard-categories">
            {visibleCategories.map((category) => (
              <span key={category} className="RecipeCard-category">{category}</span>
            ))}
            {hiddenCategoriesCount > 0 && (
              <span className="RecipeCard-category">+{hiddenCategoriesCount}</span>
            )}
          </div>
        )}

        {showSaveButton && (
          <button
            type="button"
            className={`RecipeCard-saveButton${isSaved ? ' RecipeCard-saveButton--saved' : ''}`}
            aria-label={isSaved ? 'Quitar receta guardada' : 'Guardar receta'}
            title={isSaved ? 'Quitar de guardadas' : 'Guardar receta'}
            aria-pressed={Boolean(isSaved)}
            onClick={handleToggleSave}
          >
            <span className="material-symbols-outlined">bookmark</span>
          </button>
        )}
      </div>

      <div className="RecipeCard-body">
        <div className="RecipeCard-text">
          <h3 className="RecipeCard-title">{title}</h3>
          {description && <p className="RecipeCard-description">{description}</p>}
        </div>

        <div className="RecipeCard-footer">
          <div className="RecipeCard-author">
            {showAuthor && (
              authorAvatar && !avatarBroken ? (
                <img className="RecipeCard-avatar" src={authorAvatar} alt="" onError={() => setAvatarBroken(true)} />
              ) : (
                <span className="RecipeCard-avatar RecipeCard-avatar--initial">{authorInitial}</span>
              )
            )}
            <span className="RecipeCard-authorText">
              {showAuthor && <span className="RecipeCard-authorName">{author}</span>}
              {showRating && (
                <span className="RecipeCard-rating">
                  <span className="material-symbols-outlined">star</span>
                  {formatRating(rating, reviewsCount)}
                </span>
              )}
            </span>
          </div>

          {showTime && (
            <span className="RecipeCard-metaItem">
              <span className="material-symbols-outlined">schedule</span>
              {formatTime(timeMinutes)}
            </span>
          )}
        </div>

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
