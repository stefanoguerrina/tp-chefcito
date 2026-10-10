// Editor de creación/edición de receta: barra de acciones arriba (descartar/publicar) y,
// debajo, los módulos de la receta (fotos + instrucciones lado a lado, y a todo el ancho
// los datos básicos y los ingredientes). La carga, el estado de cada módulo y el guardado
// viven en useRecipeEditor; el detalle visual de cada módulo, en su propio componente.
import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import RecipeMediaStage from '../components/RecipeMediaStage.jsx';
import RecipeBasicInfoSection from '../components/RecipeBasicInfoSection.jsx';
import RecipeCategoryPicker from '../components/RecipeCategoryPicker.jsx';
import RecipeIngredientsStage from '../components/RecipeIngredientsStage.jsx';
import RecipeStepsEditorStage from '../components/RecipeStepsEditorStage.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import RequiredFieldsNote from '../../../core/components/RequiredFieldsNote.jsx';
import { hasRecipeErrors } from '../models/recipeModel.js';
import { useRecipeEditor } from '../hooks/useRecipeEditor.js';
import '../styles/_recipe-editor-page.scss';

// Rutas: /mis-recetas/nueva (crear) y /mis-recetas/:recipeId/editar (editar).
// Al terminar o cancelar vuelve a la pantalla desde la que se abrió (location.state.from,
// ej. el Perfil) o, si no hay, a "Mis recetas".
function RecipeEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { recipeId: recipeIdParam } = useParams();
  const recipeId = recipeIdParam ? Number(recipeIdParam) : null;
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Vuelve a la pantalla desde la que se abrió el editor (o a "Mis recetas").
  const handleExit = () => navigate(location.state?.from ?? '/mis-recetas');

  const editor = useRecipeEditor(recipeId, handleExit);
  const { isEditing, draft, photos, validation, isLoading, loadError, submitError, isSubmitting } = editor;

  if (isLoading) {
    return <LoadingState message="Cargando editor..." />;
  }

  if (loadError) {
    return <ErrorState title="No pudimos cargar la receta" message={loadError} onRetry={editor.handleRetryLoad} />;
  }

  return (
    <div className="RecipeEditorPage">
      <header className="RecipeEditorPage-header">
        <h1 className="RecipeEditorPage-title">{isEditing ? 'Editar receta' : 'Crear receta'}</h1>
        <RequiredFieldsNote isVisible={hasRecipeErrors(validation.errors)} />
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
          <button
            type="button"
            className="RecipeEditorPage-publishBtn"
            onClick={editor.handlePublish}
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
          steps={editor.steps}
          onStepsChange={editor.handleStepsChange}
          invalidStepIndexes={validation.errors.invalidStepIndexes}
        />
      </div>

      {/* Fila de abajo: título/descripción a la izquierda y, a la derecha, ingredientes +
          categorías apilados, estirada a la misma altura que la columna de la izquierda
          para que ocupen el mismo espacio. */}
      <div className="RecipeEditorPage-grid">
        <RecipeBasicInfoSection
          values={draft}
          onFieldChange={editor.handleFieldChange}
          nameError={validation.errors.name}
          servingsError={validation.errors.servings}
        />

        <div className="RecipeEditorPage-column">
          <RecipeIngredientsStage
            ingredients={editor.ingredients}
            ingredientsCatalog={editor.ingredientsCatalog}
            onIngredientsChange={editor.handleIngredientsChange}
            error={validation.errors.ingredients}
          />

          <RecipeCategoryPicker
            categories={editor.categories}
            selectedIds={draft.categoryIds}
            onChange={editor.handleCategoriesChange}
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
          onClose={editor.clearSubmitError}
        />
      )}
    </div>
  );
}

export default RecipeEditorPage;
