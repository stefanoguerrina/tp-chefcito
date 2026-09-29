// 1ª sección de la home: "Recetas por amigos", lo último que publicaron las personas que
// sigue el usuario. La más nueva va grande a la izquierda y las demás apiladas a la
// derecha (en mobile, una debajo de la otra).
import { useNavigate } from 'react-router-dom';
import ErrorState from '../../../core/components/ErrorState.jsx';
import FeedSectionHeader from './FeedSectionHeader.jsx';
import FeedEmptyState from './FeedEmptyState.jsx';
import FriendRecipeHighlight from './FriendRecipeHighlight.jsx';
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import { formatRelativeTime } from '../../../shared/utils/formatRelativeTime.js';
import { useSearchListing } from '../../search/hooks/useSearchListing.js';
import { getFriendsRecipesFeed } from '../services/feedService.js';
import { FRIENDS_RECIPES_QUERY } from '../models/feedModel.js';
import { buildSearchPagePath, SEARCH_TYPES } from '../../search/models/searchModel.js';
import '../styles/_feed-section.scss';
import '../styles/_friends-recipes.scss';

// Listado de perfiles del buscador: ahí se encuentra gente para seguir (botón de los
// estados vacíos).
const PROFILES_PATH = buildSearchPagePath({ type: SEARCH_TYPES.users });

// Recibe: savedRecipeIds (Set) y onToggleSave(idRecipe) (ver useSavedRecipes en HomePage).
function FriendsRecipesSection({ savedRecipeIds, onToggleSave }) {
  const navigate = useNavigate();
  const { data, isLoading, error, retry } = useSearchListing(getFriendsRecipesFeed, FRIENDS_RECIPES_QUERY);
  const handleOpen = (idRecipe) => navigate(`/recetas/${idRecipe}`);

  // Contenido según el estado de la carga: cargando, error, vacío o las recetas.
  let content;
  if (isLoading) {
    content = <p className="FeedSection-status">Cargando las recetas de tus amigos...</p>;
  } else if (error) {
    content = <ErrorState message={error} onRetry={retry} />;
  } else if (data.items.length === 0) {
    // Dos vacíos distintos: no sigue a nadie, o sigue a gente que todavía no publicó.
    content = data.followingCount === 0 ? (
      <FeedEmptyState
        icon="group_add"
        title="Todavía no seguís a nadie"
        message="Buscá cocineros y tocá “Seguir” en su perfil: sus recetas nuevas van a aparecer acá."
        actionLabel="Buscar perfiles"
        actionTo={PROFILES_PATH}
      />
    ) : (
      <FeedEmptyState
        icon="skillet"
        title="Tus amigos todavía no publicaron recetas"
        message="Cuando las personas que seguís publiquen algo, lo vas a ver primero acá."
        actionLabel="Seguir a más personas"
        actionTo={PROFILES_PATH}
      />
    );
  } else {
    const [latest, ...others] = data.items;
    content = (
      <div className={`FriendsRecipes${others.length === 0 ? ' FriendsRecipes--single' : ''}`}>
        <FriendRecipeHighlight
          recipe={latest}
          isSaved={savedRecipeIds.has(latest.id)}
          onToggleSave={() => onToggleSave(latest.id)}
          onOpen={() => handleOpen(latest.id)}
        />
        {others.length > 0 && (
          <div className="FriendsRecipes-list">
            {/* La misma RecipeCard de la vista "lista" de los listados. Nunca es una receta
                propia (solo salen las de personas que seguís), así que siempre lleva "Guardar". */}
            {others.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                horizontal
                saveButtonInCorner
                authorNote={formatRelativeTime(recipe.publishedAt)}
                onClick={() => handleOpen(recipe.id)}
                isSaved={savedRecipeIds.has(recipe.id)}
                onToggleSave={() => onToggleSave(recipe.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="FeedSection" aria-labelledby="feed-friends-recipes-title">
      {/* Solo el título: así las cards suben y la sección entra entera en la pantalla. */}
      <FeedSectionHeader title="Recetas por amigos" titleId="feed-friends-recipes-title" />
      {content}
    </section>
  );
}

export default FriendsRecipesSection;
