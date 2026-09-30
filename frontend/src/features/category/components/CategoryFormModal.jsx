// Modal para crear o editar una categoría de receta. Mismo lenguaje visual que
// ingredientCategory/components/CategoryFormModal (overlay + tarjeta clara).
import { useState } from 'react';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import RequiredFieldsNote from '../../../core/components/RequiredFieldsNote.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldAriaProps, getFieldErrorId, mapApiFieldErrors } from '../../../shared/utils/fieldAria.js';
import '../styles/_category-form-modal.scss';

// Recibe: initialData (null para crear, { id, name, description } para editar),
// onSubmit (async, recibe { name, description }), onCancel.
function CategoryFormModal({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [error, setError] = useState('');
  // Error del campo "Nombre" (vacío, o el que devuelva el backend, ej. nombre repetido).
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = initialData !== null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    // El nombre es obligatorio: se avisa debajo del campo sin llamar al backend.
    if (!name.trim()) {
      setNameError('Ingresá un nombre.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined });
    } catch (err) {
      // Si el backend dijo que el problema es el nombre (ej. ya existe), va debajo del campo.
      const fieldErrors = mapApiFieldErrors(err.fieldErrors, { name: 'name' });
      if (fieldErrors.name) setNameError(fieldErrors.name);
      else setError(err.message);
      setIsSubmitting(false);
    }
    // No hace falta setIsSubmitting(false) en el caso de éxito: el padre cierra el modal.
  };

  return (
    <div className="CategoryFormModal-overlay" onClick={isSubmitting ? undefined : onCancel}>
      <div
        className="CategoryFormModal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-category-form-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="CategoryFormModal-title" id="recipe-category-form-modal-title">
          {isEditing ? <>Editar categoría <span className="EditingName">"{initialData.name}"</span></> : 'Nueva categoría'}
        </h3>

        <form onSubmit={handleSubmit} className="CategoryFormModal-form" noValidate>
          <RequiredFieldsNote isVisible={Boolean(nameError)} />

          <div className="CategoryFormModal-field">
            <label htmlFor="recipe-category-form-name">
              Nombre
              <RequiredMark />
            </label>
            <input
              id="recipe-category-form-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setNameError('');
              }}
              placeholder="Ej: Postres"
              {...getFieldAriaProps('recipe-category-form-name', { error: nameError, isRequired: true })}
            />
            <FieldError id={getFieldErrorId('recipe-category-form-name')} message={nameError} />
          </div>

          <div className="CategoryFormModal-field">
            <label htmlFor="recipe-category-form-description">Descripción</label>
            <input
              id="recipe-category-form-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Para qué recetas se usa esta categoría"
            />
          </div>

          {error && <p className="CategoryFormModal-error">⚠ {error}</p>}

          <div className="CategoryFormModal-actions">
            <button
              type="submit"
              className="CategoryFormModal-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear categoría'}
            </button>
            <button
              type="button"
              className="CategoryFormModal-cancel"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryFormModal;
