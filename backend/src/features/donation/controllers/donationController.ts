// Controller de donation — maneja las rutas de /api/donations.
// Delega toda la lógica al donationService; solo lee la request y arma la response HTTP.
// El que dona sale siempre del token (req.user.id), nunca del body.
import { Response } from 'express';
import * as donationService from '../services/donationService.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';

const NOT_CONFIGURED_MESSAGE = 'Las donaciones no están disponibles en este momento (falta configurar Mercado Pago).';
const PAYMENT_UNAVAILABLE_MESSAGE = 'No pudimos comunicarnos con Mercado Pago. Intentá de nuevo en unos minutos.';

// Montos fijos para donar.
// GET /api/donations/tiers
export const handleGetDonationTiers = (_req: AuthRequest, res: Response): void => {
  res.status(200).json(donationService.getTiers());
};

// Historial del usuario logueado: { received, sent }, cada uno con sus filas, su resumen
// (total, cantidad, promedio) y el top 5 de personas. Responde 200 aunque esté vacío.
// GET /api/donations
export const handleGetMyDonations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json(await donationService.getDonationHistory(req.user!.id));
  } catch (error) {
    console.error('[handleGetMyDonations] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Crea el pago en Mercado Pago y responde 201 con { checkoutUrl }.
// POST /api/donations/checkout — body { idGrantee, tierId }
export const handleCreateDonationCheckout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await donationService.createCheckout(req.user!.id, Number(req.body.idGrantee), req.body.tierId);
    if (!result.ok) {
      switch (result.reason) {
        case 'not_configured':
          res.status(503).json({ message: NOT_CONFIGURED_MESSAGE });
          return;
        case 'invalid_tier':
          res.status(400).json({ message: 'El monto elegido no es válido.' });
          return;
        case 'self_donation':
          res.status(400).json({ message: 'No podés donarte a vos mismo.' });
          return;
        case 'user_not_found':
          res.status(404).json({ message: 'Usuario no encontrado.' });
          return;
        default:
          res.status(502).json({ message: PAYMENT_UNAVAILABLE_MESSAGE });
          return;
      }
    }
    res.status(201).json({ checkoutUrl: result.checkoutUrl, transactionRef: result.transactionRef });
  } catch (error) {
    console.error('[handleCreateDonationCheckout] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Estado actual de una donación propia (si sigue pendiente, antes se busca el pago en Mercado Pago).
// GET /api/donations/:transactionRef
export const handleGetDonation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await donationService.syncDonation(req.user!.id, String(req.params.transactionRef));
    if (!result.ok) {
      res.status(404).json({ message: 'No encontramos esa donación.' });
      return;
    }
    res.status(200).json(result.donation);
  } catch (error) {
    console.error('[handleGetDonation] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Confirma el pago con el que el usuario volvió de Mercado Pago y responde con la donación.
// POST /api/donations/confirm — body { paymentId }
export const handleConfirmDonation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await donationService.confirmPayment(req.user!.id, String(req.body.paymentId));
    if (!result.ok) {
      switch (result.reason) {
        case 'not_configured':
          res.status(503).json({ message: NOT_CONFIGURED_MESSAGE });
          return;
        case 'payment_not_found':
        case 'donation_not_found':
          res.status(404).json({ message: 'No encontramos esa donación.' });
          return;
        default:
          res.status(502).json({ message: PAYMENT_UNAVAILABLE_MESSAGE });
          return;
      }
    }
    res.status(200).json(result.donation);
  } catch (error) {
    console.error('[handleConfirmDonation] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
