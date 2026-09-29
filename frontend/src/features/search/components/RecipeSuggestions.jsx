// Sección "Recetas sugeridas" de la página de resultados: las primeras recetas que
// coinciden, con la misma RecipeCard del resto de la app (guardar, valoración, autor).
import { useNavigate } from 'react-router-dom';
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import SearchResultsSection from './SearchResultsSection.jsx';
import SearchMoreCard from './SearchMoreCard.jsx';
import { useSavedRecipes } from '../../userRecipe/hooks/useSavedRecipes.js';
import { useRecipeReviewStats } from '../../review/hooks/useRecipeReviewStats.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { splitSectionForPreview } from '../models/searchModel.js';

// Lugares de la grilla de recetas (4 columnas en desktop): si hay más coincidencias, el
// último lo ocupa la card "+N recetas más".
const RECIPE_SLOTS = 4;

// Recibe: section ({ items, total } con las recetas en forma de RecipeCard, ver
// searchModel) y seeAllTo (URL del listado completo de recetas).
function RecipeSuggestions({ section, seeAllTo }) {
  const navigate = useNavigate();
  const { userId } = useAuthContext();
  const { savedRecipeIds, handleToggleSave, saveError, clearSaveError } = useSavedRecipes();
  const { visibleItems, hiddenCount } = splitSectionForPreview(section, RECIPE_SLOTS);
  // La búsqueda no trae el promedio de reseñas: se pide aparte, igual que en la home.
  const reviewStatsByRecipe = useRecipeReviewStats(visibleItems.map((recipe) => recipe.id));

  return (
    <>
      <SearchResultsSection title="Recetas sugeridas" total={section.total} layout="recipes">
        {visibleItems.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={{
              ...recipe,
              rating: reviewStatsByRecipe[recipe.id]?.averageRating,
              reviewsCount: reviewStatsByRecipe[recipe.id]?.reviewsCount,
            }}
            onClick={() => navigate(`/recetas/${recipe.id}`)}
            // Guardar una receta propia no tiene sentido (ya está en "Mis recetas").
            showSaveButton={recipe.authorId !== userId}
            isSaved={savedRecipeIds.has(recipe.id)}
            onToggleSave={() => handleToggleSave(recipe.id)}
          />
        ))}

        {hiddenCount > 0 && (
          <SearchMoreCard
            hiddenCount={hiddenCount}
            label={hiddenCount === 1 ? 'Receta más' : 'Recetas más'}
            actionLabel="Explorar todas"
            to={seeAllTo}
            isTall
          />
        )}
      </SearchResultsSection>

      {saveError && (
        <AlertModal title="No se pudo guardar la receta" message={saveError} onClose={clearSaveError} />
      )}
    </>
  );
}

export default RecipeSuggestions;
