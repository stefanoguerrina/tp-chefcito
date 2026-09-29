// Página de detalle de una receta (ruta /recetas/:recipeId). Grilla de dos columnas en
// desktop (una en mobile):
//   izquierda: galería de fotos, cabecera (título, autor, acciones) e ingredientes;
//   derecha:   pasos de la preparación (de a uno) y reseñas de la comunidad.
// Toma el id de la URL, así el detalle se puede recargar o compartir como link.
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRecipeById } from '../services/recipeService.js';
import { getInventory } from '../../inventory/services/inventoryService.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { useSavedRecipes } from '../../userRecipe/hooks/useSavedRecipes.js';
import RecipeGallery from '../components/RecipeGallery.jsx';
import RecipeDetailHeader from '../components/RecipeDetailHeader.jsx';
import RecipeIngredientsPanel from '../components/RecipeIngredientsPanel.jsx';
import RecipeStepsPanel from '../components/RecipeStepsPanel.jsx';
import ReviewList from '../../review/components/ReviewList.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import '../styles/_recipe-detail-page.scss';

// Cuánto tiempo queda visible el aviso flotante (ej. "¡Enlace copiado!").
const TOAST_DURATION_MS = 2600;

function RecipeDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const recipeId = Number(useParams().recipeId);
  const { userId: currentUserId, isLoggedIn } = useAuthContext();
  // Mismo estado de guardado que el feed de la home (ver useSavedRecipes).
  const { savedRecipeIds, handleToggleSave, saveError, clearSaveError } = useSavedRecipes();
  const isSaved = savedRecipeIds.has(recipeId);

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  // Ids de los ingredientes que el usuario tiene en su inventario: los ingredientes de la
  // receta que estén acá llevan la etiqueta "Despensa".
  const [pantryIngredientIds, setPantryIngredientIds] = useState(new Set());
  const [toastMessage, setToastMessage] = useState('');
  // Muestra el aviso "Próximamente" al tocar "Donar" (la CRUD de donaciones todavía no existe).
  const [showDonationSoon, setShowDonationSoon] = useState(false);

  // Pide la receta completa. El estado se actualiza solo dentro de los callbacks de la
  // promesa, así se puede llamar desde el useEffect sin renders en cascada.
  const loadRecipe = () =>
    getRecipeById(recipeId)
      .then((data) => {
        setRecipe(data);
        setFetchError('');
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setIsLoading(false));

  // Reintento manual después de un error de carga.
  const handleRetry = () => {
    setIsLoading(true);
    loadRecipe();
  };

  useEffect(() => {
    loadRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  // La despensa es un dato extra: si falla, la receta se ve igual, solo que sin etiquetas.
  useEffect(() => {
    if (!currentUserId) return;
    fetchListOrEmpty(() => getInventory(currentUserId))
      .then((items) => setPantryIngredientIds(new Set(items.map((item) => item.idIngredient))))
      .catch(() => {});
  }, [currentUserId]);

  // Muestra un aviso flotante abajo a la derecha, que se va solo.
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), TOAST_DURATION_MS);
  };

  // Guarda o quita la receta. Si falla, useSavedRecipes revierte el cambio y deja el
  // error en saveError (se muestra en un AlertModal más abajo): el aviso flotante solo
  // aparece cuando salió bien.
  const handleSaveRecipe = async () => {
    const saved = await handleToggleSave(recipeId);
    if (saved) showToast(isSaved ? 'Receta quitada de tus guardadas' : 'Receta guardada');
  };

  // Copia el link de la receta (la URL actual) para compartirlo.
  const handleShare = () =>
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => showToast('¡Enlace copiado!'))
      .catch(() => showToast('No se pudo copiar el enlace'));

  // Vuelve a la pantalla anterior; si se entró directo por link (sin historial), a la home.
  // (location.key vale 'default' cuando esta es la primera página que se abrió).
  const handleBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));

  const handleAuthorClick = (authorId) =>
    navigate(authorId === currentUserId ? '/perfil' : `/usuarios/${authorId}`);

  // Al terminar de editar, el editor vuelve a este detalle.
  const handleEditRecipe = () =>
    navigate(`/mis-recetas/${recipeId}/editar`, { state: { from: `/recetas/${recipeId}` } });

  const backButton = (
    <button type="button" className="RecipeDetailPage-backBtn" onClick={handleBack}>
      <span className="material-symbols-outlined">arrow_back</span>
      Volver
    </button>
  );

  if (isLoading) return <p className="RecipeDetailPage-status">Cargando receta...</p>;
  if (fetchError) {
    return (
      <div className="RecipeDetailPage">
        {backButton}
        <ErrorState title="No pudimos cargar la receta" message={fetchError} onRetry={handleRetry} />
      </div>
    );
  }
  if (!recipe) return null;

  const isOwnRecipe = recipe.idUser === currentUserId;

  return (
    <article className="RecipeDetailPage">
      {backButton}

      <div className="RecipeDetailPage-grid">
        <div className="RecipeDetailPage-column">
          <RecipeGallery recipe={recipe} />
          <RecipeDetailHeader
            recipe={recipe}
            isOwnRecipe={isOwnRecipe}
            // Guardar la propia receta no tiene sentido (ya está en "Mis recetas").
            canSave={isLoggedIn && !isOwnRecipe}
            isSaved={isSaved}
            onSave={handleSaveRecipe}
            onShare={handleShare}
            onAuthorClick={handleAuthorClick}
            onEdit={handleEditRecipe}
            onDonate={() => setShowDonationSoon(true)}
          />
          <RecipeIngredientsPanel
            ingredients={recipe.recipeingredient ?? []}
            pantryIngredientIds={pantryIngredientIds}
          />
        </div>

        <div className="RecipeDetailPage-column">
          {/* key: al pasar a otra receta, el panel vuelve al paso 1. */}
          <RecipeStepsPanel key={recipe.id} steps={recipe.step ?? []} />
          <ReviewList recipe={recipe} isLoggedIn={isLoggedIn} onSaveRecipe={handleSaveRecipe} isSaved={isSaved} />
        </div>
      </div>

      {toastMessage && (
        <div className="RecipeDetailPage-toast" role="status">
          <span className="material-symbols-outlined">check_circle</span>
          {toastMessage}
        </div>
      )}

      {saveError && (
        <AlertModal title="No se pudo guardar la receta" message={saveError} onClose={clearSaveError} />
      )}

      {showDonationSoon && (
        <AlertModal
          title="Próximamente"
          message="Las donaciones a creadores todavía no están disponibles en Chefcito. ¡Estamos trabajando en eso!"
          onClose={() => setShowDonationSoon(false)}
        />
      )}
    </article>
  );
}

export default RecipeDetailPage;
