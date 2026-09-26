// Wizard de creación/edición de receta: Etapa 1 (tarjeta + datos base),
// Etapa 2 (ingredientes requeridos) y Etapa 3 (pasos de preparación dinámicos).
// Orquesta el estado de las tres etapas y el guardado final; el detalle visual
// de cada etapa vive en sus propios componentes (RecipeCardStage,
// RecipeIngredientsStage, RecipeStepsStage) para no superar ~150-200 líneas acá.
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import RecipeCardStage from '../components/RecipeCardStage.jsx';
import RecipeIngredientsStage from '../components/RecipeIngredientsStage.jsx';
import RecipeStepsStage from '../components/RecipeStepsStage.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import { getRecipeById, createRecipe, updateRecipe } from '../services/recipeService.js';
import { getAllCategories } from '../../category/services/categoryService.js';
import { getAllIngredients } from '../../ingredient/services/ingredientService.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import { replaceSteps } from '../../step/services/stepService.js';
import { replaceRecipeIngredients } from '../../recipeIngredient/services/recipeIngredientService.js';
import { createImage, updateImage } from '../../image/services/imageService.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { compressImage } from '../../../shared/utils/compressImage.js';
import {
  createEmptyRecipeDraft,
  recipeToDraft,
  stepsToDraft,
  recipeIngredientsToDraft,
  draftToRecipePayload,
  stepsToPayload,
  recipeIngredientsToPayload,
  draftToCoverImagePayload,
} from '../models/recipeModel.js';
import '../styles/_recipe-editor-page.scss';

const EMPTY_STEP = { instruction: '', estimatedTime: '' };
const EMPTY_INGREDIENT = { idIngredient: '', quantity: '' };

// Rutas: /mis-recetas/nueva (crear) y /mis-recetas/:recipeId/editar (editar).
// Al terminar o cancelar vuelve a la pantalla desde la que se abrió (location.state.from,
// ej. el Perfil) o, si no hay, a "Mis recetas".
function RecipeEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { recipeId: recipeIdParam } = useParams();
  const recipeId = recipeIdParam ? Number(recipeIdParam) : null;
  const isEditing = recipeId != null;
  const { username: authorUsername } = useAuthContext();

  // Catálogos para los selectores del wizard.
  const [categories, setCategories] = useState([]);
  const [ingredientsCatalog, setIngredientsCatalog] = useState([]);

  const [draft, setDraft] = useState(createEmptyRecipeDraft());
  const [ingredients, setIngredients] = useState([EMPTY_INGREDIENT]);
  const [steps, setSteps] = useState([EMPTY_STEP]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Error de la foto de portada (archivo ilegible, link inválido), se muestra bajo el campo.
  const [coverImageError, setCoverImageError] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const ingredientsStageRef = useRef(null);
  const stepsStageRef = useRef(null);

  // Al editar, carga la receta existente (incluye sus ingredientes y pasos) y
  // precarga el formulario.
  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede
  // llamar desde el useEffect sin renders en cascada.
  // Pide las categorías y el catálogo de ingredientes (un 404 = lista vacía) y, si se
  // está editando, la receta con sus ingredientes y pasos para precargar el formulario.
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
          setIngredients(recipe.recipeingredient?.length ? recipeIngredientsToDraft(recipe.recipeingredient) : [EMPTY_INGREDIENT]);
          setSteps(recipe.step?.length ? stepsToDraft(recipe.step) : [EMPTY_STEP]);
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

  // Vuelve a la pantalla desde la que se abrió el wizard (o a "Mis recetas").
  const handleExit = () => navigate(location.state?.from ?? '/mis-recetas');

  const handleFieldChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  // Comprime la foto elegida (WebP, máx. 1280px) y muestra una vista previa local.
  // Se sube recién al publicar, porque necesita el id de la receta (que todavía no
  // existe si se está creando una nueva). Elegir una foto descarta un link pegado.
  const handleCoverImageSelect = async (file) => {
    setCoverImageError('');
    setIsProcessingImage(true);
    try {
      const compressed = await compressImage(file);
      setDraft((prev) => ({
        ...prev,
        coverImageFile: compressed,
        coverImageLink: '',
        coverImagePreview: URL.createObjectURL(compressed),
      }));
    } catch (err) {
      setCoverImageError(err.message);
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Usa un link externo como portada. Pegar un link descarta una foto elegida antes.
  const handleCoverImageLinkChange = (link) => {
    setCoverImageError('');
    setDraft((prev) => ({
      ...prev,
      coverImageLink: link,
      coverImageFile: null,
      coverImagePreview: link.trim() || prev.coverImagePreview,
    }));
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
    const coverImageLink = draft.coverImageLink.trim();
    if (coverImageLink && !/^https?:\/\/\S+$/i.test(coverImageLink)) {
      setCoverImageError('El link de la imagen debe empezar con http:// o https://.');
      setSubmitError('Revisá el link de la foto de portada.');
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

      // Solo se manda la portada si el usuario eligió una foto nueva o pegó un link.
      const coverImagePayload = draftToCoverImagePayload(draft);
      if (coverImagePayload) {
        if (draft.mainImageId != null) {
          await updateImage(savedRecipe.id, draft.mainImageId, coverImagePayload);
        } else {
          await createImage(savedRecipe.id, coverImagePayload);
        }
      }

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
      <div className="RecipeEditorPage-banner">
        <div>
          <span className="RecipeEditorPage-eyebrow">Taller Culinario Chefcito</span>
          <h1>{isEditing ? 'Editar receta' : 'Crear una nueva receta'}</h1>
          <p>Diseñá la ficha visual y detallá el paso a paso para que la comunidad pueda replicarla.</p>
        </div>
        <button type="button" className="btn btn--secondary" onClick={handleExit}>
          Cancelar
        </button>
      </div>

      <RecipeCardStage
        values={draft}
        categories={categories}
        authorUsername={authorUsername}
        onFieldChange={handleFieldChange}
        onCoverImageSelect={handleCoverImageSelect}
        onCoverImageLinkChange={handleCoverImageLinkChange}
        coverImageError={coverImageError}
        isProcessingImage={isProcessingImage}
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
            disabled={isSubmitting || isProcessingImage}
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
