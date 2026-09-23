// Modal para gestionar rápido las categorías de un ingrediente (sin abrir el formulario
// completo de edición). Mismo lenguaje visual que RoleFormModal/IngredientFormModal:
// overlay + tarjeta clara, chips togglables como en UserRolesPanel.
import { useState } from 'react';
import '../styles/_ingredient-categories-modal.scss';

// Recibe: ingredient (crudo, con ingredientcategoryingredient[]), categories (lista
// completa), onSubmit (async, recibe el array de categoryIds elegido), onCancel.
function IngredientCategoriesModal({ ingredient, categories, onSubmit, onCancel }) {
  const initialCategoryIds = (ingredient.ingredientcategoryingredient ?? []).map(
    (link) => link.idIngredientCategory
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(initialCategoryIds);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((categoryId) => categoryId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setError('');
    if (selectedCategoryIds.length === 0) {
      setError('Seleccioná al menos una categoría.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(selectedCategoryIds);
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
    // No hace falta setIsSubmitting(false) en el caso de éxito: el padre cierra el modal.
  };

  return (
    <div className="IngredientCategoriesModal-overlay" onClick={isSubmitting ? undefined : onCancel}>
      <div
        className="IngredientCategoriesModal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ingredient-categories-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="IngredientCategoriesModal-title" id="ingredient-categories-modal-title">
          Categorías de {ingredient.name}
        </h3>

        {categories.length === 0 ? (
          <p className="IngredientCategoriesModal-empty">
            No hay categorías creadas todavía. Creá una desde "Cat. de ingredientes".
          </p>
        ) : (
          <div className="IngredientCategoriesModal-chips">
            {categories.map((category) => {
              const isAssigned = selectedCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`IngredientCategoriesModal-chip${isAssigned ? ' IngredientCategoriesModal-chip--assigned' : ''}`}
                  onClick={() => handleToggle(category.id)}
                  disabled={isSubmitting}
                >
                  <span className="material-symbols-outlined">{isAssigned ? 'check' : 'add'}</span>
                  {category.name}
                </button>
              );
            })}
          </div>
        )}

        {error && <p className="IngredientCategoriesModal-error">⚠ {error}</p>}

        <div className="IngredientCategoriesModal-actions">
          <button
            type="button"
            className="IngredientCategoriesModal-confirm"
            onClick={handleSave}
            disabled={isSubmitting || categories.length === 0}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            className="IngredientCategoriesModal-cancel"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default IngredientCategoriesModal;
