// Reglas de validación de la feature follow, usando express-validator.
// Se ejecutan antes del controller para rechazar ids inválidos con un mensaje claro.
import { param } from 'express-validator';

// El :userId de la URL (el perfil a seguir) tiene que ser un entero positivo.
export const validateFollowTarget = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('El ID de usuario no es válido.'),
];
