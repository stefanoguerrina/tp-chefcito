// Campo "Categorías" del formulario de ingrediente. En vez de mostrar todas las categorías
// como checkboxes (con muchas, el modal quedaría gigante), muestra solo las elegidas como
// chips, y el "+" al lado del título abre el mismo modal con buscador y lista deslizable
// que usa el editor de recetas para elegir categorías (RecipeSearchModal).
import { useState } from 'react';
import RecipeSearchModal from '../../recipe/components/RecipeSearchModal.jsx';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldAriaProps, getFieldErrorId } from '../../../shared/utils/fieldAria.js';

const FIELD_ID = 'ingf-categories';

// Recibe: categories (catálogo completo, { id, name }), selectedIds (ids elegidos),
// onChange (recibe el array de ids ya modificado) y error (mensaje o vacío).
function IngredientCategoryPicker({ categories, selectedIds, onChange, error }) {
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedCategories = categories.filter((category) => selectedIds.includes(category.id));
  const availableCategories = categories.filter((category) => !selectedIds.includes(category.id));

  const handleSelect = (category) => {
    onChange([...selectedIds, category.id]);
    setShowAddModal(false);
  };

  const handleRemove = (id) => onChange(selectedIds.filter((selectedId) => selectedId !== id));

  return (
    <div className="IngredientFormModal-field">
      <div className="IngredientFormModal-fieldHeader">
        {/* Título del grupo: no apunta a un input puntual. */}
        <span className="IngredientFormModal-label" id={`${FIELD_ID}-label`}>
          Categorías
          <RequiredMark />
        </span>
        <button
          type="button"
          className="IngredientFormModal-addButton"
          onClick={() => setShowAddModal(true)}
          disabled={availableCategories.length === 0}
          aria-label="Agregar categoría"
          title="Agregar categoría"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <div
        className={`IngredientFormModal-categories${error ? ' IngredientFormModal-categories--invalid' : ''}`}
        role="group"
        aria-labelledby={`${FIELD_ID}-label`}
        {...getFieldAriaProps(FIELD_ID, { error })}
      >
        {selectedCategories.length === 0 && (
          <p className="IngredientFormModal-empty">
            {categories.length === 0
              ? 'No hay categorías creadas todavía. Creá una desde "Cat. de Ingredientes".'
              : 'Todavía no agregaste ninguna categoría.'}
          </p>
        )}

        {selectedCategories.map((category) => (
          <span key={category.id} className="IngredientFormModal-chip">
            {category.name}
            <button
              type="button"
              className="IngredientFormModal-chipRemove"
              onClick={() => handleRemove(category.id)}
              aria-label={`Quitar ${category.name}`}
              title="Quitar"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </span>
        ))}
      </div>
      <FieldError id={getFieldErrorId(FIELD_ID)} message={error} />

      {showAddModal && (
        <RecipeSearchModal
          title="Agregar categoría"
          placeholder="Buscar categoría..."
          items={availableCategories}
          emptyMessage="No se encontraron categorías con ese nombre."
          allPickedMessage="Ya elegiste todas las categorías."
          onSelect={handleSelect}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

export default IngredientCategoryPicker;
