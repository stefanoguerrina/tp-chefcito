// Fila de una receta en el panel de búsqueda rápida: foto, nombre, tiempo y categoría.
// Lleva al detalle de la receta.
import { Link } from 'react-router-dom';
import HighlightedText from './HighlightedText.jsx';
import '../styles/_search-result-items.scss';

// Recibe: recipe (props de RecipeCard: { id, title, image, timeMinutes, categories }), term
// (para resaltar) y onNavigate (cierra el panel al elegirla). En la fila entra una sola
// categoría: la primera.
function RecipeResultItem({ recipe, term, onNavigate }) {
  return (
    <Link to={`/recetas/${recipe.id}`} className="RecipeResultItem" onClick={onNavigate}>
      <img className="RecipeResultItem-image" src={recipe.image} alt="" loading="lazy" />
      <span className="RecipeResultItem-text">
        <span className="RecipeResultItem-title">
          <HighlightedText text={recipe.title} term={term} />
        </span>
        <span className="RecipeResultItem-meta">
          {recipe.timeMinutes != null && (
            <span className="RecipeResultItem-time">
              <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
              {recipe.timeMinutes} min
            </span>
          )}
          {recipe.categories[0] && <span className="RecipeResultItem-category">{recipe.categories[0]}</span>}
        </span>
      </span>
      <span className="RecipeResultItem-arrow material-symbols-outlined" aria-hidden="true">
        north_east
      </span>
    </Link>
  );
}

export default RecipeResultItem;
