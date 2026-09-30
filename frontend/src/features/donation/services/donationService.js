// Servicio de donaciones: centraliza las llamadas HTTP de la feature donation (requieren token).
// El que dona es siempre el usuario logueado: el backend lo toma del token.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { donationTierFromApi, donationFromApi } from '../models/donationModel.js';

// Montos fijos para donar. Devuelve: lista de donationTierFromApi. Lanza ApiError si falla.
export const getDonationTiers = async () => {
  const raw = await apiFetch('/donations/tiers');
  return (raw ?? []).map(donationTierFromApi);
};

// Crea el pago en Mercado Pago.
// Recibe: granteeId (a quién se le dona) y tierId (el monto fijo elegido).
// Devuelve: { checkoutUrl, transactionRef }: la URL del checkout de Mercado Pago y la referencia
// de la donación, con la que después se pregunta si ya se pagó (getDonation).
export const createDonationCheckout = async (granteeId, tierId) => {
  const raw = await apiFetch('/donations/checkout', {
    method: 'POST',
    body: JSON.stringify({ idGrantee: granteeId, tierId }),
  });
  return { checkoutUrl: raw.checkoutUrl, transactionRef: raw.transactionRef };
};

// Estado actual de una donación propia. Si sigue pendiente, el backend busca antes el pago en
// Mercado Pago, así que sirve para esperar el pago. Devuelve: ver donationFromApi.
export const getDonation = async (transactionRef) => {
  const raw = await apiFetch(`/donations/${transactionRef}`);
  return donationFromApi(raw);
};

// Confirma el pago con el que el usuario volvió de Mercado Pago.
// Recibe: paymentId (viene en la URL de vuelta). Devuelve: la donación (ver donationFromApi).
export const confirmDonation = async (paymentId) => {
  const raw = await apiFetch('/donations/confirm', {
    method: 'POST',
    body: JSON.stringify({ paymentId }),
  });
  return donationFromApi(raw);
};
