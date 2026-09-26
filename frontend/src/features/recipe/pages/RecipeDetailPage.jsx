// Página de detalle de una receta (ruta /recetas/:recipeId): muestra imagen principal,
// metadatos, descripción, ingredientes, pasos y la sección de reseñas (ReviewList).
// Toma el id de la URL, así el detalle se puede recargar o compartir como link.
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getRecipeById } from '../services/recipeService.js';
import { getRecipeImageUrl, RECIPE_PLACEHOLDER_AVATAR } from '../models/recipeModel.js';
import ReviewList from '../../review/components/ReviewList.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { useSavedRecipes } from '../../userRecipe/hooks/useSavedRecipes.js';
import '../styles/_recipe-detail-page.scss';

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

  // Guarda o quita el guardado de la receta para el usuario autenticado.
  const handleSaveRecipe = () => handleToggleSave(recipeId);

  // Vuelve a la pantalla anterior; si se entró directo por link (sin historial), a la home.
  // (location.key vale 'default' cuando esta es la primera página que se abrió).
  const handleBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));

  const handleAuthorClick = (authorId) =>
    navigate(authorId === currentUserId ? '/perfil' : `/usuarios/${authorId}`);

  if (isLoading) return <p className="RecipeDetailPage-status">Cargando receta...</p>;
  if (fetchError) {
    return (
      <div className="RecipeDetailPage">
        <button type="button" className="RecipeDetailPage-backBtn" onClick={handleBack}>
          <span className="material-symbols-outlined">arrow_back</span>
          Volver
        </button>
        <ErrorState title="No pudimos cargar la receta" message={fetchError} onRetry={handleRetry} />
      </div>
    );
  }
  if (!recipe) return null;

  const imageUrl = getRecipeImageUrl(recipe);
  const categoryName = recipe.recipecategory?.[0]?.category?.name;

  return (
    <article className="RecipeDetailPage">
      {/* Botón volver */}
      <button type="button" className="RecipeDetailPage-backBtn" onClick={handleBack}>
        <span className="material-symbols-outlined">arrow_back</span>
        Volver
      </button>

      {/* Imagen portada */}
      <div className="RecipeDetailPage-cover">
        <img className="RecipeDetailPage-coverImage" src={imageUrl} alt={recipe.name} />
        {categoryName && (
          <span className="RecipeDetailPage-badge">
            <span className="material-symbols-outlined">sell</span>
            {categoryName}
          </span>
        )}
      </div>

      {/* Encabezado */}
      <div className="RecipeDetailPage-header">
        <div className="RecipeDetailPage-headerMain">
          {recipe.user?.id ? (
            <button
              type="button"
              className="RecipeDetailPage-author RecipeDetailPage-author--clickable"
              onClick={() => handleAuthorClick(recipe.user.id)}
            >
              <img
                className="RecipeDetailPage-authorAvatar"
                src={recipe.user?.avatarUrl ?? RECIPE_PLACEHOLDER_AVATAR}
                alt={recipe.user?.username ?? ''}
              />
              <span>Por @{recipe.user?.username ?? 'desconocido'}</span>
            </button>
          ) : (
            <div className="RecipeDetailPage-author">
              <img
                className="RecipeDetailPage-authorAvatar"
                src={recipe.user?.avatarUrl ?? RECIPE_PLACEHOLDER_AVATAR}
                alt={recipe.user?.username ?? ''}
              />
              <span>Por @{recipe.user?.username ?? 'desconocido'}</span>
            </div>
          )}
          <h1 className="RecipeDetailPage-title">{recipe.name}</h1>

          <div className="RecipeDetailPage-meta">
            <span className="material-symbols-outlined">schedule</span>
            <span>{recipe.preparationTime ? `${recipe.preparationTime} min` : '—'}</span>
            <span className="RecipeDetailPage-metaDot" />
            <span className="material-symbols-outlined">signal_cellular_alt</span>
            <span>{recipe.difficulty ?? 'Sin definir'}</span>
          </div>
        </div>

        {/* Guardar receta / donar al creador: ninguna de las dos tiene sentido en tu propia receta */}
        {isLoggedIn && recipe.idUser !== currentUserId && (
          <div className="RecipeDetailPage-headerActions">
            <button
              type="button"
              className={`RecipeDetailPage-saveBtn${isSaved ? ' RecipeDetailPage-saveBtn--saved' : ''}`}
              onClick={handleSaveRecipe}
              aria-pressed={isSaved}
            >
              <span className="material-symbols-outlined">bookmark</span>
              {isSaved ? 'Guardada' : 'Guardar'}
            </button>

            <button
              type="button"
              className="RecipeDetailPage-donateBtn"
              onClick={() => setShowDonationSoon(true)}
            >
              <span className="material-symbols-outlined">volunteer_activism</span>
              Donar
            </button>
          </div>
        )}
      </div>

      {saveError && (
        <AlertModal
          title="No se pudo guardar la receta"
          message={saveError}
          onClose={clearSaveError}
        />
      )}

      {/* Descripción */}
      {recipe.description && (
        <p className="RecipeDetailPage-description">{recipe.description}</p>
      )}

      {/* Ingredientes */}
      {recipe.recipeingredient?.length > 0 && (
        <section className="RecipeDetailPage-section">
          <h2 className="RecipeDetailPage-sectionTitle">
            <span className="material-symbols-outlined">grocery</span>
            Ingredientes
          </h2>
          <ul className="RecipeDetailPage-ingredientList">
            {recipe.recipeingredient.map((item) => (
              <li key={item.idIngredient} className="RecipeDetailPage-ingredientItem">
                <span className="RecipeDetailPage-ingredientName">
                  {item.ingredient?.name ?? `Ingrediente #${item.idIngredient}`}
                </span>
                {item.requiredQuantity != null && (
                  <span className="RecipeDetailPage-ingredientQty">
                    {item.requiredQuantity} {item.ingredient?.unitOfMeasure ?? ''}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Pasos */}
      {recipe.step?.length > 0 && (
        <section className="RecipeDetailPage-section">
          <h2 className="RecipeDetailPage-sectionTitle">
            <span className="material-symbols-outlined">format_list_numbered</span>
            Preparación
          </h2>
          <ol className="RecipeDetailPage-stepList">
            {recipe.step.map((step, index) => (
              <li key={step.id ?? index} className="RecipeDetailPage-stepItem">
                <span className="RecipeDetailPage-stepNumber">{step.stepNumber}</span>
                <div>
                  <p className="RecipeDetailPage-stepInstruction">{step.instruction}</p>
                  {step.estimatedTime && (
                    <span className="RecipeDetailPage-stepTime">
                      <span className="material-symbols-outlined">timer</span>
                      {step.estimatedTime} min
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Sección de reseñas */}
      <ReviewList
        recipe={recipe}
        isLoggedIn={isLoggedIn}
        onSaveRecipe={handleSaveRecipe}
        isSaved={isSaved}
      />

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
