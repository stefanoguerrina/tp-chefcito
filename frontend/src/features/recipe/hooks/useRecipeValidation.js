// Hook de la validación del editor de recetas: guarda qué campos obligatorios faltan al
// intentar publicar (cada sección muestra su error), los va limpiando a medida que el
// usuario los completa y lleva la vista hasta el primer error.
import { useState, useEffect } from 'react';
import { validateRecipeDraft, hasRecipeErrors, NO_RECIPE_ERRORS } from '../models/recipeModel.js';

// Devuelve: { errors, validate, clearError, updateStepErrors } (ver cada función).
export const useRecipeValidation = () => {
  const [errors, setErrors] = useState(NO_RECIPE_ERRORS);
  // Cuenta los intentos de publicar con errores: cada uno lleva la vista al primer error.
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Después de un intento fallido, baja hasta el primer error marcado (el botón de publicar
  // está arriba y los campos, más abajo). Corre después del render, cuando el error ya existe.
  useEffect(() => {
    if (failedAttempts === 0) return;
    document
      .querySelector('.RecipeEditorPage .FieldError')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [failedAttempts]);

  // Revisa todo junto, así se marcan de una vez todos los campos que faltan.
  // Recibe: { draft, ingredients, steps, hasIngredientsCatalog } (ver validateRecipeDraft).
  // Devuelve: true si se puede publicar.
  const validate = (data) => {
    const nextErrors = validateRecipeDraft(data);
    setErrors(nextErrors);
    if (hasRecipeErrors(nextErrors)) {
      setFailedAttempts((count) => count + 1);
      return false;
    }
    return true;
  };

  // Borra el error de un campo cuando el usuario lo modifica. Recibe: 'name' | 'ingredients'.
  const clearError = (field) => setErrors((prev) => ({ ...prev, [field]: '' }));

  // Al escribir en un paso marcado, su marca se va. Si se borró un paso, los índices se
  // corren: se limpian las marcas y se vuelven a revisar al publicar.
  // Recibe: los pasos nuevos y cuántos había antes del cambio.
  const updateStepErrors = (nextSteps, previousLength) =>
    setErrors((prev) => ({
      ...prev,
      invalidStepIndexes:
        nextSteps.length < previousLength
          ? []
          : prev.invalidStepIndexes.filter((index) => !nextSteps[index]?.instruction.trim()),
    }));

  return { errors, validate, clearError, updateStepErrors };
};
