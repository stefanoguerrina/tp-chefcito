// Pie de las tablas del panel admin: "Mostrando X de Y" y los botones de página anterior y
// siguiente. Lo comparten las tablas de usuarios, ingredientes y categorías.
import '../styles/_admin-table-pagination.scss';

// Recibe: summary (texto de la izquierda, ej. "Mostrando 6 de 20 usuarios"), page,
// totalPages, onChangePage (recibe el número de página nuevo) e isDisabled (opcional:
// deshabilita los dos botones, ej. mientras llega la página pedida).
function AdminTablePagination({ summary, page, totalPages, onChangePage, isDisabled = false }) {
  return (
    <footer className="AdminTablePagination">
      <span>{summary}</span>

      <div className="AdminTablePagination-controls">
        <button
          type="button"
          className="AdminTablePagination-pageButton"
          onClick={() => onChangePage(page - 1)}
          disabled={page === 1 || isDisabled}
          title="Página anterior"
          aria-label="Página anterior"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <span className="AdminTablePagination-pageIndicator">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          className="AdminTablePagination-pageButton"
          onClick={() => onChangePage(page + 1)}
          disabled={page === totalPages || isDisabled}
          title="Página siguiente"
          aria-label="Página siguiente"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </footer>
  );
}

export default AdminTablePagination;
