// Middlewares de validación para las rutas de recipeIngredient, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body } from 'express-validator';
import { commaDecimalToDot } from '../../../core/middleware/decimalSanitizer.js';

// Reglas de validación para reemplazar los ingredientes de una receta (PUT /).
export const validateReplaceRecipeIngredients = [
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('ingredients es requerido y debe ser un array con al menos un ingrediente.'),
  body('ingredients.*.idIngredient')
    .isInt({ min: 1 })
    .withMessage('Cada ingrediente necesita un idIngredient entero positivo.'),
  body('ingredients.*.requiredQuantity')
    .optional({ nullable: true })
    .customSanitizer(commaDecimalToDot)
    .isFloat({ min: 0.01 })
    .withMessage('La cantidad requerida debe ser un número positivo.'),
];
