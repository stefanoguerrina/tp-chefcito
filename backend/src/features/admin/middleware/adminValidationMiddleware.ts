// Validación de los filtros del listado de usuarios del panel (GET /api/admin/users),
// usando express-validator. Todos son opcionales: sin filtros se lista la página 1 de todos.
import { query } from 'express-validator';
import { ADMIN_USER_STATUSES, ADMIN_USERS_QUERY_MAX_LENGTH } from '../models/adminModel.js';

export const validateListUsers = [
  query('status')
    .optional()
    .isIn([...ADMIN_USER_STATUSES])
    .withMessage('El estado debe ser all, active o inactive.'),
  query('q')
    .optional()
    .isString()
    .trim()
    .isLength({ max: ADMIN_USERS_QUERY_MAX_LENGTH })
    .withMessage(`La búsqueda no puede superar los ${ADMIN_USERS_QUERY_MAX_LENGTH} caracteres.`),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo.'),
];
