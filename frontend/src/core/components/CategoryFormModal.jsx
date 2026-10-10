// Modal para crear o editar una categoría (nombre + descripción). Lo comparten las
// categorías de receta y las de ingrediente del panel admin: solo cambian los textos de
// ejemplo, que llegan por props.
import { useState } from 'react';
import RequiredMark from './RequiredMark.jsx';
import RequiredFieldsNote from './RequiredFieldsNote.jsx';
import FieldError from './FieldError.jsx';
import { useOverlayClose } from '../hooks/useOverlayClose.js';
import { getFieldAriaProps, getFieldErrorId, mapApiFieldErrors } from '../../shared/utils/fieldAria.js';
import './_category-form-modal.scss';

// Recibe: initialData (null para crear, { id, name, description } para editar),
// idPrefix (prefijo de los id de los campos, distinto en cada uso para no repetir ids),
// namePlaceholder y descriptionPlaceholder (textos de ejemplo),
// onSubmit (async, recibe { name, description }), onCancel.
function CategoryFormModal({ initialData, idPrefix, namePlaceholder, descriptionPlaceholder, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [error, setError] = useState('');
  // Error del campo "Nombre" (vacío, o el que devuelva el backend, ej. nombre repetido).
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const overlayCloseProps = useOverlayClose(isSubmitting ? undefined : onCancel);

  const isEditing = initialData !== null;
  const titleId = `${idPrefix}-title`;
  const nameId = `${idPrefix}-name`;
  const descriptionId = `${idPrefix}-description`;

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
    <div className="CategoryFormModal-overlay" {...overlayCloseProps}>
      <div
        className="CategoryFormModal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="CategoryFormModal-title" id={titleId}>
          {isEditing ? <>Editar categoría <span className="EditingName">"{initialData.name}"</span></> : 'Nueva categoría'}
        </h3>

        <form onSubmit={handleSubmit} className="CategoryFormModal-form" noValidate>
          <RequiredFieldsNote isVisible={Boolean(nameError)} />

          <div className="CategoryFormModal-field">
            <label htmlFor={nameId}>
              Nombre
              <RequiredMark />
            </label>
            <input
              id={nameId}
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setNameError('');
              }}
              placeholder={namePlaceholder}
              {...getFieldAriaProps(nameId, { error: nameError, isRequired: true })}
            />
            <FieldError id={getFieldErrorId(nameId)} message={nameError} />
          </div>

          <div className="CategoryFormModal-field">
            <label htmlFor={descriptionId}>Descripción</label>
            <input
              id={descriptionId}
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={descriptionPlaceholder}
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
