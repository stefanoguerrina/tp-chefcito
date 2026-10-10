// Middlewares de validación para las rutas de valor nutricional, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body, param } from 'express-validator';
import { commaDecimalToDot } from '../../../core/middleware/decimalSanitizer.js';

// Reglas de validación para crear un valor nutricional (POST /).
export const validateCreateNutritionalValue = [
  param('idIngredient')
    .isInt({ min: 1 })
    .withMessage('El ID de ingrediente debe ser un número entero positivo.'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido.')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
  body('servingAmount')
    .optional({ nullable: true })
    .customSanitizer(commaDecimalToDot)
    .isFloat({ min: 0 })
    .withMessage('La cantidad de porción debe ser un número positivo.'),
  body('servingUnit')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('La unidad de porción no puede superar los 20 caracteres.'),
  body('value')
    .optional({ nullable: true })
    .customSanitizer(commaDecimalToDot)
    .isFloat({ min: 0 })
    .withMessage('El valor debe ser un número positivo.'),
];

// Reglas de validación para actualizar un valor nutricional (PATCH /:num).
// Al menos uno de los campos editables debe estar presente.
export const validateUpdateNutritionalValue = [
  param('idIngredient')
    .isInt({ min: 1 })
    .withMessage('El ID de ingrediente debe ser un número entero positivo.'),
  param('num')
    .isInt({ min: 1 })
    .withMessage('El número de secuencia debe ser un número entero positivo.'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
  body('servingAmount')
    .optional({ nullable: true })
    .customSanitizer(commaDecimalToDot)
    .isFloat({ min: 0 })
    .withMessage('La cantidad de porción debe ser un número positivo.'),
  body('servingUnit')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('La unidad de porción no puede superar los 20 caracteres.'),
  body('value')
    .optional({ nullable: true })
    .customSanitizer(commaDecimalToDot)
    .isFloat({ min: 0 })
    .withMessage('El valor debe ser un número positivo.'),
  // Verificamos que al menos un campo editable esté presente en el body.
  body()
    .custom((_, { req }) => {
      const campos = ['name', 'servingAmount', 'servingUnit', 'value'];
      const hayAlguno = campos.some((c) => req.body[c] !== undefined);
      if (!hayAlguno) {
        throw new Error('Se debe enviar al menos un campo editable: name, servingAmount, servingUnit o value.');
      }
      return true;
    }),
];
