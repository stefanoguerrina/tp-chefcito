// Middlewares de validación para las rutas de inventory, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

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
