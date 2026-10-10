// Cabecera de "Mi inventario": título, contador de ingredientes cargados y el botón que
// abre o cierra el panel de agregar. Los estilos están en _inventory-page.scss.

// Recibe: count (ingredientes en el inventario), isLoading (muestra "…" en el contador),
// isAddPanelOpen y onToggleAddPanel.
function InventoryHeader({ count, isLoading, isAddPanelOpen, onToggleAddPanel }) {
  return (
    <header className="InventoryPage-header">
      <div className="InventoryPage-titleGroup">
        <h1 className="InventoryPage-title">Ingredientes disponibles</h1>
      </div>

      <div className="InventoryPage-headerActions">
        <div className="InventoryPage-counter">
          <div className="InventoryPage-counterIcon">
            <span className="material-symbols-outlined">grocery</span>
          </div>
          <div className="InventoryPage-counterText">
            <span className="InventoryPage-counterLabel">Total en inventario:</span>
            <span className="InventoryPage-counterValue">
              {isLoading ? '…' : count}{' '}
              <span>{count === 1 ? 'ingrediente' : 'ingredientes'}</span>
            </span>
          </div>
        </div>

        <button type="button" className="InventoryPage-addBtn" onClick={onToggleAddPanel}>
          <span className="material-symbols-outlined">{isAddPanelOpen ? 'close' : 'add'}</span>
          {isAddPanelOpen ? 'Cancelar' : 'Agregar ingrediente'}
        </button>
      </div>
    </header>
  );
}

export default InventoryHeader;
