// Middlewares de validación para las rutas de review, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { RATING_MIN, RATING_MAX } from '../models/reviewModel.js';

// Reglas de validación para crear una review (POST /).
export const validateCreateReview = [
  body('rating')
    .notEmpty()
    .withMessage('El rating es requerido.')
    .isFloat({ min: RATING_MIN, max: RATING_MAX })
    .withMessage(`El rating debe ser un número entre ${RATING_MIN} y ${RATING_MAX}.`)
    .custom((value) => {
      // Solo se aceptan enteros o medias estrellas (múltiplos de 0.5).
      const num = parseFloat(value);
      if ((num * 2) % 1 !== 0) {
        throw new Error('El rating debe ser un entero o media estrella (ej: 1, 1.5, 2, 2.5...).');
      }
      return true;
    }),
  body('comment')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('El comentario no puede superar los 1000 caracteres.'),
];

// Reglas de validación para actualizar una review (PATCH /:idReview).
// Al menos uno de los dos campos editables debe estar presente.
export const validateUpdateReview = [
  body('rating')
    .optional()
    .isFloat({ min: RATING_MIN, max: RATING_MAX })
    .withMessage(`El rating debe ser un número entre ${RATING_MIN} y ${RATING_MAX}.`)
    .custom((value) => {
      const num = parseFloat(value);
      if ((num * 2) % 1 !== 0) {
        throw new Error('El rating debe ser un entero o media estrella (ej: 1, 1.5, 2, 2.5...).');
      }
      return true;
    }),
  body('comment')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('El comentario no puede superar los 1000 caracteres.'),
  body()
    .custom((_, { req }) => {
      const hayAlguno = req.body.rating !== undefined || req.body.comment !== undefined;
      if (!hayAlguno) {
        throw new Error('Se debe enviar al menos un campo editable (rating o comment).');
      }
      return true;
    }),
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
