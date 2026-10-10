// 2ª sección de la home: "Top 10 de la semana", las recetas mejor valoradas con las
// reseñas de los últimos 7 días (del #1 al #10). Se ocupa de la carga; el carrusel en sí
// es TopRecipesCarousel.
import { useNavigate } from 'react-router-dom';
import ErrorState from '../../../core/components/ErrorState.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import FeedSectionHeader from './FeedSectionHeader.jsx';
import FeedEmptyState from './FeedEmptyState.jsx';
import TopRecipesCarousel from './TopRecipesCarousel.jsx';
import { useSearchListing } from '../../search/hooks/useSearchListing.js';
import { getWeeklyTopRecipes } from '../services/feedService.js';
import { WEEKLY_TOP_QUERY } from '../models/feedModel.js';
import { buildSearchPagePath, SEARCH_TYPES } from '../../search/models/searchModel.js';
import '../styles/_feed-section.scss';

const TITLE = 'Top 10 de la semana';
const TITLE_ID = 'feed-weekly-top-title';

// Recibe: currentUserId, savedRecipeIds (Set) y onToggleSave(idRecipe).
function WeeklyTopSection({ currentUserId, savedRecipeIds, onToggleSave }) {
  const navigate = useNavigate();
  const { data, isLoading, error, retry } = useSearchListing(getWeeklyTopRecipes, WEEKLY_TOP_QUERY);

  // Con recetas, el carrusel arma su propio encabezado (lleva sus flechas).
  if (!isLoading && !error && data.items.length > 0) {
    return (
      <section className="FeedSection" aria-labelledby={TITLE_ID}>
        <TopRecipesCarousel
          title={TITLE}
          titleId={TITLE_ID}
          recipes={data.items}
          currentUserId={currentUserId}
          savedRecipeIds={savedRecipeIds}
          onToggleSave={onToggleSave}
          onRecipeClick={(idRecipe) => navigate(`/recetas/${idRecipe}`)}
        />
      </section>
    );
  }

  let content;
  if (isLoading) {
    content = <LoadingState message="Armando el ranking de la semana..." />;
  } else if (error) {
    content = <ErrorState message={error} onRetry={retry} />;
  } else {
    content = (
      <FeedEmptyState
        icon="emoji_events"
        title="Esta semana todavía no hay recetas valoradas"
        message="El ranking se arma con las reseñas de los últimos 7 días. ¡Reseñá las recetas que probaste para sumar!"
        actionLabel="Ver las mejor puntuadas"
        actionTo={`${buildSearchPagePath({ type: SEARCH_TYPES.recipes })}?orden=mejor-puntuadas`}
      />
    );
  }

  return (
    <section className="FeedSection" aria-labelledby={TITLE_ID}>
      <FeedSectionHeader title={TITLE} titleId={TITLE_ID} />
      {content}
    </section>
  );
}

export default WeeklyTopSection;
