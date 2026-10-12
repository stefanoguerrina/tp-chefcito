// Una sección del panel de búsqueda rápida (Categorías, Recetas o Usuarios): título con
// la cantidad de coincidencias, los primeros resultados y el link a verlos todos.
import { Link } from 'react-router-dom';

// Recibe: title, total (coincidencias reales, no solo las que se muestran), seeAllLabel
// (ej. "Ver todas las recetas"), seeAllTo (URL de la página de resultados), layout
// ('grid3' | 'grid2' | 'list', cómo se acomodan los items), children (los items) y
// onNavigate (avisa que se eligió un link, para cerrar el panel).
function QuickSearchSection({ title, total, seeAllLabel, seeAllTo, layout, children, onNavigate }) {
  return (
    <section className="QuickSearchSection">
      <div className="QuickSearchSection-header">
        <h3 className="QuickSearchSection-title">{title}</h3>
        <span className="QuickSearchSection-count">
          {total} {total === 1 ? 'coincidencia' : 'coincidencias'}
        </span>
      </div>

      <div className={`QuickSearchSection-items QuickSearchSection-items--${layout}`}>{children}</div>

      <Link to={seeAllTo} className="QuickSearchSection-seeAll" onClick={onNavigate}>
        <span>
          {seeAllLabel} ({total})
        </span>
        <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </Link>
    </section>
  );
}

export default QuickSearchSection;
