// Modal para crear o editar un ingrediente (nombre, descripción, unidad y categorías).
// Al editar (no al crear: todavía no hay id de ingrediente), se suma una segunda columna
// con NutritionalValuePanel para gestionar los valores nutricionales sin salir de acá.
// Mismo lenguaje visual que RoleFormModal (features/role): overlay + tarjeta clara con
// los tokens de styles/abstracts/_variables.scss.
import { useState } from 'react';
import NutritionalValuePanel from '../pages/NutritionalValuePanel.jsx';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import RequiredFieldsNote from '../../../core/components/RequiredFieldsNote.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldAriaProps, getFieldErrorId, mapApiFieldErrors } from '../../../shared/utils/fieldAria.js';
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
  // Errores de los campos obligatorios ({ name, categoryIds }), debajo de cada uno.
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = initialData !== null;

  // Alterna la selección de una categoría en el multiselect.
  const handleToggleCategory = (id) => {
    setFieldErrors((prev) => ({ ...prev, categoryIds: '' }));
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((categoryId) => categoryId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    // Obligatorios: nombre y al menos una categoría (igual que valida el backend).
    const errors = {};
    if (!name.trim()) errors.name = 'Ingresá un nombre.';
    if (selectedCategoryIds.length === 0) errors.categoryIds = 'Seleccioná al menos una categoría.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
      // Si el backend señaló un campo (ej. nombre repetido), el error va debajo de ese campo.
      const apiErrors = mapApiFieldErrors(err.fieldErrors, { name: 'name', categoryIds: 'categoryIds' });
      if (Object.keys(apiErrors).length > 0) setFieldErrors(apiErrors);
      else setError(err.message);
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
            <RequiredFieldsNote />

            <div className="IngredientFormModal-field">
              <label htmlFor="ingf-name">
                Nombre
                <RequiredMark />
              </label>
              <input
                id="ingf-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setFieldErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="Ej: Tomate"
                {...getFieldAriaProps('ingf-name', { error: fieldErrors.name, isRequired: true })}
              />
              <FieldError id={getFieldErrorId('ingf-name')} message={fieldErrors.name} />
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
                <label htmlFor="ingf-description">Descripción</label>
                <input
                  id="ingf-description"
                  type="text"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Ej: Tomate perita"
                />
              </div>
            </div>

            <div className="IngredientFormModal-field">
              {/* Grupo de checkboxes: el "label" es un título del grupo (no apunta a un input). */}
              <label id="ingf-categories-label">
                Categorías (al menos una)
                <RequiredMark />
              </label>
              <div
                className={`IngredientFormModal-categoryList${fieldErrors.categoryIds ? ' IngredientFormModal-categoryList--invalid' : ''}`}
                role="group"
                aria-labelledby="ingf-categories-label"
                {...getFieldAriaProps('ingf-categories', { error: fieldErrors.categoryIds })}
              >
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
              <FieldError id={getFieldErrorId('ingf-categories')} message={fieldErrors.categoryIds} />
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
