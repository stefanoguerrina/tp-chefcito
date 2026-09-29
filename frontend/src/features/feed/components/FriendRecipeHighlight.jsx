// Card grande de "Recetas por amigos": la receta más nueva, con la foto a lo ancho y, en el
// recuadro de abajo, el nombre, la bajada y, al final, quién la publicó, hace cuánto y el
// tiempo. Toda la card abre la receta (con el mouse o con Enter).
import RecipeHoverOverlay from '../../../core/components/RecipeHoverOverlay.jsx';
import SaveRecipeButton from '../../../core/components/SaveRecipeButton.jsx';
import FriendRecipeAuthor from './FriendRecipeAuthor.jsx';
import { formatPreparationTime } from '../../recipe/models/recipeModel.js';

// Recibe: recipe (ver toFriendRecipe en feedModel), isSaved, onToggleSave() y onOpen().
function FriendRecipeHighlight({ recipe, isSaved, onToggleSave, onOpen }) {
  const [mainCategory] = recipe.categories;

  // Con teclado: Enter sobre la card la abre (el botón de guardar tiene el suyo).
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && event.target === event.currentTarget) onOpen();
  };

  return (
    <article className="FriendRecipeHighlight" onClick={onOpen} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="FriendRecipeHighlight-media">
        <img className="FriendRecipeHighlight-image" src={recipe.image} alt={recipe.title} />
        <div className="FriendRecipeHighlight-shade" />
        <RecipeHoverOverlay />

        <div className="FriendRecipeHighlight-topBar">
          {mainCategory && <span className="FriendRecipeHighlight-category">{mainCategory}</span>}
          <SaveRecipeButton className="FriendRecipeHighlight-save" isSaved={isSaved} onToggle={onToggleSave} />
        </div>
      </div>

      <div className="FriendRecipeHighlight-body">
        <h3 className="FriendRecipeHighlight-title">{recipe.title}</h3>
        {recipe.description && <p className="FriendRecipeHighlight-description">{recipe.description}</p>}

        <div className="FriendRecipeHighlight-meta">
          <FriendRecipeAuthor creator={recipe.creator} publishedAt={recipe.publishedAt} />
          <span className="FriendRecipeHighlight-time">
            <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
            {formatPreparationTime(recipe.timeMinutes)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default FriendRecipeHighlight;
