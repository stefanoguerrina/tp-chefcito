// Middleware de subida de las fotos del perfil (avatar y portada) con multer.
// Mismo criterio que las imágenes de receta (features/image/middleware/imageUploadMiddleware):
// lee el campo "image" de un formulario multipart, valida tipo y tamaño y deja el archivo en
// memoria. El controller lo guarda (core/fileStorage: Cloudinary o backend/uploads/users/) y
// en la BD queda solo el link o la ruta, nunca el archivo.
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { IMAGE_EXTENSIONS } from '../../../core/fileStorage.js';

export const USER_IMAGES_FOLDER = 'users';

// 2 MB alcanzan de sobra: el frontend ya comprime la foto (WebP, máx. 1280px) antes de subirla.
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (IMAGE_EXTENSIONS[file.mimetype]) {
      callback(null, true);
    } else {
      callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
    }
  },
}).single('image');

// Traduce los errores de multer a una respuesta 422 con el mismo formato que el resto de
// las validaciones ({ message, errors: [{ campo, mensaje }] }).
export const uploadUserImage = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    let mensaje = 'No se pudo procesar la imagen enviada.';
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') mensaje = 'La imagen no puede superar los 2 MB.';
      if (error.code === 'LIMIT_UNEXPECTED_FILE') mensaje = 'La imagen debe ser JPG, PNG, WEBP o GIF.';
    }

    res.status(422).json({
      message: 'Error de validación. Revisá los campos enviados.',
      errors: [{ campo: 'image', mensaje }],
    });
  });
};
