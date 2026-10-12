// Cliente mínimo de la API REST de Cloudinary (subir y borrar imágenes), hecho con fetch para
// no sumar el SDK como dependencia. Se usa en el deploy, donde el disco del backend se borra en
// cada reinicio: las fotos se guardan en Cloudinary y en la BD queda su link https.
// Las credenciales salen de CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.
import crypto from 'crypto';

const CLOUDINARY_API_URL = 'https://api.cloudinary.com/v1_1';
const CLOUDINARY_DELIVERY_URL = 'https://res.cloudinary.com';
const REQUEST_TIMEOUT_MS = 15000;

interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

// Devuelve las credenciales si están las tres variables, o null si falta alguna
// (en local normalmente no están, y las fotos se guardan en disco).
const getCredentials = (): CloudinaryCredentials | null => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
};

// Indica si Cloudinary está configurado (las tres variables cargadas).
export const isCloudinaryConfigured = (): boolean => getCredentials() !== null;

// Firma de un pedido: SHA-1 de los parámetros ordenados alfabéticamente ("a=1&b=2") seguidos
// del API Secret. Con esto Cloudinary sabe que el pedido viene de nuestro backend sin que el
// secreto viaje en el pedido.
// Recibe: los parámetros a firmar y el secreto. Devuelve: la firma en hexadecimal.
const signParams = (params: Record<string, string>, apiSecret: string): string => {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
};

// Recibe las credenciales, la acción ('upload' o 'destroy') y los datos del formulario.
// Devuelve el JSON de la respuesta, o lanza un error si Cloudinary responde con error.
async function requestCloudinary(credentials: CloudinaryCredentials, action: 'upload' | 'destroy', form: FormData) {
  const response = await fetch(`${CLOUDINARY_API_URL}/${credentials.cloudName}/image/${action}`, {
    method: 'POST',
    body: form,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Cloudinary respondió ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

// Sube una imagen a Cloudinary.
// Recibe: el contenido del archivo, su tipo (ej. "image/webp") y el public_id con el que se
// guarda (ej. "chefcito/recipes/recipe-123-ab12"; las barras lo ordenan en carpetas).
// Devuelve: el link https de la imagen, que es lo que se guarda en la BD.
export async function uploadToCloudinary(content: Buffer, mimeType: string, publicId: string): Promise<string> {
  const credentials = getCredentials();
  if (!credentials) throw new Error('Cloudinary no está configurado.');

  const params = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(content)], { type: mimeType }));
  form.append('api_key', credentials.apiKey);
  form.append('public_id', params.public_id);
  form.append('timestamp', params.timestamp);
  form.append('signature', signParams(params, credentials.apiSecret));

  const result = await requestCloudinary(credentials, 'upload', form);
  return result.secure_url as string;
}

// Saca el public_id de un link de Cloudinary de nuestra cuenta, o null si el link es de otro
// lado. Ej.: ".../<cuenta>/image/upload/v1712345678/chefcito/recipes/recipe-1.webp" →
// "chefcito/recipes/recipe-1" (sin la versión "v..." ni la extensión).
const getPublicIdFromUrl = (url: string, cloudName: string): string | null => {
  const prefix = `${CLOUDINARY_DELIVERY_URL}/${cloudName}/image/upload/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length).replace(/^v\d+\//, '').replace(/\.[a-z0-9]+$/i, '');
};

// Indica si un link guardado en la BD es una imagen de nuestra cuenta de Cloudinary.
export const isCloudinaryUrl = (url: string): boolean => {
  const credentials = getCredentials();
  return credentials !== null && getPublicIdFromUrl(url, credentials.cloudName) !== null;
};

// Borra de Cloudinary la imagen de un link guardado en la BD. Ignora los links que no son de
// nuestra cuenta. Puede lanzar si Cloudinary falla (quien la llama decide qué hacer).
export async function deleteFromCloudinary(url: string): Promise<void> {
  const credentials = getCredentials();
  if (!credentials) return;
  const publicId = getPublicIdFromUrl(url, credentials.cloudName);
  if (!publicId) return;

  const params = { public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
  const form = new FormData();
  form.append('api_key', credentials.apiKey);
  form.append('public_id', params.public_id);
  form.append('timestamp', params.timestamp);
  form.append('signature', signParams(params, credentials.apiSecret));

  await requestCloudinary(credentials, 'destroy', form);
}
