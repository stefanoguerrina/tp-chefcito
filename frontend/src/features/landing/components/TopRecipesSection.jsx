// Segunda pantalla de la landing: las 5 recetas mejor valoradas del momento, con el mismo
// formato de card que el resto de la app (core/components/RecipeCard), y el número de puesto
// sobre la foto de cada una.
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import '../styles/_top-recipes-section.scss';

// Recibe: recipes (las 5 recetas, ya ordenadas de mejor a peor valorada) y onRecipeClick,
// invocado al querer ver el detalle de cualquiera de ellas. Como el visitante todavía no
// puede abrir una receta, el handler abre el modal "necesitás una cuenta" (ver LandingPage).
function TopRecipesSection({ recipes, onRecipeClick }) {
  return (
    <section className="TopRecipesSection">
      <header className="TopRecipesSection-header">
        <p className="TopRecipesSection-eyebrow">Lo más valorado</p>
        <h2 className="TopRecipesSection-heading">Las 5 recetas del momento</h2>
      </header>

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
    </section>
  );
}

export default TopRecipesSection;
