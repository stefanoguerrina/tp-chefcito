// Middleware compartido que corta la request con un 422 si alguna regla de express-validator
// falló. Las features nuevas (follow, feed) lo usan en vez de copiar su propia versión
// (ver 6.4 en docs/analisis-estado-proyecto.md): mismo formato de respuesta que el resto.
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Se usa en el router después de las reglas de validación y antes del controller.
// Responde 422 con { message, errors: [{ campo, mensaje }] } o sigue al próximo middleware.
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      message: 'Error de validación. Revisá los campos enviados.',
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? e.path : 'general', mensaje: e.msg })),
    });
    return;
  }
  next();
};
