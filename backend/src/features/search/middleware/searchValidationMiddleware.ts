// Middlewares de validación para la búsqueda, usando express-validator.
// Se ejecutan antes del controller para rechazar búsquedas inválidas con mensajes claros.
import { query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import {
  NAME_OR_RECIPES_SORTS,
  RECIPE_SORTS,
  SEARCH_TERM_MAX_LENGTH,
  SEARCH_TERM_MIN_LENGTH,
} from '../models/searchModel.js';

const TERM_LENGTH_MESSAGE = `La búsqueda debe tener entre ${SEARCH_TERM_MIN_LENGTH} y ${SEARCH_TERM_MAX_LENGTH} caracteres.`;

// Reglas de validación para GET /api/search?q=texto (el texto es obligatorio).
export const validateQuickSearch = [
  query('q')
    .isString()
    .withMessage('Indicá qué querés buscar.')
    // Sin ?q= no tiene sentido seguir validando el largo (saldrían dos mensajes juntos).
    .bail()
    .trim()
    .isLength({ min: SEARCH_TERM_MIN_LENGTH, max: SEARCH_TERM_MAX_LENGTH })
    .withMessage(TERM_LENGTH_MESSAGE),
];

// Reglas comunes a los tres listados: en ellos el texto es opcional (sin ?q= se listan
// todos) y se puede pedir una página.
const listingCommonRules = [
  query('q')
    .optional()
    .isString()
    .trim()
    .isLength({ min: SEARCH_TERM_MIN_LENGTH, max: SEARCH_TERM_MAX_LENGTH })
    .withMessage(TERM_LENGTH_MESSAGE),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero positivo.'),
];

// Reglas de validación para GET /api/search/recipes.
export const validateRecipeListing = [
  ...listingCommonRules,
  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La categoría indicada no es válida.'),
  query('authorId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El autor indicado no es válido.'),
  query(['maxTime', 'minTime'])
    .optional()
    .isInt({ min: 1 })
    .withMessage('El tiempo debe ser una cantidad de minutos positiva.'),
  query('minRating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('La valoración mínima debe estar entre 1 y 5.'),
  // Lista de ids separados por coma, ej. "3,8,12".
  query('ingredientIds')
    .optional()
    .matches(/^\d+(,\d+)*$/)
    .withMessage('Los ingredientes deben ser ids separados por coma.'),
  query('pantry')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('pantry debe ser true o false.'),
  query('savedOnly')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('savedOnly debe ser true o false.'),
  query('sort')
    .optional()
    .isIn(RECIPE_SORTS)
    .withMessage(`El orden debe ser uno de: ${RECIPE_SORTS.join(', ')}.`),
];

// Reglas de validación para GET /api/search/categories y GET /api/search/users.
export const validateNameOrRecipesListing = [
  ...listingCommonRules,
  query('onlyWithRecipes')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('onlyWithRecipes debe ser true o false.'),
  query('sort')
    .optional()
    .isIn(NAME_OR_RECIPES_SORTS)
    .withMessage(`El orden debe ser uno de: ${NAME_OR_RECIPES_SORTS.join(', ')}.`),
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
