// Reglas de validación de la feature donation, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con un mensaje claro.
import { body, param } from 'express-validator';

// POST /checkout: a quién se le dona y cuál de los montos fijos (el service valida que exista).
export const validateDonationCheckout = [
  body('idGrantee')
    .isInt({ min: 1 })
    .withMessage('El usuario a quien donar no es válido.'),
  body('tierId')
    .isString()
    .withMessage('Elegí un monto para donar.')
    .trim()
    .notEmpty()
    .withMessage('Elegí un monto para donar.'),
];

// GET /:transactionRef: la referencia de la donación (un UUID generado por el backend).
export const validateDonationRef = [
  param('transactionRef')
    .isUUID()
    .withMessage('La referencia de la donación no es válida.'),
];

// POST /confirm: el id de pago que Mercado Pago agrega a la URL de vuelta (solo dígitos).
export const validateDonationConfirm = [
  body('paymentId')
    .matches(/^\d{1,30}$/)
    .withMessage('El identificador de pago no es válido.'),
];
