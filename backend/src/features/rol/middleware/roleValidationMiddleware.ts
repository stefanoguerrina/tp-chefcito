// Middlewares de validación para las rutas de rol, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body, param } from 'express-validator';

// Reglas de validación para crear un rol (POST /).
export const validateCreateRole = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del rol es requerido.')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres.'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede superar los 255 caracteres.'),
];

// Reglas de validación para actualizar un rol (PATCH /:id).
// Al menos uno de los campos editables debe estar presente.
export const validateUpdateRole = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del rol debe ser un número entero positivo.'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres.'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede superar los 255 caracteres.'),
  // Verificamos que al menos un campo editable esté presente en el body.
  body()
    .custom((_, { req }) => {
      const campos = ['name', 'description'];
      const hayAlguno = campos.some((c) => req.body[c] !== undefined);
      if (!hayAlguno) {
        throw new Error('Se debe enviar al menos un campo editable: name o description.');
      }
      return true;
    }),
];

// Reglas de validación para endpoints que solo reciben el ID del rol por params
// (GET /:id, DELETE /:id, GET /:id/users).
export const validateRoleId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del rol debe ser un número entero positivo.'),
];

// Reglas de validación para el endpoint que devuelve los roles de un usuario (GET /users/:userId).
export const validateUserIdParam = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('El ID de usuario debe ser un número entero positivo.'),
];

// Reglas de validación para asignar un rol a un usuario (POST /:id/users).
export const validateAssignRole = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del rol debe ser un número entero positivo.'),
  body('userId')
    .isInt({ min: 1 })
    .withMessage('El ID de usuario debe ser un número entero positivo.'),
];

// Reglas de validación para quitarle un rol a un usuario (DELETE /:id/users/:userId).
export const validateUnassignRole = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del rol debe ser un número entero positivo.'),
  param('userId')
    .isInt({ min: 1 })
    .withMessage('El ID de usuario debe ser un número entero positivo.'),
];
