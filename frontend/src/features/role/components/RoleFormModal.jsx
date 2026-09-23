// Modal para crear o editar un rol. Mismo lenguaje visual que ConfirmRoleModal (overlay +
// tarjeta clara), pero con un formulario en vez de un mensaje de confirmación.
import { useState } from 'react';
import '../styles/_role-form-modal.scss';

// Recibe: initialData (null para crear, { id, name, description } para editar),
// onSubmit (async, recibe { name, description }), onCancel.
function RoleFormModal({ initialData, onSubmit, onCancel }) {
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
    <div className="RoleFormModal-overlay" onClick={isSubmitting ? undefined : onCancel}>
      <div
        className="RoleFormModal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-form-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="RoleFormModal-title" id="role-form-modal-title">
          {isEditing ? `Editar rol "${initialData.name}"` : 'Nuevo rol'}
        </h3>

        <form onSubmit={handleSubmit} className="RoleFormModal-form" noValidate>
          <div className="RoleFormModal-field">
            <label htmlFor="role-form-name">Nombre</label>
            <input
              id="role-form-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Moderador"
              required
            />
          </div>

          <div className="RoleFormModal-field">
            <label htmlFor="role-form-description">Descripción (opcional)</label>
            <input
              id="role-form-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Para qué se usa este rol"
            />
          </div>

          {error && <p className="RoleFormModal-error">⚠ {error}</p>}

          <div className="RoleFormModal-actions">
            <button
              type="submit"
              className="RoleFormModal-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear rol'}
            </button>
            <button
              type="button"
              className="RoleFormModal-cancel"
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

export default RoleFormModal;
