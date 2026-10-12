// Paginador de los listados completos de búsqueda: "Mostrando 1-12 de 16 recetas" +
// botones de página anterior/siguiente y números de página.
import { buildPageList } from '../models/searchListingModel.js';
import '../styles/_search-pagination.scss';

// Recibe: page, totalPages, total, pageSize, itemLabel (plural de lo que se lista, ej.
// "recetas"), onPageChange(page) y scrollToTop (opcional, true por defecto: en false quien
// lo usa decide a dónde llevar la pantalla, ej. el perfil, cuyo listado no está arriba).
function SearchPagination({ page, totalPages, total, pageSize, itemLabel, onPageChange, scrollToTop = true }) {
  const firstShown = (page - 1) * pageSize + 1;
  const lastShown = Math.min(page * pageSize, total);

  // Al cambiar de página se vuelve arriba, si no el usuario queda mirando el final de la
  // página nueva.
  const handlePageChange = (nextPage) => {
    onPageChange(nextPage);
    if (scrollToTop) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="SearchPagination">
      <p className="SearchPagination-summary">
        Mostrando <strong>{firstShown}-{lastShown}</strong> de <strong>{total}</strong> {itemLabel}
      </p>

      {totalPages > 1 && (
        <nav className="SearchPagination-pages" aria-label="Paginación de resultados">
          <button
            type="button"
            className="SearchPagination-button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
          </button>

          {buildPageList(page, totalPages).map((item, index) =>
            item === '…' ? (
              <span key={`gap-${index}`} className="SearchPagination-gap" aria-hidden="true">…</span>
            ) : (
              <button
                key={item}
                type="button"
                className={`SearchPagination-button${item === page ? ' SearchPagination-button--active' : ''}`}
                onClick={() => handlePageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Página ${item}`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            className="SearchPagination-button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Página siguiente"
          >
            <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default SearchPagination;
