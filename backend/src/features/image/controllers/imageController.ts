// Controller de image — maneja las rutas anidadas de /api/recipes/:idRecipe/images.
// Delega toda la lógica de negocio al imageService; solo se encarga de leer
// la request y armar la response HTTP correcta.
import { Response } from 'express';
import * as imageService from '../services/imageService.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';
import { deleteUploadedImage, saveUploadedImage } from '../../../core/fileStorage.js';
import { RECIPE_IMAGES_FOLDER } from '../middleware/imageUploadMiddleware.js';

// Si la request trajo un archivo (multipart), lo guarda (Cloudinary o disco) y devuelve su
// URL; si no, el link que vino en el body (o undefined si no vino ninguno).
const resolveImageUrl = async (req: AuthRequest): Promise<string | undefined> =>
  req.file
    ? saveUploadedImage(req.file, RECIPE_IMAGES_FOLDER, `recipe-${req.params.idRecipe}`)
    : req.body.imageUrl;

// Borra la foto recién guardada cuando la operación no se completó (receta inexistente,
// sin permisos, error inesperado), para no dejar fotos huérfanas. Si la imagen era un link
// externo (no vino archivo), no hay nada que borrar.
const discardUploadedFile = (req: AuthRequest, imageUrl: string | undefined): void => {
  if (req.file) void deleteUploadedImage(imageUrl);
};

// Devuelve las imágenes de una receta (la principal primero).
// GET /api/recipes/:idRecipe/images
export const handleSearchImagesByRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);

    if (isNaN(idRecipe) || idRecipe <= 0) {
      res.status(400).json({ message: 'El ID de receta no es válido.' });
      return;
    }

    const images = await imageService.getImagesByRecipe(idRecipe);
    if (images === 'recipe_not_found') {
      res.status(404).json({ message: 'Receta no encontrada.' });
      return;
    }

    res.status(200).json(images);
  } catch (error) {
    console.error('[handleSearchImagesByRecipe] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Agrega una nueva imagen a una receta (solo su dueño o un admin).
// Body: multipart con el archivo en "image", o JSON { imageUrl } con un link externo;
// isMain opcional. Si isMain=true, reemplaza a la imagen principal anterior.
// POST /api/recipes/:idRecipe/images
export const handleCreateImage = async (req: AuthRequest, res: Response): Promise<void> => {
  let imageUrl: string | undefined;
  try {
    const idRecipe = Number(req.params.idRecipe);
    imageUrl = await resolveImageUrl(req);
    const { isMain } = req.body;

    const result = await imageService.addImage(idRecipe, req.user!.id, req.user!.isAdmin, { imageUrl: imageUrl as string, isMain });

    if (!result.ok) {
      discardUploadedFile(req, imageUrl);
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Receta no encontrada.' });
        return;
      }
      res.status(403).json({ message: 'Acceso denegado. Solo podés agregar imágenes a tus propias recetas.' });
      return;
    }

    res.status(201).json(result.image);
  } catch (error) {
    discardUploadedFile(req, imageUrl);
    console.error('[handleCreateImage] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Actualiza una imagen existente (solo su dueño o un admin).
// PATCH /api/recipes/:idRecipe/images/:id
export const handleUpdateImageById = async (req: AuthRequest, res: Response): Promise<void> => {
  let imageUrl: string | undefined;
  try {
    const idRecipe = Number(req.params.idRecipe);
    const id = Number(req.params.id);
    imageUrl = await resolveImageUrl(req);
    const { isMain } = req.body;

    const result = await imageService.updateImage(idRecipe, id, req.user!.id, req.user!.isAdmin, { imageUrl, isMain });

    if (!result.ok) {
      discardUploadedFile(req, imageUrl);
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Imagen no encontrada.' });
        return;
      }
      res.status(403).json({ message: 'Acceso denegado. Solo podés modificar imágenes de tus propias recetas.' });
      return;
    }

    res.status(200).json(result.image);
  } catch (error) {
    discardUploadedFile(req, imageUrl);
    console.error('[handleUpdateImageById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Elimina una imagen por ID (solo su dueño o un admin).
// DELETE /api/recipes/:idRecipe/images/:id
export const handleDeleteImageById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idRecipe = Number(req.params.idRecipe);
    const id = Number(req.params.id);

    if (isNaN(idRecipe) || idRecipe <= 0 || isNaN(id) || id <= 0) {
      res.status(400).json({ message: 'El ID de receta o de imagen no es válido.' });
      return;
    }

    const result = await imageService.deleteImage(idRecipe, id, req.user!.id, req.user!.isAdmin);

    if (!result.ok) {
      if (result.reason === 'not_found') {
        res.status(404).json({ message: 'Imagen no encontrada.' });
        return;
      }
      res.status(403).json({ message: 'Acceso denegado. Solo podés eliminar imágenes de tus propias recetas.' });
      return;
    }

    res.status(200).json({ message: 'Imagen eliminada correctamente.' });
  } catch (error) {
    console.error('[handleDeleteImageById] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
