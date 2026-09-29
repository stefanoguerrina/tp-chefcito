// Hook para elegir una foto desde el modal de edición de perfil (avatar o portada), sin
// subirla todavía: guarda el archivo elegido y arma una vista previa local. La subida real
// pasa recién al tocar "Guardar cambios" (ver EditProfileModal).
import { useEffect, useState } from 'react';
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Recibe: initialUrl (la foto que ya tiene el usuario, o null).
// Devuelve: { file, isRemoved, previewUrl, handleFileChange, handleRemove }.
//   file: el File elegido (o null si no se eligió ninguno).
//   isRemoved: true si el usuario quitó la foto que ya tenía.
//   previewUrl: lo que hay que mostrar (la foto nueva, la actual o null si no hay).
export const useImagePicker = (initialUrl) => {
  const [file, setFile] = useState(null);
  // URL temporal (blob:) de la foto elegida, para mostrarla antes de subirla.
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [isRemoved, setIsRemoved] = useState(false);

  // Libera la URL temporal cuando se reemplaza o se cierra el modal: si no, el navegador
  // mantiene esa imagen en memoria hasta recargar la página.
  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    // Se vacía el input para poder volver a elegir el mismo archivo si hace falta.
    event.target.value = '';
    if (!selected || !selected.type.startsWith('image/')) return;

    setFile(selected);
    setLocalPreviewUrl(URL.createObjectURL(selected));
    setIsRemoved(false);
  };

  const handleRemove = () => {
    setFile(null);
    setLocalPreviewUrl(null);
    setIsRemoved(true);
  };

  const previewUrl = localPreviewUrl ?? (isRemoved ? null : resolveImageUrl(initialUrl));

  return { file, isRemoved, previewUrl, handleFileChange, handleRemove };
};
