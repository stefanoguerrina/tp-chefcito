// Página de detalle de una receta: muestra imagen principal, metadatos, descripción,
// ingredientes, pasos y la sección de reseñas (ReviewList).
// Se monta como panel dentro de HomePage (igual que RecipePage, IngredientPage, etc.)
// y recibe el id de la receta seleccionada. Al pulsar "Volver" avisa al padre.
import { useState, useEffect } from 'react';
import { getRecipeById } from '../services/recipeService.js';
import { RECIPE_PLACEHOLDER_IMAGE, RECIPE_PLACEHOLDER_AVATAR } from '../models/recipeModel.js';
import ReviewList from '../../review/components/ReviewList.jsx';
import StarRating from '../../../core/components/StarRating.jsx';
import { getCurrentUserId } from '../../../shared/utils/decodeToken.js';
import '../styles/_recipe-detail-page.scss';

// Recibe:
//   recipeId   — id de la receta a mostrar
//   onBack     — handler para volver al listado
//   isLoggedIn — para mostrar u ocultar el botón de reseñar
function RecipeDetailPage({ recipeId, onBack, isLoggedIn }) {
  const currentUserId = getCurrentUserId();

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setFetchError('');
      try {
        const data = await getRecipeById(recipeId);
        setRecipe(data);
      } catch (err) {
        setFetchError(err.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [recipeId]);

  // Alterna el estado de guardado (por ahora solo UI, sin llamada al backend).
  // La lógica completa de UserRecipe se implementa en T-4.4.
  const handleSaveRecipe = () => setIsSaved((prev) => !prev);

  if (isLoading) return <p className="RecipeDetailPage-status">Cargando receta...</p>;
  if (fetchError) return <p className="RecipeDetailPage-status RecipeDetailPage-status--error">⚠ {fetchError}</p>;
  if (!recipe) return null;

  const mainImage = recipe.image?.find((img) => img.isMain) ?? recipe.image?.[0] ?? null;
  const imageUrl = mainImage?.imageUrl ?? RECIPE_PLACEHOLDER_IMAGE;
  const categoryName = recipe.recipecategory?.[0]?.category?.name;

  return (
    <article className="RecipeDetailPage">
      {/* Botón volver */}
      <button type="button" className="RecipeDetailPage-backBtn" onClick={onBack}>
        <span className="material-symbols-outlined">arrow_back</span>
        Volver al explorador
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
          <div className="RecipeDetailPage-author">
            <img
              className="RecipeDetailPage-authorAvatar"
              src={recipe.user?.avatarUrl ?? RECIPE_PLACEHOLDER_AVATAR}
              alt={recipe.user?.username ?? ''}
            />
            <span>Por @{recipe.user?.username ?? 'desconocido'}</span>
          </div>
          <h1 className="RecipeDetailPage-title">{recipe.name}</h1>

          <div className="RecipeDetailPage-meta">
            <span className="material-symbols-outlined">schedule</span>
            <span>{recipe.preparationTime ? `${recipe.preparationTime} min` : '—'}</span>
            <span className="RecipeDetailPage-metaDot" />
            <span className="material-symbols-outlined">signal_cellular_alt</span>
            <span>{recipe.difficulty ?? 'Sin definir'}</span>
          </div>
        </div>

        {/* Botón guardar receta */}
        {isLoggedIn && recipe.idUser !== currentUserId && (
          <button
            type="button"
            className={`RecipeDetailPage-saveBtn${isSaved ? ' RecipeDetailPage-saveBtn--saved' : ''}`}
            onClick={handleSaveRecipe}
            aria-pressed={isSaved}
          >
            <span className="material-symbols-outlined">bookmark</span>
            {isSaved ? 'Guardada' : 'Guardar'}
          </button>
        )}
      </div>

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
    </article>
  );
}

export default RecipeDetailPage;
