// Middlewares de validación para las rutas de autenticación, usando express-validator.
// Solo definen reglas. La respuesta de error la maneja handleValidationErrors al final.
import { body } from 'express-validator';
import {
  USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_PATTERN, USERNAME_FORMAT_MESSAGE,
  NAME_MIN_LENGTH, NAME_MAX_LENGTH, NAME_PATTERN,
  EMAIL_MAX_LENGTH, PHONE_MAX_LENGTH, PHONE_FORMAT_MESSAGE, isValidPhone,
  PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH,
  BIRTH_DATE_RANGE_MESSAGE, isValidBirthDate,
} from '../../user/middleware/userFieldRules.js';

// Reglas para el registro (POST /auth/register).
// Cada .bail() corta las reglas de ese campo en el primer error, así se muestra un solo
// mensaje por campo (el más básico primero: vacío, después largo, después formato).
export const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es requerido.').bail()
    .isLength({ min: USERNAME_MIN_LENGTH, max: USERNAME_MAX_LENGTH })
    .withMessage(`El nombre de usuario debe tener entre ${USERNAME_MIN_LENGTH} y ${USERNAME_MAX_LENGTH} caracteres.`).bail()
    .matches(USERNAME_PATTERN).withMessage(USERNAME_FORMAT_MESSAGE),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida.').bail()
    .isLength({ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH })
    .withMessage(`La contraseña debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres.`),
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido.').bail()
    .isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH })
    .withMessage(`El nombre debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.`).bail()
    .matches(NAME_PATTERN).withMessage('El nombre solo puede tener letras.'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('El apellido es requerido.').bail()
    .isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH })
    .withMessage(`El apellido debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.`).bail()
    .matches(NAME_PATTERN).withMessage('El apellido solo puede tener letras.'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido.').bail()
    .isEmail().withMessage('El email no tiene un formato válido.').bail()
    .isLength({ max: EMAIL_MAX_LENGTH }).withMessage(`El email no puede superar los ${EMAIL_MAX_LENGTH} caracteres.`),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: PHONE_MAX_LENGTH }).withMessage(`El teléfono no puede superar los ${PHONE_MAX_LENGTH} caracteres.`).bail()
    .custom(isValidPhone).withMessage(PHONE_FORMAT_MESSAGE),
  body('birthDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('La fecha de nacimiento debe tener formato YYYY-MM-DD.').bail()
    .custom(isValidBirthDate).withMessage(BIRTH_DATE_RANGE_MESSAGE)
    .toDate(),
];

// Reglas para el login (POST /auth/login).
// Solo valida que la contraseña esté presente.
// La verificación de email/username se hace en el controller para mensajes más claros.
export const validateLogin = [
  body('password')
    .notEmpty().withMessage('La contraseña es requerida.'),
];
