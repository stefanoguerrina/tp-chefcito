// Middlewares de validación para las rutas de userRecipe, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Reglas de validación para guardar una receta (POST /).
export const validateCreateUserRecipe = [
  body('isSaved')
    .optional()
    .isBoolean()
    .withMessage('isSaved debe ser un valor booleano.'),
];

// Reglas de validación para actualizar el estado de guardado (PATCH /).
export const validateUpdateUserRecipe = [
  body('isSaved')
    .notEmpty()
    .withMessage('isSaved es requerido.')
    .isBoolean()
    .withMessage('isSaved debe ser un valor booleano.'),
];

// Middleware que lee los errores de express-validator y responde 422 si los hay.
// Se debe usar después de las reglas de validación en el router.
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Error de validación. Revisá los campos enviados.',
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? (e as any).path : 'general', mensaje: e.msg })),
    });
    return;
  }
  next();
};
