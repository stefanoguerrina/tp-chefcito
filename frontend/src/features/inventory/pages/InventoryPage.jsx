// Página principal de Inventario — "Mi inventario".
// Ensambla: header con contador, panel de agregar (colapsable), barra de búsqueda,
// lista de cards, modales de edición y duplicado, toast de notificación y el acceso a las
// recetas que se pueden hacer con lo cargado.
import { useState, useMemo, useRef, useEffect } from 'react';
import useInventory from '../hooks/useInventory.js';
import InventoryHeader from '../components/InventoryHeader.jsx';
import InventorySearchBar from '../components/InventorySearchBar.jsx';
import InventorySuggestionBanner from '../components/InventorySuggestionBanner.jsx';
import AddIngredientForm from '../components/AddIngredientForm.jsx';
import InventoryList from '../components/InventoryList.jsx';
import EditIngredientModal from '../components/EditIngredientModal.jsx';
import DuplicateIngredientModal from '../components/DuplicateIngredientModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import EmptyState from '../../../core/components/EmptyState.jsx';
import '../styles/_inventory-page.scss';

const TOAST_DURATION_MS = 2500;

function InventoryPage() {
  const {
    items,
    isLoading,
    loadError,
    actionError,
    allIngredients,
    ingredientsLoading,
    duplicateModal,
    handleAdd,
    handleUpdate,
    handleRemove,
    handleCloseDuplicateModal,
    handleCloseActionError,
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
  const toastTimerRef = useRef(null);

  // Al salir de la página se cancela el timer pendiente del toast.
  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // Muestra el toast por unos segundos. Si ya había uno, reinicia la cuenta: si no, el
  // timer del anterior ocultaría el nuevo antes de tiempo.
  const showToast = (msg) => {
    clearTimeout(toastTimerRef.current);
    setToast({ msg, visible: true });
    toastTimerRef.current = setTimeout(() => setToast({ msg: '', visible: false }), TOAST_DURATION_MS);
  };

  // Filtra los ítems del inventario según el texto buscado
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.ingredientName.toLowerCase().includes(q));
  }, [items, searchQuery]);

  // Wrappers de las acciones del hook: el toast de éxito solo se muestra si la acción
  // salió bien (si falló, el hook ya dejó el error para mostrarlo en el modal de aviso).
  const handleUpdateWithToast = async (ingredientId, data) => {
    const ok = await handleUpdate(ingredientId, data);
    setEditItem(null);
    if (ok) showToast('Inventario actualizado.');
    return ok;
  };

  const handleRemoveWithToast = async (ingredientId) => {
    const item = items.find((it) => it.idIngredient === ingredientId);
    const ok = await handleRemove(ingredientId);
    if (ok) showToast(`${item?.ingredientName ?? 'Ingrediente'} eliminado del inventario.`);
  };

  // Si el ingrediente ya estaba, el hook abre el modal de duplicado y el toast se
  // muestra recién al confirmar desde ese modal.
  const handleAddWithToast = async (ingredientId, quantity, unit) => {
    const ok = await handleAdd(ingredientId, quantity, unit);
    if (ok) {
      showToast('Ingrediente agregado al inventario.');
      setShowAddPanel(false);
    }
  };

  return (
    <div className="InventoryPage">
      <InventoryHeader
        count={items.length}
        isLoading={isLoading}
        isAddPanelOpen={showAddPanel}
        onToggleAddPanel={() => setShowAddPanel((p) => !p)}
      />

      {/* ---- Aviso cuando falla una acción (agregar, editar, quitar) ---- */}
      {actionError && (
        <AlertModal
          title="No se pudo actualizar tu inventario"
          message={actionError}
          onClose={handleCloseActionError}
        />
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

      <InventorySearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* ---- Contenido principal ---- */}
      {isLoading ? (
        <LoadingState message="Cargando tu inventario..." />
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={reload} />
      ) : (
        <>
          {/* Sin resultados de búsqueda */}
          {searchQuery && filteredItems.length === 0 && (
            <EmptyState
              icon="search_off"
              title="No encontramos ingredientes"
              message="Probá buscando con otro nombre o término."
            />
          )}

          {/* Inventario vacío */}
          {!searchQuery && items.length === 0 && (
            <EmptyState
              icon="kitchen"
              title="Tu inventario está vacío"
              message={'Usá el botón "Agregar ingrediente" para empezar a cargar lo que tenés.'}
            />
          )}

          {/* Lista de cards */}
          {filteredItems.length > 0 && (
            <InventoryList
              items={filteredItems}
              onEdit={setEditItem}
              onRemove={handleRemoveWithToast}
            />
          )}
        </>
      )}

      {/* ---- Acceso a las recetas que se pueden hacer con lo cargado ---- */}
      {!isLoading && !loadError && items.length > 0 && <InventorySuggestionBanner />}

      {/* ---- Modal de edición completa ---- */}
      {editItem && (
        <EditIngredientModal
          key={editItem.idIngredient}
          item={editItem}
          onConfirm={handleUpdateWithToast}
          onClose={() => setEditItem(null)}
        />
      )}

      {/* ---- Modal de ingrediente duplicado (POST → 409) ---- */}
      {duplicateModal && (
        <DuplicateIngredientModal
          modal={duplicateModal}
          onConfirm={async (id, data) => {
            await handleUpdateWithToast(id, data);
            handleCloseDuplicateModal();
            setShowAddPanel(false);
          }}
          onClose={handleCloseDuplicateModal}
        />
      )}

      {/* ---- Toast de notificación ---- */}
      <div className={`InventoryToast${toast.visible ? ' InventoryToast--visible' : ''}`} role="status">
        <span className="material-symbols-outlined">check_circle</span>
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}

export default InventoryPage;
