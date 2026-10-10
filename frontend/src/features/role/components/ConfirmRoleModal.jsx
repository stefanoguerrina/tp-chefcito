// Modal de confirmación para asignar o quitar un rol a un usuario.
// Se muestra antes de tocar la tabla intermedia userrole, para que el admin confirme
// la acción exacta que va a realizar (evita asignaciones o remociones accidentales).
import { useState } from 'react';
import { useOverlayClose } from '../../../core/hooks/useOverlayClose.js';
import '../styles/_confirm-role-modal.scss';

// Recibe: role ({ id, name }), action ('assign' | 'remove'), username (para el mensaje),
// onConfirm (async, ejecuta la asignación/remoción real), onCancel.
function ConfirmRoleModal({ role, action, username, onConfirm, onCancel }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const overlayCloseProps = useOverlayClose(isSubmitting ? undefined : onCancel);

  const isRemove = action === 'remove';

  const handleConfirm = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
    // No hace falta setIsSubmitting(false) en el caso de éxito: el padre cierra el modal.
  };

  return (
    <div className="RoleConfirmModal-overlay" {...overlayCloseProps}>
      <div
        className="RoleConfirmModal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-role-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`RoleConfirmModal-icon${isRemove ? ' RoleConfirmModal-icon--remove' : ''}`}>
          <span className="material-symbols-outlined">
            {isRemove ? 'person_remove' : 'person_add'}
          </span>
        </div>

        <h3 className="RoleConfirmModal-title" id="confirm-role-modal-title">
          {isRemove ? 'Quitar rol' : 'Asignar rol'}
        </h3>

        <p className="RoleConfirmModal-message">
          {isRemove ? (
            <>Se le va a quitar el rol <strong>{role.name}</strong> a <strong>@{username}</strong>.</>
          ) : (
            <>Se le va a asignar el rol <strong>{role.name}</strong> a <strong>@{username}</strong>.</>
          )}
        </p>

        {error && <p className="RoleConfirmModal-error">⚠ {error}</p>}

        <div className="RoleConfirmModal-actions">
          <button
            type="button"
            className={`RoleConfirmModal-confirm${isRemove ? ' RoleConfirmModal-confirm--remove' : ''}`}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Confirmando...' : isRemove ? 'Quitar rol' : 'Confirmar asignación'}
          </button>
          <button
            type="button"
            className="RoleConfirmModal-cancel"
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

export default ConfirmRoleModal;
