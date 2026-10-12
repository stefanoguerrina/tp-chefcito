// Card "+N más" del final de una sección de la página de resultados: ocupa el último
// lugar de la grilla cuando hay más coincidencias de las que entran, y lleva a verlas todas.
import { Link } from 'react-router-dom';

// Recibe: hiddenCount (cuántos resultados no se muestran), label (qué son, ej. "Recetas
// más"), actionLabel (texto del botón, ej. "Explorar todas"), to (URL del listado
// completo) e isTall (true en la grilla de recetas: la card acompaña el alto de las
// RecipeCard y apila el texto arriba del botón).
function SearchMoreCard({ hiddenCount, label, actionLabel, to, isTall = false }) {
  return (
    <Link to={to} className={`SearchMoreCard${isTall ? ' SearchMoreCard--tall' : ''}`}>
      <span className="SearchMoreCard-text">
        <span className="SearchMoreCard-count">+{hiddenCount}</span>
        <span className="SearchMoreCard-label">{label}</span>
      </span>
      <span className="SearchMoreCard-action">
        {actionLabel}
        <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </span>
    </Link>
  );
}

export default SearchMoreCard;
