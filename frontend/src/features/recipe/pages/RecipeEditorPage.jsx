// Editor de creación/edición de receta: barra de acciones arriba (descartar/publicar) y,
// debajo, los módulos de la receta (fotos + instrucciones lado a lado, y a todo el ancho
// los datos básicos y los ingredientes). Orquesta el estado de cada módulo y el guardado
// final; el detalle visual de cada uno vive en su propio componente para no superar
// ~150-200 líneas acá.
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import RecipeMediaStage from '../components/RecipeMediaStage.jsx';
import RecipeBasicInfoSection from '../components/RecipeBasicInfoSection.jsx';
import RecipeCategoryPicker from '../components/RecipeCategoryPicker.jsx';
import RecipeIngredientsStage from '../components/RecipeIngredientsStage.jsx';
import RecipeStepsEditorStage from '../components/RecipeStepsEditorStage.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import RequiredFieldsNote from '../../../core/components/RequiredFieldsNote.jsx';
import { getRecipeById, createRecipe, updateRecipe } from '../services/recipeService.js';
import { getAllCategories } from '../../category/services/categoryService.js';
import { getAllIngredients } from '../../ingredient/services/ingredientService.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import { replaceSteps } from '../../step/services/stepService.js';
import { replaceRecipeIngredients } from '../../recipeIngredient/services/recipeIngredientService.js';
import { useRecipePhotos } from '../hooks/useRecipePhotos.js';
import { useRecipeValidation } from '../hooks/useRecipeValidation.js';
import {
  createEmptyRecipeDraft,
  recipeToDraft,
  stepsToDraft,
  recipeIngredientsToDraft,
  draftToRecipePayload,
  stepsToPayload,
  recipeIngredientsToPayload,
  computePreparationTimeFromSteps,
} from '../models/recipeModel.js';
import '../styles/_recipe-editor-page.scss';

const EMPTY_STEP = { instruction: '', estimatedTime: '' };

// Rutas: /mis-recetas/nueva (crear) y /mis-recetas/:recipeId/editar (editar).
// Al terminar o cancelar vuelve a la pantalla desde la que se abrió (location.state.from,
// ej. el Perfil) o, si no hay, a "Mis recetas".
function RecipeEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { recipeId: recipeIdParam } = useParams();
  const recipeId = recipeIdParam ? Number(recipeIdParam) : null;
  const isEditing = recipeId != null;

  // Catálogos para los selectores del editor.
  const [categories, setCategories] = useState([]);
  const [ingredientsCatalog, setIngredientsCatalog] = useState([]);

  const [draft, setDraft] = useState(createEmptyRecipeDraft());
  // Los ingredientes se agregan desde AddIngredientModal (ver RecipeIngredientsStage):
  // arranca vacío, no con una fila en blanco para completar a mano.
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([EMPTY_STEP]);
  const photos = useRecipePhotos();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  // Campos obligatorios sin completar al intentar publicar (cada sección muestra el suyo).
  const validation = useRecipeValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

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

  // Vuelve a la pantalla desde la que se abrió el editor (o a "Mis recetas").
  const handleExit = () => navigate(location.state?.from ?? '/mis-recetas');

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (field === 'name') validation.clearError('name');
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

      handleExit();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="RecipeEditorPage-loading">Cargando editor...</p>;
  }

  if (loadError) {
    return <ErrorState title="No pudimos cargar la receta" message={loadError} onRetry={handleRetryLoad} />;
  }

  return (
    <div className="RecipeEditorPage">
      <header className="RecipeEditorPage-header">
        <h1 className="RecipeEditorPage-title">{isEditing ? 'Editar receta' : 'Crear receta'}</h1>
        <RequiredFieldsNote />
      </header>

      <div className="RecipeEditorPage-topbar">
        <button
          type="button"
          className="RecipeEditorPage-discardBtn"
          onClick={() => setShowDiscardConfirm(true)}
        >
          <span className="material-symbols-outlined">delete_sweep</span>
          Descartar cambios
        </button>

        <div className="RecipeEditorPage-topbarActions">
          {/* Todavía no existe un estado "borrador" en el backend (la receta se guarda
              publicada o no se guarda): el botón queda visible pero deshabilitado, mismo
              criterio que otros accesos sin feature propia (ver sidebar). */}
          <button
            type="button"
            className="RecipeEditorPage-draftBtn"
            disabled
            title="Todavía no disponible"
          >
            Guardar como borrador
          </button>
          <button
            type="button"
            className="RecipeEditorPage-publishBtn"
            onClick={handlePublish}
            disabled={isSubmitting || photos.isProcessing}
          >
            <span className="material-symbols-outlined">{isEditing ? 'save' : 'publish'}</span>
            {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Publicar receta'}
          </button>
        </div>
      </div>

      {/* Fila de arriba: fotos + instrucciones, estiradas a la misma altura (si no,
          fotos queda una tarjeta bastante más baja y deja un hueco raro al lado). */}
      <div className="RecipeEditorPage-grid">
        <RecipeMediaStage
          photos={photos.photos}
          mainPhoto={photos.mainPhoto}
          canAddMore={photos.canAddMore}
          error={photos.error}
          isProcessing={photos.isProcessing}
          onAddFiles={photos.addFiles}
          onReplaceMainFile={photos.replaceMainFile}
          onSetMain={photos.setMain}
          onRemove={photos.remove}
        />

        <RecipeStepsEditorStage
          steps={steps}
          onStepsChange={handleStepsChange}
          invalidStepIndexes={validation.errors.invalidStepIndexes}
        />
      </div>

      {/* Fila de abajo: título/descripción a la izquierda y, a la derecha, ingredientes +
          categorías apilados, estirada a la misma altura que la columna de la izquierda
          para que ocupen el mismo espacio. */}
      <div className="RecipeEditorPage-grid">
        <RecipeBasicInfoSection
          values={draft}
          onFieldChange={handleFieldChange}
          nameError={validation.errors.name}
        />

        <div className="RecipeEditorPage-column">
          <RecipeIngredientsStage
            ingredients={ingredients}
            ingredientsCatalog={ingredientsCatalog}
            onIngredientsChange={handleIngredientsChange}
            error={validation.errors.ingredients}
          />

          <RecipeCategoryPicker
            categories={categories}
            selectedIds={draft.categoryIds}
            onChange={handleCategoriesChange}
          />
        </div>
      </div>

      {showDiscardConfirm && (
        <ConfirmModal
          title="Descartar cambios"
          message="Vas a perder todo lo que cargaste en este editor. ¿Querés descartarlo?"
          confirmLabel="Descartar"
          danger
          onConfirm={handleExit}
          onCancel={() => setShowDiscardConfirm(false)}
        />
      )}

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
