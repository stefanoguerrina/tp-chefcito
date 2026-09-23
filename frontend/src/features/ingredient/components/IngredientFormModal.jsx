// Modal para crear o editar un ingrediente (nombre, descripción, unidad y categorías).
// Al editar (no al crear: todavía no hay id de ingrediente), se suma una segunda columna
// con NutritionalValuePanel para gestionar los valores nutricionales sin salir de acá.
// Mismo lenguaje visual que RoleFormModal (features/role): overlay + tarjeta clara con
// los tokens de styles/abstracts/_variables.scss.
import { useState } from 'react';
import NutritionalValuePanel from '../pages/NutritionalValuePanel.jsx';
import '../styles/_ingredient-form-modal.scss';

// Recibe: initialData (null para crear, el ingrediente crudo para editar), categories
// (lista completa, para el selector), onSubmit (async, recibe el payload), onCancel.
function IngredientFormModal({ initialData, categories, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [unitOfMeasure, setUnitOfMeasure] = useState(initialData?.unitOfMeasure ?? '');

  // Extrae los IDs de categorías actuales del ingrediente (vienen en ingredientcategoryingredient[]).
  const initialCategoryIds = initialData
    ? (initialData.ingredientcategoryingredient ?? []).map((link) => link.idIngredientCategory)
    : [];
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(initialCategoryIds);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = initialData !== null;

  // Alterna la selección de una categoría en el multiselect.
  const handleToggleCategory = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((categoryId) => categoryId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (selectedCategoryIds.length === 0) {
      setError('Seleccioná al menos una categoría.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        unitOfMeasure: unitOfMeasure.trim() || undefined,
        categoryIds: selectedCategoryIds,
      });
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
    // No hace falta setIsSubmitting(false) en el caso de éxito: el padre cierra el modal.
  };

  return (
    <div className="IngredientFormModal-overlay" onClick={isSubmitting ? undefined : onCancel}>
      <div
        className={`IngredientFormModal-card${isEditing ? ' IngredientFormModal-card--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ingredient-form-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="IngredientFormModal-title" id="ingredient-form-modal-title">
          {isEditing ? `Editar ingrediente "${initialData.name}"` : 'Nuevo ingrediente'}
        </h3>

        {/* Al editar, el formulario y los valores nutricionales van en dos columnas
            (una al lado de la otra desde tablet) para no quedar con un modal larguísimo. */}
        <div className={isEditing ? 'IngredientFormModal-columns' : undefined}>
          <form onSubmit={handleSubmit} className="IngredientFormModal-form" noValidate>
            <div className="IngredientFormModal-field">
              <label htmlFor="ingf-name">Nombre</label>
              <input
                id="ingf-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej: Tomate"
                required
              />
            </div>

            <div className="IngredientFormModal-row">
              <div className="IngredientFormModal-field">
                <label htmlFor="ingf-unit">Unidad de medida</label>
                <input
                  id="ingf-unit"
                  type="text"
                  value={unitOfMeasure}
                  onChange={(event) => setUnitOfMeasure(event.target.value)}
                  placeholder="Ej: gramos, ml, unidad"
                />
              </div>

              <div className="IngredientFormModal-field">
                <label htmlFor="ingf-description">Descripción (opcional)</label>
                <input
                  id="ingf-description"
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="IngredientFormModal-field">
              <label>Categorías (seleccioná al menos una)</label>
              <div className="IngredientFormModal-categoryList">
                {categories.length === 0 && (
                  <p className="IngredientFormModal-categoryEmpty">
                    No hay categorías creadas todavía.
                  </p>
                )}
                {categories.map((category) => (
                  <label key={category.id} className="IngredientFormModal-categoryOption">
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={() => handleToggleCategory(category.id)}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="IngredientFormModal-error">⚠ {error}</p>}

            <div className="IngredientFormModal-actions">
              <button type="submit" className="IngredientFormModal-confirm" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear ingrediente'}
              </button>
              <button
                type="button"
                className="IngredientFormModal-cancel"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            </div>
          </form>

          {/* Solo al editar: recién ahí existe un id de ingrediente contra el cual
              guardar valores nutricionales. */}
          {isEditing && (
            <div className="IngredientFormModal-nutrition">
              <NutritionalValuePanel idIngredient={initialData.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IngredientFormModal;
