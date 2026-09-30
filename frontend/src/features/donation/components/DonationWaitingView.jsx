// Contenido del DonationModal una vez creado el pago: el link para pagar en Mercado Pago (en
// una pestaña nueva, así Chefcito queda abierto) y, mientras tanto, cada pocos segundos
// pregunta al backend si la donación ya se pagó. Cuando deja de estar pendiente lleva a la
// página de resultado. Así no depende del botón "Volver al sitio" (en local no aparece).
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDonation } from '../services/donationService.js';

// Cada cuánto se pregunta por el pago.
const POLL_INTERVAL_MS = 4000;

// Recibe: transactionRef y checkoutUrl de la donación creada, y onClose.
function DonationWaitingView({ transactionRef, checkoutUrl, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      getDonation(transactionRef)
        .then((donation) => {
          if (donation.status !== 'pending') navigate(`/donaciones/resultado?donacion=${transactionRef}`);
        })
        // Un fallo suelto (ej. se cortó la conexión un momento) no se muestra: se vuelve a
        // preguntar en el próximo intervalo.
        .catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [transactionRef, navigate]);

  return (
    <>
      <div className="DonationModal-waiting">
        <span className="material-symbols-outlined DonationModal-waitingIcon" aria-hidden="true">
          hourglass_top
        </span>
        <p className="DonationModal-status">
          Se abre en una pestaña nueva. Dejá esta abierta: cuando el pago se apruebe, se
          actualiza sola.
        </p>
      </div>

      <div className="ConfirmModal-actions">
        <button type="button" className="ConfirmModal-button ConfirmModal-button--cancel" onClick={onClose}>
          Cerrar
        </button>
        {/* Un link común (no window.open): como lo abre el clic del usuario, el navegador
            nunca lo bloquea. */}
        <a
          className="ConfirmModal-button ConfirmModal-button--confirm DonationModal-payLink"
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ir a pagar
        </a>
      </div>
    </>
  );
}

export default DonationWaitingView;
