// Página de detalle de una receta: muestra imagen principal, metadatos, descripción,
// ingredientes, pasos y la sección de reseñas (ReviewList).
// Se monta como panel dentro de HomePage (igual que RecipePage, IngredientPage, etc.)
// y recibe el id de la receta seleccionada. Al pulsar "Volver" avisa al padre.
import { useState, useEffect } from 'react';
import { getRecipeById } from '../services/recipeService.js';
import { RECIPE_PLACEHOLDER_IMAGE, RECIPE_PLACEHOLDER_AVATAR } from '../models/recipeModel.js';
import ReviewList from '../../review/components/ReviewList.jsx';
import StarRating from '../../../core/components/StarRating.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import { getCurrentUserId } from '../../../shared/utils/decodeToken.js';
import '../styles/_recipe-detail-page.scss';

// Recibe:
//   recipeId      — id de la receta a mostrar
//   onBack        — handler para volver al listado
//   onAuthorClick — handler opcional que recibe el id del creador, para abrir su
//                   perfil de solo lectura (ver ProfilePage/HomePage)
//   isLoggedIn    — para mostrar u ocultar el botón de reseñar/guardar
//   isSaved       — si la receta ya está guardada por el usuario autenticado
//   onToggleSave  — handler para guardar/quitar la receta (recibe recipeId).
//                  El estado de guardado vive en HomePage (isSaved/onToggleSave)
//                  para que quede sincronizado con el listón de la card en el
//                  feed: si se guarda desde acá y se vuelve, la card ya lo refleja.
function RecipeDetailPage({ recipeId, onBack, onAuthorClick, isLoggedIn, isSaved, onToggleSave }) {
  const currentUserId = getCurrentUserId();

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [saveError, setSaveError] = useState('');
  // Muestra el aviso "Próximamente" al tocar "Donar" (la CRUD de donaciones todavía no existe).
  const [showDonationSoon, setShowDonationSoon] = useState(false);

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

  // Guarda o quita el guardado de la receta para el usuario autenticado.
  const handleSaveRecipe = async () => {
    setSaveError('');
    try {
      await onToggleSave(recipeId);
    } catch (err) {
      setSaveError(err.message);
    }
  };

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
          {onAuthorClick && recipe.user?.id ? (
            <button
              type="button"
              className="RecipeDetailPage-author RecipeDetailPage-author--clickable"
              onClick={() => onAuthorClick(recipe.user.id)}
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

      {saveError && <p className="RecipeDetailPage-status RecipeDetailPage-status--error">⚠ {saveError}</p>}

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
