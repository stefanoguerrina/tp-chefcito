// Las 3 recetas mejor valoradas del perfil, en abanico: la 1ª al centro (más grande y al
// frente) y la 2ª y 3ª a los costados, inclinadas. Cada una es la RecipeCard de siempre
// con su valoración encima de la foto.
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import RatingBadge from '../../../core/components/RatingBadge.jsx';
import { recipeToCardProps } from '../../recipe/models/recipeModel.js';
import '../styles/_featured-recipes.scss';

// Lugares del abanico, en el orden en que se dibujan de izquierda a derecha.
// index = posición de la receta en el ranking (0 = la mejor valorada).
const FAN_PLACES = [
  { index: 1, position: 'left' },
  { index: 0, position: 'center' },
  { index: 2, position: 'right' },
];

// Recibe: recipes (ya ordenadas de mejor a peor valoración, hasta 3),
// reviewStatsByRecipe ({ [idReceta]: { averageRating, totalReviews } }) y
// onRecipeClick(recipeId) y getRecipeHoverActions(recipeId) (opcional: los botones que
// aparecen sobre la foto al pasar el mouse, en el perfil propio).
function FeaturedRecipes({ recipes, reviewStatsByRecipe, onRecipeClick, getRecipeHoverActions }) {
  return (
    <div className="FeaturedRecipes">
      <h3 className="FeaturedRecipes-title">Recetas destacadas</h3>

      <div className="FeaturedRecipes-stage">
        {FAN_PLACES.map(({ index, position }) => {
          const recipe = recipes[index];
          // Con menos de 3 recetas, ese lugar del abanico no se dibuja.
          if (!recipe) return null;

          // Sin reseñas todavía, se muestra igual: "0.0 (0)".
          const averageRating = reviewStatsByRecipe[recipe.id]?.averageRating ?? 0;
          const totalReviews = reviewStatsByRecipe[recipe.id]?.totalReviews ?? 0;

          return (
            <div key={recipe.id} className={`FeaturedRecipes-item FeaturedRecipes-item--${position}`}>
              <RatingBadge
                className="FeaturedRecipes-rating"
                rating={averageRating}
                reviewsCount={totalReviews}
                isHighlighted={position === 'center'}
              />

              <RecipeCard
                recipe={recipeToCardProps(recipe)}
                onClick={() => onRecipeClick(recipe.id)}
                hoverActions={getRecipeHoverActions?.(recipe.id)}
                showSaveButton={false}
                // Solo foto, nombre y bajada: la valoración ya va arriba de la foto.
                showAuthor={false}
                showRating={false}
                showTime={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FeaturedRecipes;
