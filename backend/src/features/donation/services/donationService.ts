// Lógica de negocio de la feature donation: donar a un creador uno de los montos fijos,
// pagando con Mercado Pago (Checkout Pro). Flujo:
//   1. createCheckout: guarda la donación como 'pending' y devuelve el link al checkout.
//   2. El usuario paga en Mercado Pago, en otra pestaña. Mientras tanto, Chefcito llama a
//      syncDonation cada pocos segundos, que busca el pago en Mercado Pago por la referencia.
//   3. Si vuelve con el botón de Mercado Pago (o solo, en el deploy con https), confirmPayment
//      consulta el pago por su payment_id. expireStaleDonations cierra las que nadie pagó.
// El estado nunca se toma de la URL de vuelta (se puede editar a mano): siempre se le
// pregunta a Mercado Pago. Retorna discriminated unions { ok, reason } para el controller.
import { randomUUID } from 'node:crypto';
import { donationRepository } from '../repository/donationRepository.js';
import { userRepository } from '../../user/repository/userRepository.js';
import { createCheckoutPreference, getPayment, searchPaymentsByReference, MercadoPagoHttpError } from './mercadoPagoService.js';
import { DONATION_CURRENCY, DONATION_TIERS, DONATION_PAYMENT_WINDOW_MINUTES } from '../models/donationModel.js';
import type { DonationStatus, DonationSummary, DonationTier } from '../models/donationModel.js';

// A dónde vuelve el usuario desde Mercado Pago. En el deploy, FRONTEND_URL es la URL pública.
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
const RETURN_PATH = '/donaciones/resultado';

// Recibe el estado de un pago de Mercado Pago. Devuelve el estado de la donación en Chefcito.
// Los que no son ni aprobados ni fallidos (pending, in_process, authorized...) siguen pendientes.
const toDonationStatus = (paymentStatus: string): DonationStatus => {
  if (paymentStatus === 'approved') return 'completed';
  if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(paymentStatus)) return 'rejected';
  return 'pending';
};

// Recibe los pagos de Mercado Pago de una misma donación (puede haber varios intentos, ej. uno
// rechazado y después uno aprobado). Devuelve el estado que corresponde: manda el aprobado,
// después uno en proceso, y si todos fallaron 'rejected'. null si todavía no hay ningún pago.
const statusFromPayments = (payments: { status: string }[]): DonationStatus | null => {
  const statuses = payments.map((payment) => toDonationStatus(payment.status));
  if (statuses.includes('completed')) return 'completed';
  if (statuses.includes('pending')) return 'pending';
  return statuses.length > 0 ? 'rejected' : null;
};

// Recibe una fila de donation (con el grantee incluido). Devuelve la forma pública de la API.
const toSummary = (donation: NonNullable<Awaited<ReturnType<typeof donationRepository.findByRef>>>): DonationSummary => {
  const amount = Number(donation.amount);
  return {
    transactionRef: donation.transactionRef,
    amount,
    currency: donation.currency ?? DONATION_CURRENCY,
    status: (donation.status ?? 'pending') as DonationStatus,
    tierLabel: DONATION_TIERS.find((tier) => tier.amount === amount)?.label ?? null,
    grantee: donation.user_donation_idGranteeTouser,
  };
};

// Devuelve los montos fijos disponibles, en orden de menor a mayor.
export function getTiers(): DonationTier[] {
  return DONATION_TIERS;
}

// idDonor quiere donarle a idGrantee el monto fijo tierId.
// Reglas de negocio:
//   - Solo se aceptan los montos fijos de DONATION_TIERS.
//   - Nadie puede donarse a sí mismo.
//   - Solo se le puede donar a un usuario activo (sin baja lógica).
// Devuelve la URL del checkout de Mercado Pago y la referencia de la donación (con la que el
// frontend pregunta si ya se pagó, ver syncDonation).
export async function createCheckout(
  idDonor: number,
  idGrantee: number,
  tierId: string
): Promise<
  | { ok: true; checkoutUrl: string; transactionRef: string }
  | { ok: false; reason: 'not_configured' | 'invalid_tier' | 'self_donation' | 'user_not_found' | 'payment_unavailable' }
> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return { ok: false, reason: 'not_configured' };

  const tier = DONATION_TIERS.find((option) => option.id === tierId);
  if (!tier) return { ok: false, reason: 'invalid_tier' };
  if (idDonor === idGrantee) return { ok: false, reason: 'self_donation' };

  const grantee = await userRepository.findById(idGrantee);
  if (!grantee) return { ok: false, reason: 'user_not_found' };

  const transactionRef = randomUUID();
  const frontendUrl = process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

  // Primero el checkout y después la fila: si Mercado Pago falla no queda una donación
  // pendiente que nunca se va a poder pagar.
  let checkoutUrl: string;
  try {
    checkoutUrl = await createCheckoutPreference(accessToken, {
      itemId: tier.id,
      title: `${tier.label} para @${grantee.username} (Chefcito)`,
      amount: tier.amount,
      currency: DONATION_CURRENCY,
      externalReference: transactionRef,
      returnUrl: `${frontendUrl}${RETURN_PATH}`,
      expiresAt: new Date(Date.now() + DONATION_PAYMENT_WINDOW_MINUTES * 60 * 1000),
    });
  } catch (error) {
    console.error('[donationService.createCheckout] Falló la creación del pago en Mercado Pago:', error);
    return { ok: false, reason: 'payment_unavailable' };
  }

  await donationRepository.create({
    idDonor,
    idGrantee,
    transactionRef,
    amount: tier.amount,
    currency: DONATION_CURRENCY,
    status: 'pending',
  });

  return { ok: true, checkoutUrl, transactionRef };
}

