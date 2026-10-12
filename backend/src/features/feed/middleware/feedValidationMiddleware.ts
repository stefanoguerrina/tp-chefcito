// Reglas de validación del feed de la home, usando express-validator.
// Se ejecutan antes del controller para rechazar parámetros inválidos con mensajes claros.
import { query } from 'express-validator';
import { FEED_MAX_LIMIT, TOP_RECIPES_MAX_DAYS } from '../models/feedModel.js';

const limitRule = query('limit')
  .optional()
  .isInt({ min: 1, max: FEED_MAX_LIMIT })
  .withMessage(`La cantidad pedida debe estar entre 1 y ${FEED_MAX_LIMIT}.`);

// GET /api/feed/friends/recipes y /api/feed/friends/reviews
export const validateFriendsFeed = [limitRule];

// GET /api/feed/top-recipes
export const validateTopRecipes = [
  limitRule,
  query('days')
    .optional()
    .isInt({ min: 1, max: TOP_RECIPES_MAX_DAYS })
    .withMessage(`El plazo debe estar entre 1 y ${TOP_RECIPES_MAX_DAYS} días.`),
];
