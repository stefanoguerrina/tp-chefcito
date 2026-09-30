// Modal para crear o editar un rol. Mismo lenguaje visual que ConfirmRoleModal (overlay +
// tarjeta clara), pero con un formulario en vez de un mensaje de confirmación.
import { useState } from 'react';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import RequiredFieldsNote from '../../../core/components/RequiredFieldsNote.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldAriaProps, getFieldErrorId, mapApiFieldErrors } from '../../../shared/utils/fieldAria.js';
import '../styles/_role-form-modal.scss';

// Recibe: initialData (null para crear, { id, name, description } para editar),
// onSubmit (async, recibe { name, description }), onCancel.
function RoleFormModal({ initialData, onSubmit, onCancel }) {
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
          <RequiredFieldsNote />

          <div className="RoleFormModal-field">
            <label htmlFor="role-form-name">
              Nombre
              <RequiredMark />
            </label>
            <input
              id="role-form-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setNameError('');
              }}
              placeholder="Ej: Moderador"
              {...getFieldAriaProps('role-form-name', { error: nameError, isRequired: true })}
            />
            <FieldError id={getFieldErrorId('role-form-name')} message={nameError} />
          </div>

          <div className="RoleFormModal-field">
            <label htmlFor="role-form-description">Descripción</label>
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
