// Utilidad para mostrar imágenes guardadas en el backend.
// El backend guarda las fotos subidas como una ruta relativa (ej. "/uploads/recipes/x.webp")
// para no atar la BD a un dominio puntual; acá se le antepone el origen del backend.
// Los links externos (http/https) y las vistas previas locales (blob:) se usan tal cual.
import { API_BASE_URL } from '../config/config.js';

// Origen del backend (sin el "/api" final), ej. "http://localhost:3000".
const API_ORIGIN = (API_BASE_URL ?? '').replace(/\/api\/?$/, '');

// Recibe: la URL guardada (o null). Devuelve: la URL lista para un <img src>, o null.
export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
};
