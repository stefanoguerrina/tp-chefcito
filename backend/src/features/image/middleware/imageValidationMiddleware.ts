// Middlewares de validación para las rutas de image, usando express-validator.
// Se ejecutan antes del controller para rechazar datos inválidos con mensajes claros.
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { RECIPE_IMAGES_FOLDER } from './imageUploadMiddleware.js';
import { deleteLocalUpload, toPublicPath } from '../../../core/fileStorage.js';

// La imagen puede llegar de dos formas: como archivo (multipart, campo "image", lo
// procesa imageUploadMiddleware y queda en req.file) o como link externo en imageUrl.
// Los links deben ser http(s): ya no se aceptan data URLs (base64), que inflaban la BD.
const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);
const hasUploadedFile = (req: any) => Boolean(req.file);

// Reglas de validación para agregar una imagen (POST /).
export const validateCreateImage = [
  body('imageUrl')
    .if((_value, { req }) => !hasUploadedFile(req))
    .trim()
    .notEmpty()
    .withMessage('Tenés que subir una imagen o pegar un link.')
    .bail()
    .isLength({ max: 500 })
    .withMessage('El link de la imagen no puede superar los 500 caracteres.')
    .custom(isHttpUrl)
    .withMessage('El link de la imagen debe empezar con http:// o https://.'),
  body('isMain')
    .optional()
    .isBoolean()
    .withMessage('isMain debe ser un valor booleano.')
    .toBoolean(),
];

// Reglas de validación para actualizar una imagen (PATCH /:id).
export const validateUpdateImage = [
  body('imageUrl')
    .if((_value, { req }) => !hasUploadedFile(req))
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El link de la imagen no puede estar vacío.')
    .bail()
    .isLength({ max: 500 })
    .withMessage('El link de la imagen no puede superar los 500 caracteres.')
    .custom(isHttpUrl)
    .withMessage('El link de la imagen debe empezar con http:// o https://.'),
  body('isMain')
    .optional()
    .isBoolean()
    .withMessage('isMain debe ser un valor booleano.')
    .toBoolean(),
  body()
    .custom((_, { req }) => {
      if (!hasUploadedFile(req) && req.body.imageUrl === undefined && req.body.isMain === undefined) {
        throw new Error('Se debe enviar al menos un campo editable.');
      }
      return true;
    }),
];

// Middleware que lee los errores de express-validator y responde 422 si los hay.
// Se debe usar después de las reglas de validación en el router.
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Si multer ya había guardado un archivo, se borra: la request no va a seguir.
    if (req.file) void deleteLocalUpload(toPublicPath(RECIPE_IMAGES_FOLDER, req.file.filename));
    res.status(422).json({
      message: 'Error de validación. Revisá los campos enviados.',
      errors: errors.array().map((e) => ({ campo: e.type === 'field' ? (e as any).path : 'general', mensaje: e.msg })),
    });
    return;
  }
  next();
};
