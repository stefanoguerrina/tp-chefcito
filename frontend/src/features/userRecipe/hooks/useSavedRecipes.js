// Hook que sabe qué recetas guardó el usuario autenticado y permite guardar/quitar una.
// Lo usan el feed de la home (para pintar el listón de cada card) y el detalle de una
// receta (botón "Guardar"), así los dos muestran siempre el mismo estado.
import { useState, useEffect } from 'react';
import { getSavedRecipeIds, createUserRecipe, deleteUserRecipe } from '../services/userRecipeService.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';

// Devuelve: savedRecipeIds (Set de ids), handleToggleSave(idRecipe), saveError (mensaje
// del último guardado que falló, para mostrarlo en un modal) y clearSaveError.
export const useSavedRecipes = () => {
  const { userId } = useAuthContext();
  const [savedRecipeIds, setSavedRecipeIds] = useState(new Set());
  const [saveError, setSaveError] = useState('');

  // Si falla la carga, las cards simplemente arrancan sin marcar como guardadas.
  useEffect(() => {
    fetchListOrEmpty(() => getSavedRecipeIds(userId))
      .then((ids) => setSavedRecipeIds(new Set(ids)))
      .catch(() => setSavedRecipeIds(new Set()));
  }, [userId]);

  // Actualiza el conjunto de ids sin mutar el Set anterior (React necesita uno nuevo).
  const setSaved = (idRecipe, isSaved) => {
    setSavedRecipeIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.add(idRecipe);
      else next.delete(idRecipe);
      return next;
    });
  };

  // Guarda o quita una receta. Actualiza el listón de forma optimista (al instante) y lo
  // revierte si el backend falla.
  const handleToggleSave = async (idRecipe) => {
    const wasSaved = savedRecipeIds.has(idRecipe);
    setSaved(idRecipe, !wasSaved);
    try {
      if (wasSaved) {
        await deleteUserRecipe(idRecipe);
      } else {
        await createUserRecipe(idRecipe);
      }
    } catch (err) {
      setSaved(idRecipe, wasSaved);
      setSaveError(err.message);
    }
  };

  return { savedRecipeIds, handleToggleSave, saveError, clearSaveError: () => setSaveError('') };
};
