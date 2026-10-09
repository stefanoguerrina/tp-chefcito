// Router de donation — define los endpoints de /api/donations (donaciones a creadores con
// Mercado Pago). Todo requiere estar autenticado: el que dona es el usuario del token.
import { Router } from 'express';
import { getMyDonations, getDonationTiers, createDonationCheckout, confirmDonation, getDonation } from '../controllers/donationController.js';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';
import { validateDonationCheckout, validateDonationConfirm, validateDonationRef } from '../middleware/donationValidationMiddleware.js';

const donationRouter = Router();

// GET /api/donations — historial del usuario logueado (recibidas y realizadas, con resumen y top 5)
donationRouter.get('/', verifyToken, getMyDonations);

// GET /api/donations/tiers — montos fijos para donar
donationRouter.get('/tiers', verifyToken, getDonationTiers);

// POST /api/donations/checkout — crea el pago en Mercado Pago y devuelve el link al checkout
donationRouter.post('/checkout', verifyToken, validateDonationCheckout, handleValidationErrors, createDonationCheckout);

// POST /api/donations/confirm — confirma el pago al volver de Mercado Pago
donationRouter.post('/confirm', verifyToken, validateDonationConfirm, handleValidationErrors, confirmDonation);

// GET /api/donations/:transactionRef — estado de una donación propia (se usa mientras se paga).
// Va después de /tiers para que "tiers" no se tome como una referencia.
donationRouter.get('/:transactionRef', verifyToken, validateDonationRef, handleValidationErrors, getDonation);

export { donationRouter };
