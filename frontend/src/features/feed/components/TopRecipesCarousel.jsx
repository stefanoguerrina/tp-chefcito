// Carrusel del Top 10 de la semana: del #1 al #10 de izquierda a derecha. Cada receta es
// la RecipeCard de siempre con su puesto y valoración encima de la foto (RatingBadge, como
// en las recetas destacadas del perfil); el #1 va resaltado igual que la mejor del perfil.
// Se desplaza arrastrando o con las flechas del encabezado (useDragScroll).
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import RatingBadge from '../../../core/components/RatingBadge.jsx';
import FeedSectionHeader from './FeedSectionHeader.jsx';
import { useDragScroll } from '../../../core/hooks/useDragScroll.js';
import '../styles/_top-recipes-carousel.scss';

// Recibe: title y titleId (del encabezado), recipes (ver createWeeklyTop),
// currentUserId (sus recetas no llevan "Guardar"), savedRecipeIds (Set), onToggleSave(id)
// y onRecipeClick(id).
function TopRecipesCarousel({
  title, titleId, recipes, currentUserId, savedRecipeIds, onToggleSave, onRecipeClick,
}) {
  const { trackRef, trackHandlers, isDragging, canScrollPrev, canScrollNext, scrollByPage } = useDragScroll();

  return (
    <>
      <FeedSectionHeader title={title} titleId={titleId}>
        <button
          type="button"
          className="TopRecipesCarousel-arrow"
          onClick={() => scrollByPage(-1)}
          disabled={!canScrollPrev}
          aria-label="Recetas anteriores"
        >
          <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
        </button>
        <button
          type="button"
          className="TopRecipesCarousel-arrow"
          onClick={() => scrollByPage(1)}
          disabled={!canScrollNext}
          aria-label="Recetas siguientes"
        >
          <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
        </button>
      </FeedSectionHeader>

      <div className="TopRecipesCarousel">
        <ol
          ref={trackRef}
          className={`TopRecipesCarousel-track${isDragging ? ' TopRecipesCarousel-track--dragging' : ''}`}
          {...trackHandlers}
        >
          {recipes.map((recipe) => {
            const isFirst = recipe.rank === 1;
            return (
              <li key={recipe.id} className={`TopRecipesCarousel-item${isFirst ? ' TopRecipesCarousel-item--first' : ''}`}>
                <RatingBadge
                  className="TopRecipesCarousel-badge"
                  rank={recipe.rank}
                  rating={recipe.rating}
                  reviewsCount={recipe.reviewsCount}
                  isHighlighted={isFirst}
                />
                <RecipeCard
                  recipe={recipe}
                  onClick={() => onRecipeClick(recipe.id)}
                  showSaveButton={recipe.authorId !== currentUserId}
                  isSaved={savedRecipeIds.has(recipe.id)}
                  onToggleSave={() => onToggleSave(recipe.id)}
                  // La valoración ya va arriba de la foto: el pie queda con autor y tiempo.
                  showRating={false}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}

export default TopRecipesCarousel;
