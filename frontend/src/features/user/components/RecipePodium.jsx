// Podio de las recetas mejor valoradas: el 2º puesto a la izquierda, el 1º en el
// centro (elevado y destacado) y el 3º a la derecha. Cada puesto es la card de
// receta de siempre (RecipeCard) más una base con el número de puesto, así el
// bloque entero se lee como un podio.
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import { recipeToCardProps } from '../../recipe/models/recipeModel.js';
import '../styles/_recipe-podium.scss';

// Cada puesto del podio, en el orden en que se dibujan de izquierda a derecha.
// `index` es la posición en el ranking de recetas que le corresponde.
const PODIUM_PLACES = [
  { index: 1, place: 2, title: 'Segunda más valorada', modifier: 'second' },
  { index: 0, place: 1, title: 'Receta más popular', modifier: 'first' },
  { index: 2, place: 3, title: 'Tercera más valorada', modifier: 'third' },
];

// Arma el texto de la base con los datos reales de reseñas de la receta.
// Recibe las stats de una receta ({ averageRating, totalReviews }) y devuelve el
// texto a mostrar, contemplando el caso de que todavía no tenga ninguna.
const buildReviewSummary = (stats) => {
  if (!stats || stats.totalReviews === 0) {
    return 'Todavía no recibió reseñas de la comunidad';
  }
  const reviews = `${stats.totalReviews} reseña${stats.totalReviews !== 1 ? 's' : ''}`;
  return `${stats.averageRating.toFixed(1)} de promedio en ${reviews}`;
};

// Recibe: recipes (las recetas ya ordenadas de mejor a peor valoración),
// reviewStatsByRecipe ({ [idReceta]: { averageRating, totalReviews } }) y
// onEditRecipe(recipeId), que abre el wizard de edición.
function RecipePodium({ recipes, reviewStatsByRecipe, onEditRecipe }) {
  return (
    <div className="RecipePodium">
      {PODIUM_PLACES.map(({ index, place, title, modifier }) => {
        const recipe = recipes[index];
        // Con menos de 3 recetas propias, el puesto simplemente no se dibuja.
        if (!recipe) return null;

        const stats = reviewStatsByRecipe[recipe.id];

        return (
          <article key={recipe.id} className={`RecipePodium-slot RecipePodium-slot--${modifier}`}>
            <RecipeCard
              recipe={{
                ...recipeToCardProps(recipe),
                rating: stats?.averageRating ?? 0,
                reviewsCount: stats?.totalReviews ?? 0,
              }}
              onClick={() => onEditRecipe(recipe.id)}
              showSaveButton={false}
            />

            <footer className="RecipePodium-base">
              <div className="RecipePodium-baseText">
                <h4 className="RecipePodium-baseTitle">{title}</h4>
                <p className="RecipePodium-baseSubtitle">{buildReviewSummary(stats)}</p>
              </div>
              <span className="RecipePodium-basePlace">#{place}</span>
            </footer>
          </article>
        );
      })}
    </div>
  );
}

export default RecipePodium;
