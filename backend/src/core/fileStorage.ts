// Almacenamiento local de archivos subidos (imágenes de recetas).
// Los archivos se guardan en backend/uploads/ y Express los sirve como estáticos en
// /uploads. En la base de datos solo se guarda la ruta pública (ej.
// "/uploads/recipes/recipe-123.webp"), nunca el archivo en sí: así la tabla no crece con
// datos binarios y el frontend descarga cada imagen por separado (y el navegador la cachea).
import fs from 'fs';
import path from 'path';

// Carpeta raíz de los archivos subidos. Se resuelve desde dist/core/ (código compilado),
// por eso sube dos niveles hasta backend/.
export const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Prefijo con el que Express sirve la carpeta de subidas (ver app.ts).
export const UPLOADS_PUBLIC_PATH = '/uploads';

// Crea la carpeta de subidas (y la subcarpeta indicada) si todavía no existe.
// Recibe: subfolder (ej. 'recipes'). Devuelve: la ruta absoluta de esa carpeta.
export const ensureUploadFolder = (subfolder: string): string => {
  const folder = path.join(UPLOADS_DIR, subfolder);
  fs.mkdirSync(folder, { recursive: true });
  return folder;
};

// Arma la ruta pública de un archivo recién guardado.
// Recibe: subfolder y filename. Devuelve: ej. "/uploads/recipes/recipe-123.webp".
export const toPublicPath = (subfolder: string, filename: string): string =>
  `${UPLOADS_PUBLIC_PATH}/${subfolder}/${filename}`;

// Indica si una URL guardada en la BD apunta a un archivo propio (y no a un link externo).
export const isLocalUpload = (url: string | null | undefined): url is string =>
  typeof url === 'string' && url.startsWith(`${UPLOADS_PUBLIC_PATH}/`);

// Borra del disco un archivo subido, a partir de su ruta pública. Ignora los links
// externos y los archivos que ya no existen: borrar la imagen no debe hacer fallar la
// operación principal (por eso tampoco lanza errores).
export const deleteLocalUpload = async (url: string | null | undefined): Promise<void> => {
  if (!isLocalUpload(url)) return;

  // path.basename evita que una ruta manipulada (ej. "/uploads/../.env") salga de UPLOADS_DIR.
  const relative = url.slice(UPLOADS_PUBLIC_PATH.length + 1);
  const absolute = path.join(UPLOADS_DIR, path.dirname(relative), path.basename(relative));
  if (!absolute.startsWith(UPLOADS_DIR)) return;

  try {
    await fs.promises.unlink(absolute);
  } catch {
    // El archivo ya no estaba: no hay nada que limpiar.
  }
};
