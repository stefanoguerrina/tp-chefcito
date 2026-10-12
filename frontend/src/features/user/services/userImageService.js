// Servicio de las fotos del perfil (avatar y portada). Cada usuario tiene una sola de cada
// una: se sube como archivo (FormData, campo "image") y el backend la guarda en disco con
// multer; en la BD queda solo la ruta ("/uploads/users/..."). Mismo esquema que las
// imágenes de receta (features/image/services/imageService.js).
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { userFromApi } from '../models/userModel.js';

// Recibe: userId, kind ('avatar' | 'cover') y el File (ya comprimido).
// Devuelve: el usuario actualizado (userFromApi). El backend borra la foto anterior del disco.
export const uploadUserImageService = async (userId, kind, file) => {
  const formData = new FormData();
  formData.append('image', file);
  const user = await apiFetch(`/users/${userId}/${kind}`, {
    method: 'PATCH',
    body: formData,
  });
  return userFromApi(user);
};

// Quita la foto indicada (el perfil vuelve a las iniciales / al degradé de la portada).
// Recibe: userId y kind ('avatar' | 'cover'). Devuelve: el usuario actualizado (userFromApi).
export const deleteUserImageService = async (userId, kind) => {
  const user = await apiFetch(`/users/${userId}/${kind}`, {
    method: 'DELETE',
  });
  return userFromApi(user);
};
