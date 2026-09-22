// Página principal de Inventario — "Mi despensa".
// Ensambla: header con contador, panel de agregar (colapsable), barra de búsqueda,
// lista de cards, modales de edición y duplicado, toast de notificación, y banner de IA.
import { useState, useMemo } from 'react';
import useInventory from '../hooks/useInventory.js';
import AddIngredientForm from '../components/AddIngredientForm.jsx';
import InventoryList from '../components/InventoryList.jsx';
import EditIngredientModal from '../components/EditIngredientModal.jsx';
import DuplicateIngredientModal from '../components/DuplicateIngredientModal.jsx';
import '../styles/_inventory-page.scss';

function InventoryPage() {
  const {
    items,
    isLoading,
    error,
    allIngredients,
    ingredientsLoading,
    duplicateModal,
    handleAdd,
    handleUpdate,
    handleRemove,
    handleCloseDuplicateModal,
    reload,
  } = useInventory();

  // Panel de "Agregar ingrediente": se expande al pulsar el botón del header
  const [showAddPanel, setShowAddPanel] = useState(false);
  // Ítem actualmente abierto en el modal de edición completa
  const [editItem, setEditItem] = useState(null);
  // Texto de búsqueda sobre el inventario existente
  const [searchQuery, setSearchQuery] = useState('');
  // Toast: { msg, visible }
  const [toast, setToast] = useState({ msg: '', visible: false });

  // Muestra el toast por 2.5s
  const showToast = (msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast({ msg: '', visible: false }), 2500);
  };

  // Filtra los ítems del inventario según el texto buscado
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.ingredientName.toLowerCase().includes(q));
  }, [items, searchQuery]);

  // Wrapper de handleUpdate que además muestra el toast
  const handleUpdateWithToast = async (ingredientId, data) => {
    await handleUpdate(ingredientId, data);
    showToast('Inventario actualizado.');
    setEditItem(null);
  };

  // Wrapper de handleRemove con toast
  const handleRemoveWithToast = async (ingredientId) => {
    const item = items.find((it) => it.idIngredient === ingredientId);
    await handleRemove(ingredientId);
    showToast(`${item?.ingredientName ?? 'Ingrediente'} eliminado de la despensa.`);
  };

  // Wrapper de handleAdd con toast y control del panel
  const handleAddWithToast = async (ingredientId, quantity, unit) => {
    await handleAdd(ingredientId, quantity, unit);
    // Si no abrió el modal de duplicado, cierra el panel y muestra toast
    // (si abrió el modal, el toast lo mostramos al confirmar desde ese modal)
    showToast('Ingrediente agregado al inventario.');
    setShowAddPanel(false);
  };

  const handleEditOpen = (item) => setEditItem(item);
  const handleEditClose = () => setEditItem(null);

  return (
    <div className="InventoryPage">

      {/* ---- Header ---- */}
      <header className="InventoryPage-header">
        <div className="InventoryPage-titleGroup">
          <span className="InventoryPage-badge">
            <span className="material-symbols-outlined">kitchen</span>
            Inventario · Mi despensa
          </span>
          <h1 className="InventoryPage-title">Ingredientes disponibles</h1>
        </div>

        <div className="InventoryPage-headerActions">
          {/* Contador */}
          <div className="InventoryPage-counter">
            <div className="InventoryPage-counterIcon">
              <span className="material-symbols-outlined">grocery</span>
            </div>
            <div className="InventoryPage-counterText">
              <span className="InventoryPage-counterLabel">Total en despensa:</span>
              <span className="InventoryPage-counterValue">
                {isLoading ? '…' : items.length}{' '}
                <span>{items.length === 1 ? 'ingrediente' : 'ingredientes'}</span>
              </span>
            </div>
          </div>

          {/* Botón agregar */}
          <button
            type="button"
            className="InventoryPage-addBtn"
            onClick={() => setShowAddPanel((p) => !p)}
          >
            <span className="material-symbols-outlined">
              {showAddPanel ? 'close' : 'add'}
            </span>
            {showAddPanel ? 'Cancelar' : 'Agregar ingrediente'}
          </button>
        </div>
      </header>

      {/* ---- Alerta de error global ---- */}
      {error && (
        <div className="InventoryPage-alert InventoryPage-alert--error">⚠ {error}</div>
      )}

      {/* ---- Panel de agregar (colapsable) ---- */}
      {showAddPanel && (
        <div className="InventoryPage-addPanel">
          <AddIngredientForm
            allIngredients={allIngredients}
            ingredientsLoading={ingredientsLoading}
            onAdd={handleAddWithToast}
          />
        </div>
      )}

      {/* ---- Barra de búsqueda sobre el inventario ---- */}
      <div className="InventorySearch">
        <div className="InventorySearch-icon">
          <span className="material-symbols-outlined">search</span>
        </div>
        <input
          id="inventory-search-input"
          type="text"
          className="InventorySearch-input"
          placeholder="Buscar ingredientes en tu despensa (ej: tomate, pollo, leche)…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Buscar en el inventario"
        />
        {searchQuery && (
          <button
            type="button"
            className="InventorySearch-clear"
            onClick={() => setSearchQuery('')}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* ---- Contenido principal ---- */}
      {isLoading ? (
        <p className="InventoryPage-loading">Cargando tu inventario…</p>
      ) : (
        <>
          {/* Sin resultados de búsqueda */}
          {searchQuery && filteredItems.length === 0 && (
            <div className="InventoryEmpty">
              <div className="InventoryEmpty-icon">
                <span className="material-symbols-outlined">search_off</span>
              </div>
              <h3 className="InventoryEmpty-title">No encontramos ingredientes</h3>
              <p className="InventoryEmpty-text">
                Probá buscando con otro nombre o término.
              </p>
            </div>
          )}

          {/* Inventario vacío */}
          {!searchQuery && items.length === 0 && (
            <div className="InventoryEmpty">
              <div className="InventoryEmpty-icon">
                <span className="material-symbols-outlined">kitchen</span>
              </div>
              <h3 className="InventoryEmpty-title">Tu despensa está vacía</h3>
              <p className="InventoryEmpty-text">
                Usá el botón "Agregar ingrediente" para empezar a cargar lo que tenés.
              </p>
            </div>
          )}

          {/* Lista de cards */}
          {filteredItems.length > 0 && (
            <InventoryList
              items={filteredItems}
              onEdit={handleEditOpen}
              onRemove={handleRemoveWithToast}
            />
          )}
        </>
      )}

      {/* ---- Banner de sugerencias (placeholder hasta T-5.1 IA) ---- */}
      {!isLoading && items.length > 0 && (
        <div className="InventoryBanner">
          <div className="InventoryBanner-body">
            <div className="InventoryBanner-icon">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div className="InventoryBanner-text">
              <h4>¿Qué podés cocinar hoy con estos ingredientes?</h4>
              <p>
                Chefcito puede cruzar tu inventario con las recetas disponibles y sugerirte opciones.
              </p>
            </div>
          </div>
          <button type="button" className="InventoryBanner-btn" disabled>
            Ver recetas posibles
          </button>
        </div>
      )}

      {/* ---- Modal de edición completa ---- */}
      <EditIngredientModal
        item={editItem}
        onConfirm={handleUpdateWithToast}
        onClose={handleEditClose}
      />

      {/* ---- Modal de ingrediente duplicado (POST → 409) ---- */}
      <DuplicateIngredientModal
        modal={duplicateModal}
        onConfirm={async (id, data) => {
          await handleUpdateWithToast(id, data);
          handleCloseDuplicateModal();
        }}
        onClose={handleCloseDuplicateModal}
      />

      {/* ---- Toast de notificación ---- */}
      <div className={`InventoryToast${toast.visible ? ' InventoryToast--visible' : ''}`}>
        <span className="material-symbols-outlined">check_circle</span>
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}

export default InventoryPage;
