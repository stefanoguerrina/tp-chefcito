// Modal para crear o editar una categoría de ingrediente. Mismo lenguaje visual que
// RoleFormModal (overlay + tarjeta clara con los tokens del proyecto).
import { useState } from 'react';
import '../styles/_category-form-modal.scss';

// Recibe: initialData (null para crear, { id, name, description } para editar),
// onSubmit (async, recibe { name, description }), onCancel.
function CategoryFormModal({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = initialData !== null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined });
    } catch (err) {
      setError(err.message);
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
        aria-labelledby="category-form-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="CategoryFormModal-title" id="category-form-modal-title">
          {isEditing ? `Editar categoría "${initialData.name}"` : 'Nueva categoría'}
        </h3>

        <form onSubmit={handleSubmit} className="CategoryFormModal-form" noValidate>
          <div className="CategoryFormModal-field">
            <label htmlFor="category-form-name">Nombre</label>
            <input
              id="category-form-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Lácteos"
              required
            />
          </div>

          <div className="CategoryFormModal-field">
            <label htmlFor="category-form-description">Descripción (opcional)</label>
            <input
              id="category-form-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Para qué ingredientes se usa esta categoría"
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
