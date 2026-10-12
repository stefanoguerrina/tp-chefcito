// Hook del formulario "Editar perfil": guarda los campos, las dos fotos (avatar y portada),
// los errores por campo y el estado de guardado, y al enviar valida y llama al backend.
// EditProfileModal solo se ocupa de mostrarlo.
import { useState } from 'react';
import { updateUserService } from '../services/updateUserService.js';
import { uploadUserImageService, deleteUserImageService } from '../services/userImageService.js';
import { useImagePicker } from '../../../core/hooks/useImagePicker.js';
import { compressImage } from '../../../shared/utils/compressImage.js';
import { createProfileForm, validateProfileForm, toProfilePayload } from '../models/userModel.js';

// Sube la foto nueva o quita la que había, según lo que se eligió en el modal. Si no se
// tocó nada, no llama al backend. Recibe: userId, kind ('avatar' | 'cover'), picker (lo de
// useImagePicker) y hadImage (si el usuario ya tenía esa foto). Devuelve: el usuario
// actualizado, o null si no hubo cambios.
const saveImageChange = async (userId, kind, picker, hadImage) => {
  if (picker.file) {
    // Se comprime antes de subir (WebP, máx. 1280px), igual que las fotos de recetas.
    return await uploadUserImageService(userId, kind, await compressImage(picker.file));
  }
  if (picker.isRemoved && hadImage) {
    return await deleteUserImageService(userId, kind);
  }
  return null;
};

// Recibe: user (datos actuales) y onSaved(updatedUser), que se llama al terminar de guardar.
// Devuelve: { form, avatar, cover, fieldErrors, error, isSaving, updateField, handleSubmit }.
export const useEditProfileForm = (user, onSaved) => {
  const avatar = useImagePicker(user.avatarUrl);
  const cover = useImagePicker(user.coverUrl);
  const [form, setForm] = useState(() => createProfileForm(user));
  // Errores por campo ({ name: '...' }: vacíos o rechazados por el backend) y uno general.
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Cambia un campo y borra solo SU error.
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Lo obligatorio se avisa debajo de cada campo sin llamar al backend.
    const requiredErrors = validateProfileForm(form);
    if (Object.keys(requiredErrors).length > 0) {
      setFieldErrors(requiredErrors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      // Primero los datos y después cada foto: cada pedido devuelve el usuario actualizado,
      // y el último es el que se le pasa a onSaved.
      let updated = await updateUserService(user.id, toProfilePayload(form));
      updated = (await saveImageChange(user.id, 'avatar', avatar, Boolean(user.avatarUrl))) ?? updated;
      updated = (await saveImageChange(user.id, 'cover', cover, Boolean(user.coverUrl))) ?? updated;
      onSaved(updated);
    } catch (err) {
      // Si el backend marcó campos del formulario, cada error va debajo de su campo; si no
      // (ej. una foto rechazada), se muestra el mensaje general arriba del pie.
      const hasFormFieldErrors = err.fieldErrors?.some(({ campo }) => campo !== 'image');
      if (hasFormFieldErrors) {
        setFieldErrors(Object.fromEntries(err.fieldErrors.map(({ campo, mensaje }) => [campo, mensaje])));
      } else {
        setError(err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return { form, avatar, cover, fieldErrors, error, isSaving, updateField, handleSubmit };
};
