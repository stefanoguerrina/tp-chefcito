// Wizard de creación/edición de receta: Etapa 1 (tarjeta + datos base),
// Etapa 2 (ingredientes requeridos) y Etapa 3 (pasos de preparación dinámicos).
// Orquesta el estado de las tres etapas y el guardado final; el detalle visual
// de cada etapa vive en sus propios componentes (RecipeCardStage,
// RecipeIngredientsStage, RecipeStepsStage) para no superar ~150-200 líneas acá.
import { useState, useEffect, useRef } from 'react';
import RecipeCardStage from '../components/RecipeCardStage.jsx';
import RecipeIngredientsStage from '../components/RecipeIngredientsStage.jsx';
import RecipeStepsStage from '../components/RecipeStepsStage.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import { getRecipeById, createRecipe, updateRecipe } from '../services/recipeService.js';
import { replaceSteps } from '../../step/services/stepService.js';
import { replaceRecipeIngredients } from '../../recipeIngredient/services/recipeIngredientService.js';
import { createImage, updateImage } from '../../image/services/imageService.js';
import { getCurrentUsername } from '../../../shared/utils/decodeToken.js';
import {
  createEmptyRecipeDraft,
  recipeToDraft,
  stepsToDraft,
  recipeIngredientsToDraft,
  draftToRecipePayload,
  stepsToPayload,
  recipeIngredientsToPayload,
} from '../models/recipeModel.js';
import '../styles/_recipe-editor-page.scss';

const EMPTY_STEP = { instruction: '', estimatedTime: '' };
const EMPTY_INGREDIENT = { idIngredient: '', quantity: '' };

// Recibe: recipeId (null para crear, id para editar), categories e
// ingredientsCatalog (para los selectores), onDone (callback al terminar de
// publicar/guardar), onCancel.
function RecipeEditorPage({ recipeId, categories, ingredientsCatalog, onDone, onCancel }) {
  const authorUsername = getCurrentUsername();
  const isEditing = recipeId != null;

  const [draft, setDraft] = useState(createEmptyRecipeDraft());
  const [ingredients, setIngredients] = useState([EMPTY_INGREDIENT]);
  const [steps, setSteps] = useState([EMPTY_STEP]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // true solo cuando el usuario eligió una foto nueva en esta sesión de edición
  // (si no cambió nada, no hace falta volver a mandar la imagen al backend).
  const [coverImageChanged, setCoverImageChanged] = useState(false);

  const ingredientsStageRef = useRef(null);
  const stepsStageRef = useRef(null);

  // Al editar, carga la receta existente (incluye sus ingredientes y pasos) y
  // precarga el formulario.
  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const recipe = await getRecipeById(recipeId);
        setDraft(recipeToDraft(recipe));
        setIngredients(recipe.recipeingredient?.length ? recipeIngredientsToDraft(recipe.recipeingredient) : [EMPTY_INGREDIENT]);
        setSteps(recipe.step?.length ? stepsToDraft(recipe.step) : [EMPTY_STEP]);
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isEditing, recipeId]);

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  // Convierte la imagen elegida a data URL para la previsualización inmediata;
  // se guarda como imagen principal de la receta recién al publicar (necesita
  // el id de la receta, que todavía no existe si se está creando una nueva).
  const handleCoverImageSelect = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      handleFieldChange('coverImagePreview', event.target.result);
      setCoverImageChanged(true);
    };
    reader.readAsDataURL(file);
  };

  const handleContinueToIngredients = () => {
    ingredientsStageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleContinueToSteps = () => {
    stepsStageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePublish = async () => {
    setSubmitError('');

    if (!draft.name.trim()) {
      setSubmitError('El título del plato es requerido.');
      return;
    }
    // Si todavía no hay ningún ingrediente cargado en el catálogo, no hay nada
    // para elegir: se omite la validación y el paso de guardado de ingredientes.
    if (ingredientsCatalog.length > 0 && ingredients.some((item) => !item.idIngredient)) {
      setSubmitError('Todos los ingredientes deben estar elegidos del catálogo.');
      return;
    }
    if (steps.some((step) => !step.instruction.trim())) {
      setSubmitError('Todos los pasos necesitan una instrucción.');
      return;
    }

    setIsSubmitting(true);
    try {
      const recipePayload = draftToRecipePayload(draft);
      const savedRecipe = isEditing
        ? await updateRecipe(recipeId, recipePayload)
        : await createRecipe(recipePayload);

      if (ingredientsCatalog.length > 0) {
        await replaceRecipeIngredients(savedRecipe.id, recipeIngredientsToPayload(ingredients));
      }
      await replaceSteps(savedRecipe.id, stepsToPayload(steps));

      if (coverImageChanged && draft.coverImagePreview) {
        if (draft.mainImageId != null) {
          await updateImage(savedRecipe.id, draft.mainImageId, { imageUrl: draft.coverImagePreview });
        } else {
          await createImage(savedRecipe.id, { imageUrl: draft.coverImagePreview, isMain: true });
        }
      }

      onDone();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="RecipeEditorPage-loading">Cargando receta...</p>;
  }

  if (loadError) {
    return <p className="RecipeEditorPage-error">⚠ {loadError}</p>;
  }

  return (
    <div className="RecipeEditorPage">
      <div className="RecipeEditorPage-banner">
        <div>
          <span className="RecipeEditorPage-eyebrow">Taller Culinario Chefcito</span>
          <h1>{isEditing ? 'Editar receta' : 'Crear una nueva receta'}</h1>
          <p>Diseñá la ficha visual y detallá el paso a paso para que la comunidad pueda replicarla.</p>
        </div>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>

      <RecipeCardStage
        values={draft}
        categories={categories}
        authorUsername={authorUsername}
        onFieldChange={handleFieldChange}
        onCoverImageSelect={handleCoverImageSelect}
        onContinue={handleContinueToIngredients}
      />

      <div ref={ingredientsStageRef}>
        <RecipeIngredientsStage
          ingredients={ingredients}
          ingredientsCatalog={ingredientsCatalog}
          onIngredientsChange={setIngredients}
          onContinue={handleContinueToSteps}
        />
      </div>

      <div ref={stepsStageRef}>
        <RecipeStepsStage steps={steps} onStepsChange={setSteps} />
      </div>

      <div className="RecipeEditorPage-publishBar">
        <div className="RecipeEditorPage-publishInfo">
          <span className="material-symbols-outlined">verified</span>
          <div>
            <h4>¿Todo listo para compartir?</h4>
            <p>Tu receta se publicará en la comunidad con la tarjeta, los ingredientes y los pasos que cargaste.</p>
          </div>
        </div>
        <div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handlePublish}
            disabled={isSubmitting}
          >
            <span className="material-symbols-outlined">publish</span>
            {isSubmitting ? 'Publicando...' : isEditing ? 'Guardar cambios' : 'Publicar receta'}
          </button>
        </div>
      </div>

      {submitError && (
        <AlertModal
          title="No se pudo publicar la receta"
          message={submitError}
          onClose={() => setSubmitError('')}
        />
      )}
    </div>
  );
}

export default RecipeEditorPage;
