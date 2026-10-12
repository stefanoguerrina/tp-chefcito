// Estado vacío de un listado completo de búsqueda ("No encontramos recetas con estos
// filtros"), con un botón opcional para destrabarlo (ej. "Limpiar filtros").

// Recibe: message, actionLabel y onAction (opcionales: sin ellos no hay botón).
function ListingEmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="ListingEmptyState">
      <span className="material-symbols-outlined" aria-hidden="true">search_off</span>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button type="button" className="ListingEmptyState-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default ListingEmptyState;
