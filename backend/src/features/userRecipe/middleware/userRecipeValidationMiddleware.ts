// Middlewares de validación para las rutas de userRecipe, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body } from 'express-validator';

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
