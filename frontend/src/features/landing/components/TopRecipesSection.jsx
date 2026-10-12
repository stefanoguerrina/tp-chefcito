// Segunda pantalla de la landing: las 5 recetas mejor valoradas del momento (datos reales
// del backend, ver useLandingTopRecipes), con el mismo formato de card que el resto de la
// app (core/components/RecipeCard) y el número de puesto sobre la foto de cada una.
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import EmptyState from '../../../core/components/EmptyState.jsx';
import '../styles/_top-recipes-section.scss';

// Recibe: recipes (ya ordenadas de mejor a peor valorada), isLoading, error, onRetry y
// onRecipeClick, invocado al querer ver el detalle de cualquiera de ellas. Como el
// visitante todavía no puede abrir una receta, el handler abre el modal "necesitás una
// cuenta" (ver LandingPage).
function TopRecipesSection({ recipes, isLoading, error, onRetry, onRecipeClick }) {
  return (
    <section className="TopRecipesSection">
      <header className="TopRecipesSection-header">
        <p className="TopRecipesSection-eyebrow">Lo más valorado</p>
        <h2 className="TopRecipesSection-heading">Las 5 recetas del momento</h2>
      </header>

      {isLoading && <LoadingState message="Cargando recetas..." />}

      {!isLoading && error && (
        <ErrorState title="No pudimos cargar las recetas" message={error} onRetry={onRetry} />
      )}

      {!isLoading && !error && recipes.length === 0 && (
        <EmptyState
          icon="star"
          title="Todavía no hay recetas valoradas este mes"
          message="Creá tu cuenta, publicá tus recetas y reseñá las de otros: las mejores aparecen acá."
        />
      )}

      {!isLoading && !error && recipes.length > 0 && (
        <div className="TopRecipesSection-grid">
          {recipes.map((recipe, index) => (
            // El número de puesto va afuera de la card y no adentro: RecipeCard es compartida
            // con el resto de la app y en ningún otro lado hay un ranking.
            <div key={recipe.id} className="TopRecipesSection-card">
              <span className="TopRecipesSection-rank">{index + 1}</span>
              {/* Sin botón de guardar (el visitante todavía no tiene cuenta donde guardar) ni
                  chips de categoría: sobre la foto ya está el número de puesto. */}
              <RecipeCard
                recipe={recipe}
                onClick={onRecipeClick}
                showSaveButton={false}
                showCategories={false}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default TopRecipesSection;
