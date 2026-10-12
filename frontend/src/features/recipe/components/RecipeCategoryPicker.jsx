// Categorías de la receta, sección propia del editor (mismo patrón que
// RecipeIngredientsStage): una receta puede pertenecer a varias (recipecategory es una
// tabla N a N). "Agregar" abre RecipeSearchModal (mismo modal con buscador que usa
// RecipeIngredientsStage) y las ya elegidas se ven como tarjetas, mismo look que
// RecipeIngredientCard pero sin acción de editar (acá no hay nada que completar, solo
// elegir y, si hace falta, sacar).
import { useState } from 'react';
import RecipeSearchModal from './RecipeSearchModal.jsx';
import '../styles/_recipe-category-picker.scss';

// Recibe: categories (catálogo completo, { id, name }), selectedIds (array de ids en
// string, ya elegidos) y onChange (recibe el array completo de ids ya modificado).
function RecipeCategoryPicker({ categories, selectedIds, onChange }) {
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedCategories = selectedIds
    .map((id) => categories.find((cat) => String(cat.id) === id))
    .filter(Boolean);

  const availableCategories = categories.filter((cat) => !selectedIds.includes(String(cat.id)));

  const handleSelect = (category) => {
    onChange([...selectedIds, String(category.id)]);
    setShowAddModal(false);
  };

  const handleRemove = (id) => onChange(selectedIds.filter((selected) => selected !== id));

  return (
    <section className="RecipeEditorCard RecipeCategoryPicker">
      <div className="RecipeEditorCard-header">
        <div className="RecipeCategoryPicker-titleGroup">
          <h2 className="RecipeEditorCard-title">Categorías</h2>
          {categories.length > 0 && (
            <span className="RecipeCategoryPicker-counter">
              {selectedCategories.length} {selectedCategories.length === 1 ? 'añadida' : 'añadidas'}
            </span>
          )}
        </div>
        {availableCategories.length > 0 && (
          <button type="button" className="RecipeCategoryPicker-addButton" onClick={() => setShowAddModal(true)}>
            <span className="material-symbols-outlined">add</span>
            Agregar
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <p className="RecipeEditorCard-empty">
          Todavía no hay categorías cargadas en el catálogo. Pedile a un administrador que cargue
          algunas para poder agregarlas a tu receta.
        </p>
      ) : selectedCategories.length === 0 ? (
        <p className="RecipeEditorCard-empty">Todavía no agregaste ninguna categoría.</p>
      ) : (
        <div className="RecipeCategoryPicker-grid">
          {selectedCategories.map((cat) => (
            <div key={cat.id} className="RecipeCategoryPicker-card">
              <div className="RecipeCategoryPicker-cardInfo">
                <span className="RecipeCategoryPicker-dot" />
                <span className="RecipeCategoryPicker-cardName">{cat.name}</span>
              </div>
              <button
                type="button"
                className="RecipeCategoryPicker-iconButton"
                title="Eliminar"
                aria-label={`Quitar ${cat.name}`}
                onClick={() => handleRemove(String(cat.id))}
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <RecipeSearchModal
          title="Agregar categoría"
          placeholder="Buscar categoría..."
          items={availableCategories}
          emptyMessage="No se encontraron categorías con ese nombre."
          allPickedMessage="Ya elegiste todas las categorías del catálogo."
          onSelect={handleSelect}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </section>
  );
}

export default RecipeCategoryPicker;
