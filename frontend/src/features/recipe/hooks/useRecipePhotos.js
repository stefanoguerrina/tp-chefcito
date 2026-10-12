// Hook que administra las fotos de una receta dentro del editor (hasta MAX_PHOTOS, una
// marcada como principal). Nada se sube o borra al instante: las fotos elegidas se
// comprimen y quedan en memoria (vista previa local), y recién se aplican al backend al
// publicar (commitPhotos), igual que ya hacía el editor con la portada única de antes.
import { useState } from 'react';
import { compressImage } from '../../../shared/utils/compressImage.js';
import { createImage, updateImage, deleteImage } from '../../image/services/imageService.js';
import { recipeImagesToDraft } from '../../image/models/imageModel.js';

const MAX_PHOTOS = 6;

const isBlobUrl = (url) => typeof url === 'string' && url.startsWith('blob:');

// Recibe: nada (se inicializa vacío). Para precargar una receta existente, llamar a
// loadFromRecipe(recipe) — mismo patrón que setDraft/setIngredients/setSteps en
// RecipeEditorPage, que solo se completan cuando la carga async trae datos reales.
export const useRecipePhotos = () => {
  const [photos, setPhotos] = useState([]);
  // Ids de fotos ya guardadas que el usuario quitó, para borrarlas recién al publicar.
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const mainPhoto = photos.find((photo) => photo.isMain) ?? null;
  const canAddMore = photos.length < MAX_PHOTOS;

  const loadFromRecipe = (recipe) => {
    setPhotos(recipeImagesToDraft(recipe?.image));
    setDeletedImageIds([]);
  };

  // Comprime cada archivo elegido y lo agrega al final, hasta llegar a MAX_PHOTOS. Si
  // todavía no había ninguna foto, la primera queda como principal.
  const addFiles = async (fileList) => {
    const remainingSlots = MAX_PHOTOS - photos.length;
    const filesToAdd = Array.from(fileList).slice(0, Math.max(remainingSlots, 0));
    if (filesToAdd.length === 0) return;

    setError('');
    setIsProcessing(true);
    try {
      const compressedFiles = await Promise.all(filesToAdd.map(compressImage));
      setPhotos((prev) => [
        ...prev,
        ...compressedFiles.map((file, index) => ({
          key: `new-${Date.now()}-${index}`,
          existingImageId: null,
          file,
          previewUrl: URL.createObjectURL(file),
          isMain: prev.length === 0 && index === 0,
          originalIsMain: false,
        })),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reemplaza el archivo de la foto principal ("Cambiar foto principal"). Si todavía no
  // hay ninguna foto, agrega esta como la primera (y por lo tanto, principal).
  const replaceMainFile = async (file) => {
    if (!mainPhoto) {
      await addFiles([file]);
      return;
    }
    setError('');
    setIsProcessing(true);
    try {
      const compressed = await compressImage(file);
      if (isBlobUrl(mainPhoto.previewUrl)) URL.revokeObjectURL(mainPhoto.previewUrl);
      const nextPreviewUrl = URL.createObjectURL(compressed);
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.key === mainPhoto.key ? { ...photo, file: compressed, previewUrl: nextPreviewUrl } : photo
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Marca una foto como principal (el backend ya desmarca solo cualquier otra al guardar;
  // acá solo se refleja en la vista previa).
  const setMain = (key) => {
    setPhotos((prev) => prev.map((photo) => ({ ...photo, isMain: photo.key === key })));
  };

  // Quita una foto. Si era la principal y quedan otras, la primera pasa a serlo. Si ya
  // estaba guardada en el backend, se anota para borrarla recién al publicar.
  const remove = (key) => {
    const target = photos.find((photo) => photo.key === key);
    if (!target) return;
    if (isBlobUrl(target.previewUrl)) URL.revokeObjectURL(target.previewUrl);
    if (target.existingImageId != null) {
      setDeletedImageIds((ids) => [...ids, target.existingImageId]);
    }
    setPhotos((prev) => {
      const next = prev.filter((photo) => photo.key !== key);
      if (target.isMain && next.length > 0 && !next.some((photo) => photo.isMain)) {
        next[0] = { ...next[0], isMain: true };
      }
      return next;
    });
  };

  // Aplica los cambios al backend al publicar: borra las fotos quitadas y crea/actualiza
  // el resto. Solo manda un PATCH si esa foto cambió de archivo o de principal; una foto
  // ya guardada que no se tocó no genera ningún pedido.
  const commitPhotos = async (recipeId) => {
    for (const imageId of deletedImageIds) {
      await deleteImage(recipeId, imageId);
    }
    for (const photo of photos) {
      const changedFile = Boolean(photo.file);
      const changedMain = photo.isMain !== photo.originalIsMain;
      if (photo.existingImageId == null) {
        await createImage(recipeId, { file: photo.file, isMain: photo.isMain });
      } else if (changedFile || changedMain) {
        await updateImage(recipeId, photo.existingImageId, {
          ...(changedFile ? { file: photo.file } : {}),
          isMain: photo.isMain,
        });
      }
    }
  };

  return {
    photos,
    mainPhoto,
    canAddMore,
    error,
    isProcessing,
    loadFromRecipe,
    addFiles,
    replaceMainFile,
    setMain,
    remove,
    commitPhotos,
  };
};
