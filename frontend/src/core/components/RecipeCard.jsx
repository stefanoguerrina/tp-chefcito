// Card de receta de toda la app (landing, home, "Mis recetas", perfil, guardadas, vista
// previa del wizard). Adapta a nuestro stack el diseño "Glass Blog Card" (shadcn): foto
// con zoom y categorías encima, botón de guardar, bajada, y pie con autor + valoración.
// Sin Tailwind, framer-motion ni lucide-react: SASS, animaciones CSS y Material Symbols.
import { useState } from 'react';
import RatingStars from './RatingStars.jsx';
import RecipeHoverOverlay from './RecipeHoverOverlay.jsx';
import SaveRecipeButton from './SaveRecipeButton.jsx';
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
//   showCategories: oculta los chips de categoría sobre la foto (ej. el top 5 de la landing,
//   donde la foto se ve más limpia y el puesto ya es lo que importa).
//   isSaved / onToggleSave: estado y handler del botón de guardar de arriba a la derecha.
//   onEdit / onDelete: si se pasan (ej. "Mis recetas"), la card suma su barra de acciones.
//   horizontal: foto cuadrada a la izquierda y el texto a la derecha (desde sm; en mobile se
//   apila igual que la vertical). Es la vista "lista" de los listados y las recetas de amigos
//   de la home. El lado de la foto es --recipe-card-image-size (200px por defecto).
//   saveButtonInCorner: el botón de guardar va en la esquina de arriba a la derecha de la
//   card (más chico) en vez de sobre la foto. Pensado para la disposición horizontal.
//   authorNote: texto corto al lado del nombre del autor (ej. "hace 3 días").
//   children: contenido extra opcional debajo de la bajada (ej. en la búsqueda "Con mi
//   despensa", cuántos ingredientes de la receta tiene el usuario).
function RecipeCard({
  recipe, onClick, showSaveButton = true, showAuthor = true, showTime = true, showRating = true,
  showCategories = true, horizontal = false, saveButtonInCorner = false, authorNote,
  isSaved, onToggleSave, onEdit, onDelete, children,
}) {
  const {
    title, description, image, author, authorAvatar,
    categories = [], timeMinutes, rating, reviewsCount,
  } = recipe;
  const canManage = Boolean(onEdit || onDelete);
  const visibleCategories = showCategories ? categories.slice(0, MAX_VISIBLE_CATEGORIES) : [];
  const hiddenCategoriesCount = categories.length - visibleCategories.length;
  // Si la foto del autor no carga (o no tiene), se muestra la inicial de su nombre.
  const [avatarBroken, setAvatarBroken] = useState(false);
  const authorInitial = author?.replace('@', '')[0]?.toUpperCase() ?? '?';

  const saveButton = showSaveButton && (
    <SaveRecipeButton
      className="RecipeCard-saveButton"
      size={saveButtonInCorner ? 'sm' : 'md'}
      isSaved={isSaved}
      onToggle={onToggleSave}
    />
  );

  const classes = [
    'RecipeCard',
    onClick && 'RecipeCard--clickable',
    horizontal && 'RecipeCard--horizontal',
    saveButtonInCorner && 'RecipeCard--saveInCorner',
  ].filter(Boolean).join(' ');

  return (
    <article className={classes} onClick={onClick}>
      <div className="RecipeCard-imageWrapper">
        <img className="RecipeCard-image" src={image} alt={title} />
        <div className="RecipeCard-imageShade" />

        {onClick && <RecipeHoverOverlay />}

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

        {!saveButtonInCorner && saveButton}
      </div>

      <div className="RecipeCard-body">
        <div className="RecipeCard-text">
          <h3 className="RecipeCard-title">{title}</h3>
          {description && <p className="RecipeCard-description">{description}</p>}
        </div>

        {children}

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
              {showAuthor && (
                <span className="RecipeCard-authorLine">
                  <span className="RecipeCard-authorName">{author}</span>
                  {authorNote && <span className="RecipeCard-authorNote">· {authorNote}</span>}
                </span>
              )}
              {showRating && (
                <span className="RecipeCard-rating">
                  <RatingStars rating={rating} />
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

      {saveButtonInCorner && saveButton}
    </article>
  );
}

export default RecipeCard;