// idUser pregunta por su donación transactionRef (el frontend lo hace cada pocos segundos
// mientras el usuario paga en la otra pestaña). Si sigue pendiente, busca en Mercado Pago un
// pago aprobado con esa referencia y, si lo hay, la marca 'completed'. No la da por vencida ni
// rechazada: dentro del plazo el usuario todavía puede reintentar con otra tarjeta (eso lo
// decide expireStaleDonations). Solo el que donó puede consultarla.
export async function syncDonation(
  idUser: number,
  transactionRef: string
): Promise<{ ok: true; donation: DonationSummary } | { ok: false; reason: 'donation_not_found' }> {
  const donation = await donationRepository.findByRef(transactionRef);
  if (!donation || donation.idDonor !== idUser) return { ok: false, reason: 'donation_not_found' };

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (donation.status !== 'pending' || !accessToken) return { ok: true, donation: toSummary(donation) };

  try {
    const payments = await searchPaymentsByReference(accessToken, transactionRef);
    if (statusFromPayments(payments) === 'completed') {
      const updated = await donationRepository.updateStatus(donation.idDonor, donation.idGrantee, transactionRef, 'completed');
      return { ok: true, donation: toSummary(updated) };
    }
  } catch (error) {
    // Si Mercado Pago no responde, se devuelve como está: el frontend vuelve a preguntar enseguida.
    console.error('[donationService.syncDonation] Falló la búsqueda en Mercado Pago:', error);
  }
  return { ok: true, donation: toSummary(donation) };
}

// idUser volvió de Mercado Pago con paymentId. Consulta el pago y actualiza su donación.
// Solo el que donó puede confirmar su propia donación. Llamarlo dos veces con el mismo pago
// no tiene efecto extra (vuelve a guardar el mismo estado), así que se puede reintentar.
export async function confirmPayment(
  idUser: number,
  paymentId: string
): Promise<
  | { ok: true; donation: DonationSummary }
  | { ok: false; reason: 'not_configured' | 'payment_not_found' | 'donation_not_found' | 'payment_unavailable' }
> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return { ok: false, reason: 'not_configured' };

  let payment;
  try {
    payment = await getPayment(accessToken, paymentId);
  } catch (error) {
    if (error instanceof MercadoPagoHttpError && error.status === 404) return { ok: false, reason: 'payment_not_found' };
    console.error('[donationService.confirmPayment] Falló la consulta del pago a Mercado Pago:', error);
    return { ok: false, reason: 'payment_unavailable' };
  }

  const donation = payment.external_reference
    ? await donationRepository.findByRef(payment.external_reference)
    : null;
  // Si la donación es de otro usuario se responde igual que si no existiera, para no
  // revelar donaciones ajenas.
  if (!donation || donation.idDonor !== idUser) return { ok: false, reason: 'donation_not_found' };

  const updated = await donationRepository.updateStatus(
    donation.idDonor,
    donation.idGrantee,
    donation.transactionRef,
    toDonationStatus(payment.status)
  );
  return { ok: true, donation: toSummary(updated) };
}

// Revisa las donaciones pendientes cuyo link de pago ya venció y les pone su estado final.
// Hace falta porque en local Mercado Pago no devuelve al usuario a Chefcito, y aunque vuelva,
// puede cerrar el navegador antes: sin esto quedarían pendientes para siempre.
// Antes de darlas por vencidas se busca el pago en Mercado Pago, porque pueden estar pagadas
// sin que Chefcito se haya enterado. Devuelve cuántas donaciones cambiaron de estado.
export async function expireStaleDonations(): Promise<number> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return 0;

  const deadline = new Date(Date.now() - DONATION_PAYMENT_WINDOW_MINUTES * 60 * 1000);
  const staleDonations = await donationRepository.findPendingCreatedBefore(deadline);

  let updatedCount = 0;
  for (const donation of staleDonations) {
    let payments;
    try {
      payments = await searchPaymentsByReference(accessToken, donation.transactionRef);
    } catch (error) {
      // Si Mercado Pago no responde, se deja pendiente y se reintenta en la próxima revisión.
      console.error('[donationService.expireStaleDonations] Falló la búsqueda en Mercado Pago:', error);
      continue;
    }

    // Aprobado → completed; en proceso → se espera; sin pagos o todos rechazados → vence.
    const paymentsStatus = statusFromPayments(payments);
    const newStatus: DonationStatus =
      paymentsStatus === 'completed' || paymentsStatus === 'pending' ? paymentsStatus : 'expired';

    if (newStatus !== 'pending') {
      await donationRepository.updateStatus(donation.idDonor, donation.idGrantee, donation.transactionRef, newStatus);
      updatedCount++;
    }
  }
  return updatedCount;
}
