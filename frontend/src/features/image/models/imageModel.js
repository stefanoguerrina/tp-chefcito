// Modelo de la feature Image (fotos de una receta): mapea la forma cruda que devuelve el
// backend y arma la que administra el editor (useRecipePhotos). Factory functions simples,
// como el resto del frontend.
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Convierte una imagen cruda del backend (fila de image) al objeto que usa el frontend.
// imageUrl es la ruta pública ("/uploads/recipes/...") o un link externo: para mostrarla
// se pasa por resolveImageUrl.
// Devuelve: { id, idRecipe, imageUrl, isMain }.
export const imageFromApi = (image) => ({
  id: image.id,
  idRecipe: image.idRecipe,
  imageUrl: image.imageUrl,
  isMain: Boolean(image.isMain),
});

// Convierte las imágenes crudas de una receta (image[]) al estado que administra
// useRecipePhotos: una "foto" por elemento, con su id real (para poder actualizarla o
// borrarla) y originalIsMain (para no mandar un PATCH de más si no cambió nada).
// La principal queda primero, así es la que se ve al abrir el editor.
export const recipeImagesToDraft = (images) =>
  (images ?? [])
    .slice()
    .sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.id - b.id)
    .map((image) => ({
      key: `existing-${image.id}`,
      existingImageId: image.id,
      file: null,
      previewUrl: resolveImageUrl(image.imageUrl),
      isMain: Boolean(image.isMain),
      originalIsMain: Boolean(image.isMain),
    }));
