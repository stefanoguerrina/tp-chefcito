// Middleware de subida de las fotos del perfil (avatar y portada) con multer.
// Mismo criterio que las imágenes de receta (features/image/middleware/imageUploadMiddleware):
// lee el campo "image" de un formulario multipart, valida tipo y tamaño y guarda el archivo
// en backend/uploads/users/. En la BD se guarda solo la ruta pública, nunca el archivo.
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { ensureUploadFolder } from '../../../core/fileStorage.js';

export const USER_IMAGES_FOLDER = 'users';

// 2 MB alcanzan de sobra: el frontend ya comprime la foto (WebP, máx. 1280px) antes de subirla.
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

// Tipos de imagen aceptados y la extensión con la que se guarda cada uno. La extensión se
// toma del tipo y no del nombre original, que lo elige el usuario y no es confiable.
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, ensureUploadFolder(USER_IMAGES_FOLDER));
  },
  // Nombre único (id del usuario + fecha + aleatorio): dos fotos nunca se pisan, y cada
  // archivo se puede rastrear hasta su dueño.
  filename: (req, file, callback) => {
    const extension = ALLOWED_MIME_TYPES[file.mimetype] ?? path.extname(file.originalname);
    const random = crypto.randomBytes(6).toString('hex');
    callback(null, `user-${req.params.id}-${Date.now()}-${random}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (ALLOWED_MIME_TYPES[file.mimetype]) {
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
