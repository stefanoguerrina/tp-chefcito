// Middlewares de validación para las rutas de receta, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body } from 'express-validator';
import { RECIPE_DIFFICULTIES, RECIPE_SERVINGS_MAX, RECIPE_SERVINGS_MIN } from '../models/recipeModel.js';

// Reglas de validación para crear una receta (POST /).
export const validateCreateRecipe = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido.')
    .isLength({ min: 2, max: 150 })
    .withMessage('El nombre debe tener entre 2 y 150 caracteres.'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede superar los 2000 caracteres.'),
  body('preparationTime')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El tiempo de preparación debe ser un número entero positivo (en minutos).'),
  body('servings')
    .optional({ nullable: true })
    .isInt({ min: RECIPE_SERVINGS_MIN, max: RECIPE_SERVINGS_MAX })
    .withMessage(`Las porciones deben ser un número entero entre ${RECIPE_SERVINGS_MIN} y ${RECIPE_SERVINGS_MAX}.`),
  body('difficulty')
    .optional({ nullable: true })
    .isIn(RECIPE_DIFFICULTIES)
    .withMessage(`La dificultad debe ser una de: ${RECIPE_DIFFICULTIES.join(', ')}.`),
  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('categoryIds debe ser un array de IDs de categoría.'),
  body('categoryIds.*')
    .isInt({ min: 1 })
    .withMessage('Cada categoryId debe ser un número entero positivo.'),
];

// Reglas de validación para actualizar una receta (PATCH /:id).
// Al menos uno de los campos editables debe estar presente.
export const validateUpdateRecipe = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('El nombre debe tener entre 2 y 150 caracteres.'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede superar los 2000 caracteres.'),
  body('preparationTime')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('El tiempo de preparación debe ser un número entero positivo (en minutos).'),
  body('servings')
    .optional({ nullable: true })
    .isInt({ min: RECIPE_SERVINGS_MIN, max: RECIPE_SERVINGS_MAX })
    .withMessage(`Las porciones deben ser un número entero entre ${RECIPE_SERVINGS_MIN} y ${RECIPE_SERVINGS_MAX}.`),
  body('difficulty')
    .optional({ nullable: true })
    .isIn(RECIPE_DIFFICULTIES)
    .withMessage(`La dificultad debe ser una de: ${RECIPE_DIFFICULTIES.join(', ')}.`),
  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('categoryIds debe ser un array de IDs de categoría.'),
  body('categoryIds.*')
    .isInt({ min: 1 })
    .withMessage('Cada categoryId debe ser un número entero positivo.'),
  // Verificamos que al menos un campo editable esté presente en el body.
  body()
    .custom((_, { req }) => {
      const campos = ['name', 'description', 'preparationTime', 'servings', 'difficulty', 'categoryIds'];
      const hayAlguno = campos.some((c) => req.body[c] !== undefined);
      if (!hayAlguno) {
        throw new Error('Se debe enviar al menos un campo editable.');
      }
      return true;
    }),
];
