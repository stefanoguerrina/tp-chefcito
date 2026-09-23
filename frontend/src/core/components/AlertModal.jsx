// Modal genérico de aviso (core/components): un mensaje y un solo botón para cerrar.
// Reutiliza los estilos de ConfirmModal (misma tarjeta/overlay), pero para casos donde no
// hay nada que confirmar — por ejemplo, mostrar por qué falló una acción — en vez de dejar
// ese mensaje como un banner de texto que se queda pegado en la pantalla.
import './_confirm-modal.scss';

// Recibe: title, message, closeLabel (opcional), onClose.
function AlertModal({ title, message, closeLabel = 'Entendido', onClose }) {
  return (
    <div className="ConfirmModal-overlay" onClick={onClose}>
      <div
        className="ConfirmModal-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="ConfirmModal-title" id="alert-modal-title">
          {title}
        </h3>
        <p className="ConfirmModal-message">{message}</p>

        <div className="ConfirmModal-actions">
          <button type="button" className="ConfirmModal-button ConfirmModal-button--confirm" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
