// Tarjeta de una categoría de receta en los resultados de búsqueda (panel rápido y página
// /buscar). Lleva a la página de resultados filtrada por esa categoría.
import { Link } from 'react-router-dom';
import HighlightedText from './HighlightedText.jsx';
import { buildSearchPagePath, SEARCH_TYPES } from '../models/searchModel.js';
import '../styles/_search-result-items.scss';

// Recibe: category ({ id, name, description, recipeCount }), term (para resaltar), accent ('primary' |
// 'secondary' | 'tertiary', color del ícono), variant ('row' en el panel, 'card' en la
// página: más grande y con borde) y onNavigate (opcional, cierra el panel al elegirla).
function CategoryResultItem({ category, term, accent, variant = 'row', onNavigate }) {
  return (
    <Link
      to={buildSearchPagePath({ type: SEARCH_TYPES.recipes, categoryId: category.id })}
      className={`CategoryResultItem CategoryResultItem--${accent} CategoryResultItem--${variant}`}
      onClick={onNavigate}
    >
      <span className="CategoryResultItem-icon material-symbols-outlined" aria-hidden="true">
        restaurant_menu
      </span>
      <span className="CategoryResultItem-text">
        <span className="CategoryResultItem-name">
          <HighlightedText text={category.name} term={term} />
        </span>
        <span className="CategoryResultItem-meta">
          {category.recipeCount} {category.recipeCount === 1 ? 'receta' : 'recetas'}
        </span>
        {/* La descripción solo entra en la card grande (la fila del panel es angosta). */}
        {variant === 'card' && category.description && (
          <span className="CategoryResultItem-description">{category.description}</span>
        )}
      </span>
      <span className="CategoryResultItem-chevron material-symbols-outlined" aria-hidden="true">
        chevron_right
      </span>
    </Link>
  );
}

export default CategoryResultItem;
