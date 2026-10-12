// Almacenamiento de las imágenes subidas (recetas, perfiles e ingredientes).
// Multer deja el archivo en memoria y acá se decide dónde se guarda:
// - Con las variables de Cloudinary cargadas (el deploy), se sube a Cloudinary y en la BD se
//   guarda su link https. Hace falta porque el disco del hosting gratis se borra en cada reinicio.
// - Sin ellas (desarrollo local), se guarda en backend/uploads/ y Express lo sirve como estático
//   en /uploads; en la BD se guarda la ruta pública (ej. "/uploads/recipes/recipe-123.webp").
// En los dos casos la BD guarda solo el link o la ruta, nunca el archivo: así la tabla no crece
// con datos binarios y el navegador descarga (y cachea) cada imagen por separado.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { isCloudinaryConfigured, uploadToCloudinary, isCloudinaryUrl, deleteFromCloudinary } from './cloudinaryClient.js';

// Carpeta raíz de los archivos subidos. Se resuelve desde dist/core/ (código compilado),
// por eso sube dos niveles hasta backend/.
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Prefijo con el que Express sirve la carpeta de subidas (ver app.ts).
export const UPLOADS_PUBLIC_PATH = '/uploads';

// Carpeta de Cloudinary donde quedan todas las fotos de la app (ej. "chefcito/recipes/...").
const CLOUDINARY_ROOT_FOLDER = 'chefcito';

// Tipos de imagen aceptados y la extensión con la que se guarda cada uno. Los middlewares de
// subida lo usan para rechazar otros tipos. La extensión se toma del tipo y no del nombre
// original, que lo elige el usuario y no es confiable.
export const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// Guarda una imagen recién subida (en Cloudinary o en disco, ver arriba).
// Recibe: el archivo que dejó multer en memoria, la subcarpeta (ej. 'recipes') y un prefijo
// para el nombre (ej. 'user-5'). Devuelve: la URL a guardar en la BD (link https o "/uploads/...").
// Lanza un error si no se pudo guardar.
export async function saveUploadedImage(file: Express.Multer.File, subfolder: string, namePrefix: string): Promise<string> {
  // Nombre único (prefijo + fecha + aleatorio): dos fotos nunca se pisan.
  const name = `${namePrefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;

  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file.buffer, file.mimetype, `${CLOUDINARY_ROOT_FOLDER}/${subfolder}/${name}`);
  }

  const filename = `${name}${IMAGE_EXTENSIONS[file.mimetype] ?? ''}`;
  const folder = path.join(UPLOADS_DIR, subfolder);
  await fs.promises.mkdir(folder, { recursive: true });
  await fs.promises.writeFile(path.join(folder, filename), file.buffer);
  return `${UPLOADS_PUBLIC_PATH}/${subfolder}/${filename}`;
}

// Indica si una URL guardada en la BD apunta a un archivo propio en disco (y no a un link externo).
const isLocalUpload = (url: string): boolean => url.startsWith(`${UPLOADS_PUBLIC_PATH}/`);

// Borra una imagen subida a partir de la URL guardada en la BD: de Cloudinary si es un link de
// nuestra cuenta, o del disco si es "/uploads/...". Ignora los links externos y las imágenes
// que ya no existen. Nunca lanza errores: borrar la imagen no debe hacer fallar la operación
// principal (a lo sumo queda una foto sin usar).
export const deleteUploadedImage = async (url: string | null | undefined): Promise<void> => {
  if (!url) return;

  try {
    if (isCloudinaryUrl(url)) {
      await deleteFromCloudinary(url);
      return;
    }
    if (!isLocalUpload(url)) return;

    // path.basename evita que una ruta manipulada (ej. "/uploads/../.env") salga de UPLOADS_DIR.
    const relative = url.slice(UPLOADS_PUBLIC_PATH.length + 1);
    const absolute = path.join(UPLOADS_DIR, path.dirname(relative), path.basename(relative));
    if (!absolute.startsWith(UPLOADS_DIR)) return;
    await fs.promises.unlink(absolute);
  } catch {
    // El archivo ya no estaba o Cloudinary no respondió: no hay nada más que hacer.
  }
};
