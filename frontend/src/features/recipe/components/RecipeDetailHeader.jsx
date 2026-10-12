// Cabecera del detalle de receta: categorías, tiempo de preparación y porciones, acciones
// (guardar y compartir), título, descripción y, abajo, el autor con la acción que
// corresponda ("Editar receta" si es propia, "Donar" si es de otro usuario).
import { useState } from 'react';
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';
import { formatServings } from '../models/recipeModel.js';
import '../styles/_recipe-detail-header.scss';

// Iniciales del autor para el avatar de respaldo (sin foto o con la URL rota).
const getInitials = (user) =>
  `${user?.name?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';

// Recibe:
//   recipe: cruda del backend (name, description, preparationTime, servings, recipecategory[], user).
//   isOwnRecipe: si la creó el usuario logueado (cambia la acción del pie).
//   canSave / isSaved / onSave: botón "Guardar" (solo en recetas de otros).
//   onShare, onAuthorClick(authorId), onEdit, onDonate: acciones de cada botón.
function RecipeDetailHeader({
  recipe, isOwnRecipe, canSave, isSaved, onSave, onShare, onAuthorClick, onEdit, onDonate,
}) {
  // Se activa si la foto del autor no llega a cargar: se cae a las iniciales.
  const [avatarBroken, setAvatarBroken] = useState(false);
  const author = recipe.user;
  const avatarUrl = resolveImageUrl(author?.avatarUrl);
  const categories = (recipe.recipecategory ?? []).map((link) => link.category?.name).filter(Boolean);
  const authorName = author ? `${author.name ?? ''} ${author.lastName ?? ''}`.trim() || author.username : 'Autor desconocido';

  return (
    <section className="RecipeDetailCard RecipeDetailHeader">
      <div className="RecipeDetailHeader-top">
        <div className="RecipeDetailHeader-chips">
          {categories.map((name) => (
            <span key={name} className="RecipeDetailHeader-chip">{name}</span>
          ))}
          {recipe.preparationTime && (
            <span className="RecipeDetailHeader-chip RecipeDetailHeader-chip--muted">
              <span className="material-symbols-outlined">schedule</span>
              {recipe.preparationTime} min
            </span>
          )}
          {recipe.servings && (
            <span className="RecipeDetailHeader-chip RecipeDetailHeader-chip--muted">
              <span className="material-symbols-outlined">restaurant</span>
              {formatServings(recipe.servings)}
            </span>
          )}
        </div>

        <div className="RecipeDetailHeader-actions">
          {canSave && (
            <button
              type="button"
              className={`RecipeDetailHeader-smallBtn${isSaved ? ' RecipeDetailHeader-smallBtn--saved' : ''}`}
              onClick={onSave}
              aria-pressed={isSaved}
            >
              <span className="material-symbols-outlined">bookmark</span>
              {isSaved ? 'Guardada' : 'Guardar'}
            </button>
          )}
          <button type="button" className="RecipeDetailHeader-smallBtn" onClick={onShare}>
            <span className="material-symbols-outlined">share</span>
            Compartir
          </button>
        </div>
      </div>

      <div>
        <h1 className="RecipeDetailHeader-title">{recipe.name}</h1>
        {recipe.description && <p className="RecipeDetailHeader-description">{recipe.description}</p>}
      </div>

      <div className="RecipeDetailHeader-footer">
        {/* El autor lleva a su perfil (o al propio, si la receta es tuya). */}
        <button
          type="button"
          className="RecipeDetailHeader-author"
          onClick={() => author && onAuthorClick(author.id)}
          disabled={!author}
        >
          <span className="RecipeDetailHeader-avatar">
            {avatarUrl && !avatarBroken ? (
              <img src={avatarUrl} alt="" onError={() => setAvatarBroken(true)} />
            ) : (
              getInitials(author)
            )}
          </span>
          <span className="RecipeDetailHeader-authorText">
            <span className="RecipeDetailHeader-authorName">{authorName}</span>
            {author?.username && <span className="RecipeDetailHeader-authorUser">@{author.username}</span>}
          </span>
        </button>

        {isOwnRecipe ? (
          <button type="button" className="RecipeDetailHeader-primaryBtn" onClick={onEdit}>
            <span className="material-symbols-outlined">edit</span>
            Editar receta
          </button>
        ) : (
          <button type="button" className="RecipeDetailHeader-primaryBtn" onClick={onDonate}>
            <span className="material-symbols-outlined">volunteer_activism</span>
            Donar
          </button>
        )}
      </div>
    </section>
  );
}

export default RecipeDetailHeader;
