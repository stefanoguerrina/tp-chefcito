// Servicio de imágenes de receta: centraliza las llamadas HTTP al backend.
// Una imagen se puede cargar de dos formas: subiendo un archivo (viaja como FormData y el
// backend lo guarda en disco con multer) o pegando un link externo (viaja como JSON).
// En ambos casos la BD guarda solo la URL/ruta, nunca la imagen en sí.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { imageFromApi } from '../models/imageModel.js';

// Arma el body según el origen de la imagen.
// Recibe: { file?, imageUrl?, isMain? }. Devuelve: un FormData (si hay archivo) o un JSON.
const buildImageBody = ({ file, imageUrl, isMain }) => {
  if (file) {
    const formData = new FormData();
    formData.append('image', file);
    if (isMain !== undefined) formData.append('isMain', String(isMain));
    return formData;
  }
  return JSON.stringify({ imageUrl, isMain });
};

// Agrega una imagen a una receta (requiere ser el dueño o admin).
// Recibe: idRecipe, { file? | imageUrl?, isMain? }. Devuelve: la imagen creada (imageFromApi).
export const createImage = async (idRecipe, data) => {
  const image = await apiFetch(`/recipes/${idRecipe}/images`, {
    method: 'POST',
    body: buildImageBody(data),
  });
  return imageFromApi(image);
};

// Reemplaza una imagen existente (requiere ser el dueño o admin). El backend borra el
// archivo anterior si era una foto subida.
// Recibe: idRecipe, id, { file? | imageUrl?, isMain? }. Devuelve: la imagen actualizada
// (imageFromApi).
export const updateImage = async (idRecipe, id, data) => {
  const image = await apiFetch(`/recipes/${idRecipe}/images/${id}`, {
    method: 'PATCH',
    body: buildImageBody(data),
  });
  return imageFromApi(image);
};

// Elimina una imagen por ID (requiere ser el dueño o admin).
export const deleteImage = async (idRecipe, id) => {
  return await apiFetch(`/recipes/${idRecipe}/images/${id}`, {
    method: 'DELETE',
  });
};
