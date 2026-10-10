// Middlewares de validación para las rutas de usuario, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body, param } from 'express-validator';
import {
  USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_PATTERN, USERNAME_FORMAT_MESSAGE,
  NAME_MIN_LENGTH, NAME_MAX_LENGTH, NAME_PATTERN,
  EMAIL_MAX_LENGTH, PHONE_MAX_LENGTH, PHONE_FORMAT_MESSAGE, isValidPhone,
  PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH,
  BIRTH_DATE_RANGE_MESSAGE, isValidBirthDate,
} from './userFieldRules.js';

// Reglas de validación para el endpoint de creación de usuario por admin (POST /).
export const validateCreateUser = [
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
  body('makeAdmin')
    .optional()
    .isBoolean().withMessage('makeAdmin debe ser true o false.'),
];

// Reglas de validación para el endpoint de actualización de datos del usuario (PATCH /:id).
// Al menos uno de los campos editables debe estar presente.
export const validateUpdateUser = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de usuario debe ser un número entero positivo.'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH })
    .withMessage(`El nombre debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.`).bail()
    .matches(NAME_PATTERN).withMessage('El nombre solo puede tener letras.'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH })
    .withMessage(`El apellido debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.`).bail()
    .matches(NAME_PATTERN).withMessage('El apellido solo puede tener letras.'),
  // checkFalsy: un teléfono vacío ("" o null) significa "borrarlo", no se valida.
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: PHONE_MAX_LENGTH }).withMessage(`El teléfono no puede superar los ${PHONE_MAX_LENGTH} caracteres.`).bail()
    .custom(isValidPhone).withMessage(PHONE_FORMAT_MESSAGE),
  body('avatarUrl')
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage('La URL del avatar debe ser una URL válida.'),
  body('bio')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La biografía no puede superar los 255 caracteres.'),
  body('specialty')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 60 })
    .withMessage('La especialidad no puede superar los 60 caracteres.'),
  body('location')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ubicación no puede superar los 100 caracteres.'),
  body('birthDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('La fecha de nacimiento debe tener formato YYYY-MM-DD.').bail()
    .custom(isValidBirthDate).withMessage(BIRTH_DATE_RANGE_MESSAGE)
    .toDate(),
  // Verificamos que al menos un campo editable esté presente en el body.
  body()
    .custom((_, { req }) => {
      const campos = ['name', 'lastName', 'phone', 'avatarUrl', 'bio', 'specialty', 'location', 'birthDate'];
      const hayAlguno = campos.some((c) => req.body[c] !== undefined);
      if (!hayAlguno) {
        throw new Error('Se debe enviar al menos un campo editable: name, lastName, phone, avatarUrl, bio, specialty, location o birthDate.');
      }
      return true;
    }),
];

// Reglas de validación para el endpoint de cambio de contraseña (PATCH /:id/password).
export const validateChangePassword = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de usuario debe ser un número entero positivo.'),
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida.'),
  body('newPassword')
    .isLength({ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH })
    .withMessage(`La nueva contraseña debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres.`)
    .custom((newPass, { req }) => {
      // No permitir que la nueva contraseña sea igual a la actual.
      if (newPass === req.body.currentPassword) {
        throw new Error('La nueva contraseña no puede ser igual a la actual.');
      }
      return true;
    }),
];
