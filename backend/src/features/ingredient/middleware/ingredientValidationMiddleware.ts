// Middlewares de validación para las rutas de ingrediente, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body, param } from 'express-validator';
import { commaDecimalToDot } from '../../../core/middleware/decimalSanitizer.js';

// Reglas de los valores nutricionales que pueden venir junto con el ingrediente (alta y
// edición). Son opcionales: si no se mandan, no se tocan los que ya tenga.
const nutritionalValuesRules = [
  body('nutritionalValues')
    .optional()
    .isArray({ max: 30 })
    .withMessage('nutritionalValues debe ser una lista (máximo 30 valores).'),
  body('nutritionalValues.*.name')
    .trim()
    .notEmpty()
    .withMessage('Cada valor nutricional necesita un nombre.')
    .isLength({ max: 100 })
    .withMessage('El nombre del valor nutricional no puede superar los 100 caracteres.'),
  body('nutritionalValues.*.value')
    .optional({ values: 'null' })
    .customSanitizer(commaDecimalToDot)
    .isFloat({ min: 0, max: 99999999 })
    .withMessage('El valor nutricional debe ser un número mayor o igual a 0.'),
  body('nutritionalValues.*.servingAmount')
    .optional({ values: 'null' })
    .customSanitizer(commaDecimalToDot)
    .isFloat({ gt: 0, max: 99999999 })
    .withMessage('La porción de referencia debe ser un número mayor a 0.'),
  body('nutritionalValues.*.servingUnit')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 20 })
    .withMessage('La unidad de la porción no puede superar los 20 caracteres.'),
];

// Reglas de validación para crear un ingrediente (POST /).
export const validateCreateIngredient = [
  body('categoryIds')
    .isArray({ min: 1 })
    .withMessage('categoryIds es requerido y debe ser un array con al menos una categoría.'),
  body('categoryIds.*')
    .isInt({ min: 1 })
    .withMessage('Cada categoryId debe ser un número entero positivo.'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido.')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede superar los 255 caracteres.'),
  // Obligatoria al crear: el panel la elige de una lista fija, así todos los ingredientes
  // usan la misma abreviatura para la misma unidad (no "g" en uno y "gr" en otro).
  body('unitOfMeasure')
    .trim()
    .notEmpty()
    .withMessage('La unidad de medida es requerida.')
    .isLength({ max: 20 })
    .withMessage('La unidad de medida no puede superar los 20 caracteres.'),
  body('imagePath')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La ruta de la imagen no puede superar los 255 caracteres.'),
  ...nutritionalValuesRules,
];

// Reglas de validación para actualizar un ingrediente (PATCH /:id).
// Al menos uno de los campos editables debe estar presente.
// Si se envía categoryIds, tiene que ser un array con al menos una categoría
// (no se permite "vaciar" las categorías de un ingrediente).
export const validateUpdateIngredient = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de ingrediente debe ser un número entero positivo.'),
  body('categoryIds')
    .optional()
    .isArray({ min: 1 })
    .withMessage('categoryIds debe ser un array con al menos una categoría.'),
  body('categoryIds.*')
    .isInt({ min: 1 })
    .withMessage('Cada categoryId debe ser un número entero positivo.'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres.'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La descripción no puede superar los 255 caracteres.'),
  body('unitOfMeasure')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('La unidad de medida no puede superar los 20 caracteres.'),
  body('imagePath')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('La ruta de la imagen no puede superar los 255 caracteres.'),
  ...nutritionalValuesRules,
  // Verificamos que al menos un campo editable esté presente en el body.
  body()
    .custom((_, { req }) => {
      const campos = ['categoryIds', 'name', 'description', 'unitOfMeasure', 'imagePath', 'nutritionalValues'];
      const hayAlguno = campos.some((c) => req.body[c] !== undefined);
      if (!hayAlguno) {
        throw new Error('Se debe enviar al menos un campo editable.');
      }
      return true;
    }),
];
