// Servicio de imágenes de receta: centraliza las llamadas HTTP al backend.
// Una imagen se puede cargar de dos formas: subiendo un archivo (viaja como FormData y el
// backend lo guarda en disco con multer) o pegando un link externo (viaja como JSON).
// En ambos casos la BD guarda solo la URL/ruta, nunca la imagen en sí.
import { apiFetch } from '../../../shared/utils/apiFetch.js';

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

// Trae las imágenes de una receta, la principal primero (lectura pública).
export const getImagesByRecipe = async (idRecipe) => {
  return await apiFetch(`/recipes/${idRecipe}/images`);
};

// Agrega una imagen a una receta (requiere ser el dueño o admin).
// Recibe: idRecipe, { file? | imageUrl?, isMain? }. Devuelve: la imagen creada.
export const createImage = async (idRecipe, data) => {
  return await apiFetch(`/recipes/${idRecipe}/images`, {
    method: 'POST',
    body: buildImageBody(data),
  });
};

// Reemplaza una imagen existente (requiere ser el dueño o admin). El backend borra el
// archivo anterior si era una foto subida.
// Recibe: idRecipe, id, { file? | imageUrl?, isMain? }.
export const updateImage = async (idRecipe, id, data) => {
  return await apiFetch(`/recipes/${idRecipe}/images/${id}`, {
    method: 'PATCH',
    body: buildImageBody(data),
  });
};

// Elimina una imagen por ID (requiere ser el dueño o admin).
export const deleteImage = async (idRecipe, id) => {
  return await apiFetch(`/recipes/${idRecipe}/images/${id}`, {
    method: 'DELETE',
  });
};
