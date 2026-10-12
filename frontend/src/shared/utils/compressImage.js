// Comprime una foto en el navegador antes de subirla, usando solo APIs nativas (canvas).
// Una foto de celular pesa 3-5 MB; redimensionada a 1280px y pasada a WebP queda en
// ~100-300 KB, así la subida es más rápida y el servidor guarda mucho menos.

const MAX_DIMENSION_PX = 1280;
const WEBP_QUALITY = 0.8;

// Carga un File de imagen en un <img> para poder dibujarlo en el canvas.
const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen. Probá con otro archivo.'));
    };
    image.src = url;
  });

// Recibe: un File de imagen. Devuelve: un File WebP más liviano (lado mayor ≤ 1280px).
// Si el navegador no puede generar WebP, devuelve el archivo original sin cambios.
export const compressImage = async (file) => {
  const image = await loadImage(file);

  // Achica manteniendo la proporción; si ya es chica, no la agranda.
  const scale = Math.min(1, MAX_DIMENSION_PX / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY));
  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto';
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
};
