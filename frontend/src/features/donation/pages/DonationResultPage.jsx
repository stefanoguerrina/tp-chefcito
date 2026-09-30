// Página de resultado de una donación (ruta /donaciones/resultado). Se llega de dos formas:
//   - ?donacion=<ref>: desde DonationModal, cuando detectó que el pago dejó de estar pendiente;
//   - ?payment_id=<id>: volviendo desde Mercado Pago (botón "Volver al sitio" o, con https,
//     solo). Con ese id se le pide al backend que confirme el pago.
// En los dos casos el backend le consulta el estado real a Mercado Pago.
// El estado que viene en la URL no se usa para decidir nada, porque se puede editar a mano.
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmDonation, getDonation } from '../services/donationService.js';
import { formatDonationAmount } from '../models/donationModel.js';
import ErrorState from '../../../core/components/ErrorState.jsx';
import '../styles/_donation-result-page.scss';

// Texto e ícono de cada resultado posible.
const RESULT_CONTENT = {
  completed: { icon: 'celebration', title: '¡Gracias por tu donación!' },
  pending: { icon: 'hourglass_top', title: 'Tu pago está en proceso' },
  rejected: { icon: 'credit_card_off', title: 'El pago no se pudo completar' },
  expired: { icon: 'timer_off', title: 'Se venció el plazo para pagar' },
  // Sin payment_id: el usuario volvió sin pagar (cerró el checkout o tocó "Volver").
  cancelled: { icon: 'undo', title: 'No se completó la donación' },
};

// Recibe: la donación confirmada. Devuelve: el texto debajo del título según su estado.
const buildResultMessage = (donation) => {
  const amount = formatDonationAmount(donation.amount, donation.currency);
  const gift = donation.tierLabel ? `${donation.tierLabel.toLowerCase()} (${amount})` : amount;
  const grantee = `@${donation.grantee.username}`;
  if (donation.status === 'completed') return `Le invitaste ${gift} a ${grantee}. ¡Le va a encantar!`;
  if (donation.status === 'pending') {
    return `Mercado Pago todavía está procesando tu donación de ${amount} a ${grantee}. Te avisará por mail cuando se acredite.`;
  }
  if (donation.status === 'expired') {
    return `No recibimos el pago de tu donación de ${amount} a ${grantee} a tiempo, así que la cancelamos. No se te cobró nada.`;
  }
  return `Tu donación de ${amount} a ${grantee} fue rechazada por Mercado Pago. No se te cobró nada; podés intentar con otro medio de pago.`;
};

function DonationResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Mercado Pago manda el id como payment_id (y collection_id, versión vieja), o el texto
  // "null" si no hubo pago.
  const rawPaymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
  const paymentId = rawPaymentId && rawPaymentId !== 'null' ? rawPaymentId : null;
  const donationRef = searchParams.get('donacion');

  const [donation, setDonation] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(donationRef || paymentId));
  const [fetchError, setFetchError] = useState('');

  // El estado se actualiza solo dentro de los callbacks de la promesa (regla de lint
  // set-state-in-effect). Confirmar dos veces el mismo pago no tiene efecto extra en el
  // backend, así que no importa que StrictMode ejecute el efecto dos veces en desarrollo.
  const loadDonation = () =>
    (donationRef ? getDonation(donationRef) : confirmDonation(paymentId))
      .then((data) => {
        setDonation(data);
        setFetchError('');
      })
      .catch((error) => setFetchError(error.message))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    if (donationRef || paymentId) loadDonation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donationRef, paymentId]);

  const handleRetry = () => {
    setIsLoading(true);
    loadDonation();
  };

  if (isLoading) {
    return <p className="DonationResultPage-status">Confirmando tu donación...</p>;
  }

  if (fetchError) {
    return <ErrorState title="No pudimos confirmar tu donación" message={fetchError} onRetry={handleRetry} />;
  }

  const resultKey = donation ? donation.status : 'cancelled';
  const { icon, title } = RESULT_CONTENT[resultKey] ?? RESULT_CONTENT.pending;
  const message = donation
    ? buildResultMessage(donation)
    : 'No se realizó ningún cobro. Podés volver a intentarlo desde el perfil del creador.';

  return (
    <section className={`DonationResultPage DonationResultPage--${resultKey}`}>
      <span className="material-symbols-outlined DonationResultPage-icon" aria-hidden="true">
        {icon}
      </span>
      <h1 className="DonationResultPage-title">{title}</h1>
      <p className="DonationResultPage-message">{message}</p>

      <div className="DonationResultPage-actions">
        {donation?.grantee.id && (
          <button
            type="button"
            className="DonationResultPage-btn DonationResultPage-btn--primary"
            onClick={() => navigate(`/usuarios/${donation.grantee.id}`)}
          >
            Ver perfil de @{donation.grantee.username}
          </button>
        )}
        <button type="button" className="DonationResultPage-btn" onClick={() => navigate('/')}>
          Ir al inicio
        </button>
      </div>
    </section>
  );
}

export default DonationResultPage;
