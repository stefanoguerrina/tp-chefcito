// Middlewares de validación para las rutas de autenticación, usando express-validator.
// Solo definen reglas. La respuesta de error la maneja handleValidationErrors al final.
import { body } from 'express-validator';

// Reglas para el registro (POST /auth/register).
export const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es requerido.')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres.'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido.'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('El apellido es requerido.'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido.')
    .isEmail().withMessage('El email no tiene un formato válido.'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 20 }).withMessage('El teléfono no puede superar los 20 caracteres.'),
  body('birthDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('La fecha de nacimiento debe tener formato YYYY-MM-DD.')
    .toDate(),
];

// Reglas para el login (POST /auth/login).
// Solo valida que la contraseña esté presente.
// La verificación de email/username se hace en el controller para mensajes más claros.
export const validateLogin = [
  body('password')
    .notEmpty().withMessage('La contraseña es requerida.'),
];
