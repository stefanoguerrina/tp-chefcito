// Modal de confirmación genérico (reemplaza a window.confirm en toda la app).
// Reutilizable por cualquier feature que necesite confirmar una acción destructiva
// (borrar un paso, borrar una receta, etc.) sin depender del diálogo nativo del navegador.
import { useOverlayClose } from '../hooks/useOverlayClose.js';
import './_confirm-modal.scss';

// Recibe: title, message, confirmLabel/cancelLabel (opcionales, con default),
// danger (si true, el botón de confirmar se pinta como acción destructiva),
// onConfirm, onCancel.
function ConfirmModal({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, onConfirm, onCancel }) {
  const overlayCloseProps = useOverlayClose(onCancel);

  return (
    <div className="ConfirmModal-overlay" {...overlayCloseProps}>
      <div
        className="ConfirmModal-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="ConfirmModal-title" id="confirm-modal-title">{title}</h3>
        <p className="ConfirmModal-message">{message}</p>

        <div className="ConfirmModal-actions">
          <button type="button" className="ConfirmModal-button ConfirmModal-button--cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`ConfirmModal-button ${danger ? 'ConfirmModal-button--danger' : 'ConfirmModal-button--confirm'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
