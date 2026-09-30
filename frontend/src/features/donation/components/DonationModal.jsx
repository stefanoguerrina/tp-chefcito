// Modal para donarle a un creador: muestra los montos fijos "estilo Chefcito" (un cafecito,
// una pizza...), y al confirmar crea el pago y pasa a DonationWaitingView, que tiene el link
// para pagar en Mercado Pago (pestaña nueva) y espera el pago. El resultado se muestra en
// DonationResultPage.
import { useState, useEffect } from 'react';
import { getDonationTiers, createDonationCheckout } from '../services/donationService.js';
import { formatDonationAmount } from '../models/donationModel.js';
import DonationWaitingView from './DonationWaitingView.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import '../../../core/components/_confirm-modal.scss';
import '../styles/_donation-modal.scss';

// Recibe: grantee (el creador: { id, name, lastName, username }) y onClose.
function DonationModal({ grantee, onClose }) {
  const [tiers, setTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedTierId, setSelectedTierId] = useState(null);
  // Mientras se crea el pago en Mercado Pago, los botones quedan bloqueados.
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  // Donación creada, lista para pagar en Mercado Pago: { transactionRef, checkoutUrl }.
  const [pendingDonation, setPendingDonation] = useState(null);

  const granteeName = `${grantee.name ?? ''} ${grantee.lastName ?? ''}`.trim() || `@${grantee.username}`;
  const selectedTier = tiers.find((tier) => tier.id === selectedTierId);

  // El estado se actualiza solo dentro de los callbacks de la promesa (regla de lint
  // set-state-in-effect), así se puede llamar desde el useEffect.
  const loadTiers = () =>
    getDonationTiers()
      .then((data) => {
        setTiers(data);
        setLoadError('');
      })
      .catch((error) => setLoadError(error.message))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    loadTiers();
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    loadTiers();
  };

  // Crea el pago en Mercado Pago. No abre el checkout acá: una pestaña abierta por código
  // después de esperar al backend el navegador la bloquea como popup. Por eso el siguiente
  // paso (DonationWaitingView) muestra un link que el usuario toca.
  const handleDonate = () => {
    if (!selectedTier) return;
    setIsRedirecting(true);
    createDonationCheckout(grantee.id, selectedTier.id)
      .then(setPendingDonation)
      .catch((error) => setCheckoutError(error.message))
      .finally(() => setIsRedirecting(false));
  };

  // Mientras se crea el pago no se deja cerrar, para no dejarlo a medio crear sin aviso.
  const handleClose = () => {
    if (!isRedirecting) onClose();
  };

  const confirmLabel = isRedirecting
    ? 'Preparando el pago...'
    : selectedTier
      ? `Donar ${formatDonationAmount(selectedTier.amount)}`
      : 'Elegí un monto';

  // El AlertModal va afuera del overlay: si estuviera adentro, el clic en su fondo también
  // llegaría al overlay de la donación y cerraría los dos modales.
  return (
    <>
      <div className="ConfirmModal-overlay" onClick={handleClose}>
        <div
          className="ConfirmModal-card DonationModal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="donation-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <h3 className="ConfirmModal-title" id="donation-modal-title">
            {pendingDonation ? 'Pagá en Mercado Pago' : `Invitale algo a ${granteeName}`}
          </h3>

          {pendingDonation ? (
            <DonationWaitingView
              transactionRef={pendingDonation.transactionRef}
              checkoutUrl={pendingDonation.checkoutUrl}
              onClose={onClose}
            />
          ) : (
            <>
              <p className="ConfirmModal-message">
                Elegí qué querés invitarle. El pago se hace de forma segura con Mercado Pago.
              </p>

              {isLoading && <p className="DonationModal-status">Cargando opciones...</p>}

              {!isLoading && loadError && (
                <ErrorState title="No pudimos cargar los montos" message={loadError} onRetry={handleRetry} />
              )}

              {!isLoading && !loadError && (
                <div className="DonationModal-tiers" role="radiogroup" aria-label="Monto a donar">
                  {tiers.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      role="radio"
                      aria-checked={tier.id === selectedTierId}
                      className={`DonationModal-tier${tier.id === selectedTierId ? ' DonationModal-tier--selected' : ''}`}
                      onClick={() => setSelectedTierId(tier.id)}
                      disabled={isRedirecting}
                    >
                      <span className="material-symbols-outlined DonationModal-tierIcon" aria-hidden="true">
                        {tier.icon}
                      </span>
                      <span className="DonationModal-tierLabel">{tier.label}</span>
                      <span className="DonationModal-tierAmount">{formatDonationAmount(tier.amount)}</span>
                      <span className="DonationModal-tierDescription">{tier.description}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="ConfirmModal-actions">
                <button
                  type="button"
                  className="ConfirmModal-button ConfirmModal-button--cancel"
                  onClick={handleClose}
                  disabled={isRedirecting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="ConfirmModal-button ConfirmModal-button--confirm"
                  onClick={handleDonate}
                  disabled={!selectedTier || isRedirecting}
                >
                  {confirmLabel}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {checkoutError && (
        <AlertModal
          title="No pudimos iniciar la donación"
          message={checkoutError}
          onClose={() => setCheckoutError('')}
        />
      )}
    </>
  );
}

export default DonationModal;
