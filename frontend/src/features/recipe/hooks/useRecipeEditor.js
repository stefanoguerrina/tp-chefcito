// Hook del editor de recetas: carga los catálogos (categorías e ingredientes) y, al editar,
// la receta existente; guarda el estado de cada módulo (datos, ingredientes, pasos, fotos)
// y publica todo junto. RecipeEditorPage solo se ocupa de mostrarlo.
import { useState, useEffect } from 'react';
import { getRecipeById, createRecipe, updateRecipe } from '../services/recipeService.js';
import { getAllCategories } from '../../category/services/categoryService.js';
import { getAllIngredients } from '../../ingredient/services/ingredientService.js';
import { replaceSteps } from '../../step/services/stepService.js';
import { replaceRecipeIngredients } from '../../recipeIngredient/services/recipeIngredientService.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import { useRecipePhotos } from './useRecipePhotos.js';
import { useRecipeValidation } from './useRecipeValidation.js';
import {
  createEmptyRecipeDraft,
  recipeToDraft,
  draftToRecipePayload,
  computePreparationTimeFromSteps,
} from '../models/recipeModel.js';
import { stepsToDraft, stepsToPayload } from '../../step/models/stepModel.js';
import { recipeIngredientsToDraft, recipeIngredientsToPayload } from '../../recipeIngredient/models/recipeIngredientModel.js';

const EMPTY_STEP = { instruction: '', estimatedTime: '' };

// Recibe: recipeId (null para crear una receta nueva) y onPublished (se llama al terminar
// de guardar todo). Devuelve el estado del editor, sus handlers y handlePublish.
export const useRecipeEditor = (recipeId, onPublished) => {
  const isEditing = recipeId != null;

  // Catálogos para los selectores del editor.
  const [categories, setCategories] = useState([]);
  const [ingredientsCatalog, setIngredientsCatalog] = useState([]);

  const [draft, setDraft] = useState(createEmptyRecipeDraft());
  // Los ingredientes se agregan desde un modal (ver RecipeIngredientsStage): arranca
  // vacío, no con una fila en blanco para completar a mano.
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([EMPTY_STEP]);
  const photos = useRecipePhotos();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  // Campos obligatorios sin completar al intentar publicar (cada sección muestra el suyo).
  const validation = useRecipeValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Al editar, carga la receta existente (con sus fotos, ingredientes y pasos) y precarga
  // el formulario. El estado se actualiza solo dentro de los callbacks de la promesa, así
  // se puede llamar desde el useEffect sin renders en cascada.
  const loadRecipe = () =>
    Promise.all([
      fetchListOrEmpty(() => getAllCategories()),
      fetchListOrEmpty(() => getAllIngredients()),
      isEditing ? getRecipeById(recipeId) : Promise.resolve(null),
    ])
      .then(([categoriesData, ingredientsData, recipe]) => {
        setCategories(categoriesData);
        setIngredientsCatalog(ingredientsData);
        if (recipe) {
          setDraft(recipeToDraft(recipe));
          setIngredients(recipe.recipeingredient?.length ? recipeIngredientsToDraft(recipe.recipeingredient) : []);
          setSteps(recipe.step?.length ? stepsToDraft(recipe.step) : [EMPTY_STEP]);
          photos.loadFromRecipe(recipe);
        }
        setLoadError('');
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setIsLoading(false));

  // Reintento manual después de un error de carga.
  const handleRetryLoad = () => {
    setIsLoading(true);
    loadRecipe();
  };

  useEffect(() => {
    loadRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (field === 'name' || field === 'servings') validation.clearError(field);
  };

  const handleIngredientsChange = (nextIngredients) => {
    setIngredients(nextIngredients);
    validation.clearError('ingredients');
  };

  const handleStepsChange = (nextSteps) => {
    setSteps(nextSteps);
    validation.updateStepErrors(nextSteps, steps.length);
  };

  const handleCategoriesChange = (categoryIds) => {
    setDraft((prev) => ({ ...prev, categoryIds }));
  };

  // Valida y guarda la receta, después sus ingredientes, sus pasos y sus fotos (cada
  // lista tiene su propio endpoint). Si algo falla, el error queda en submitError.
  const handlePublish = async () => {
    setSubmitError('');

    // Si el catálogo de ingredientes está vacío no hay nada para elegir: ahí no se exigen
    // (y tampoco se guarda la lista, ver más abajo).
    const isValid = validation.validate({
      draft,
      ingredients,
      steps,
      hasIngredientsCatalog: ingredientsCatalog.length > 0,
    });
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      // El tiempo de preparación no lo carga el usuario: sale de sumar el tiempo de
      // cada paso (ver RecipeStepsEditorStage, que muestra el mismo cálculo).
      const recipePayload = { ...draftToRecipePayload(draft), preparationTime: computePreparationTimeFromSteps(steps) };
      const savedRecipe = isEditing
        ? await updateRecipe(recipeId, recipePayload)
        : await createRecipe(recipePayload);

      if (ingredientsCatalog.length > 0) {
        await replaceRecipeIngredients(savedRecipe.id, recipeIngredientsToPayload(ingredients));
      }
      await replaceSteps(savedRecipe.id, stepsToPayload(steps));
      await photos.commitPhotos(savedRecipe.id);

      onPublished();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isEditing,
    categories,
    ingredientsCatalog,
    draft,
    ingredients,
    steps,
    photos,
    validation,
    isLoading,
    loadError,
    submitError,
    isSubmitting,
    clearSubmitError: () => setSubmitError(''),
    handleRetryLoad,
    handleFieldChange,
    handleIngredientsChange,
    handleStepsChange,
    handleCategoriesChange,
    handlePublish,
  };
};
