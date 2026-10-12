// Middlewares de validación para las rutas de inventory, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body, param } from 'express-validator';
import { commaDecimalToDot } from '../../../core/middleware/decimalSanitizer.js';

// Reglas de validación para agregar un ingrediente al inventario (POST /).
export const validateAddInventory = [
  body('idIngredient')
    .notEmpty()
    .withMessage('El ID de ingrediente es requerido.')
    .isInt({ min: 1 })
    .withMessage('El ID de ingrediente debe ser un número entero positivo.'),
  body('availableQuantity')
    .notEmpty()
    .withMessage('La cantidad disponible es requerida.')
    .customSanitizer(commaDecimalToDot)
    .isFloat({ min: 0 })
    .withMessage('La cantidad disponible debe ser un número mayor o igual a 0.'),
  body('unitOfMeasure')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('La unidad de medida no puede superar los 20 caracteres.'),
];

// Reglas de validación para actualizar un ítem del inventario (PATCH /:ingredientId).
// Al menos uno de los campos editables debe estar presente.
export const validateUpdateInventory = [
  param('ingredientId')
    .isInt({ min: 1 })
    .withMessage('El ID de ingrediente debe ser un número entero positivo.'),
  body('availableQuantity')
    .optional()
    .customSanitizer(commaDecimalToDot)
    .isFloat({ min: 0 })
    .withMessage('La cantidad disponible debe ser un número mayor o igual a 0.'),
  body('unitOfMeasure')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('La unidad de medida no puede superar los 20 caracteres.'),
  // Verificamos que al menos un campo editable esté presente en el body
  body().custom((_, { req }) => {
    const campos = ['availableQuantity', 'unitOfMeasure'];
    const hayAlguno = campos.some((c) => req.body[c] !== undefined);
    if (!hayAlguno) {
      throw new Error('Se debe enviar al menos un campo editable (availableQuantity o unitOfMeasure).');
    }
    return true;
  }),
];
