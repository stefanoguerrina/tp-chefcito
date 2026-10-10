// Buscador sobre los ingredientes ya cargados en el inventario, con el botón "Limpiar".
// Los estilos están en _inventory-page.scss.

// Recibe: value (texto buscado) y onChange(texto nuevo).
function InventorySearchBar({ value, onChange }) {
  return (
    <div className="InventorySearch">
      <div className="InventorySearch-icon">
        <span className="material-symbols-outlined">search</span>
      </div>
      <input
        id="inventory-search-input"
        type="text"
        className="InventorySearch-input"
        placeholder="Buscar ingredientes en tu inventario (ej: tomate, pollo, leche)…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Buscar en el inventario"
      />
      {value && (
        <button type="button" className="InventorySearch-clear" onClick={() => onChange('')}>
          Limpiar
        </button>
      )}
    </div>
  );
}

export default InventorySearchBar;
