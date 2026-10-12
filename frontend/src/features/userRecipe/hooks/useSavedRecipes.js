// Hook que sabe qué recetas guardó el usuario autenticado y permite guardar/quitar una.
// Lo usan el feed de la home y los listados (para pintar el listón de cada card) y el
// detalle de una receta (botón "Guardar"), así todos muestran siempre el mismo estado.
import { useState, useEffect } from 'react';
import { getSavedRecipeIds, createUserRecipe, deleteUserRecipe } from '../services/userRecipeService.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';

// Recibe (opcional): { loadSavedIds } — false cuando quien lo usa ya sabe si su receta está
// guardada (el detalle de receta lo recibe en la misma respuesta de la receta): así no se
// piden todas las guardadas del usuario solo para una. En ese caso, informarlo con setSaved.
// Devuelve: savedRecipeIds (Set de ids), setSaved(idRecipe, isSaved), handleToggleSave(idRecipe),
// saveError (mensaje del último guardado que falló, para mostrarlo en un modal) y clearSaveError.
export const useSavedRecipes = ({ loadSavedIds = true } = {}) => {
  const { userId } = useAuthContext();
  const [savedRecipeIds, setSavedRecipeIds] = useState(new Set());
  const [saveError, setSaveError] = useState('');

  // Si falla la carga, las cards simplemente arrancan sin marcar como guardadas.
  useEffect(() => {
    if (!loadSavedIds) return;
    fetchListOrEmpty(() => getSavedRecipeIds(userId))
      .then((ids) => setSavedRecipeIds(new Set(ids)))
      .catch(() => setSavedRecipeIds(new Set()));
  }, [userId, loadSavedIds]);

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
  // revierte si el backend falla. Devuelve true si se guardó el cambio, false si falló
  // (el error queda en saveError), por si quien llama quiere avisar que salió bien.
  const handleToggleSave = async (idRecipe) => {
    const wasSaved = savedRecipeIds.has(idRecipe);
    setSaved(idRecipe, !wasSaved);
    try {
      if (wasSaved) {
        await deleteUserRecipe(idRecipe);
      } else {
        await createUserRecipe(idRecipe);
      }
      return true;
    } catch (err) {
      setSaved(idRecipe, wasSaved);
      setSaveError(err.message);
      return false;
    }
  };

  return { savedRecipeIds, setSaved, handleToggleSave, saveError, clearSaveError: () => setSaveError('') };
};
