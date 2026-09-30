// Middlewares de validación para las rutas de recipeIngredient, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
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

// Middleware que lee los errores de express-validator y responde 422 si los hay.
// Se debe usar después de las reglas de validación en el router.
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Error de validación. Revisá los ingredientes enviados.',
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? (e as any).path : 'general', mensaje: e.msg })),
    });
    return;
  }
  next();
};
