// 3ª sección de la home: "Reseñas de amigos", las últimas reseñas que escribieron las
// personas que sigue el usuario, en una grilla (1 columna en mobile, 2 en md y 3 en lg).
import ErrorState from '../../../core/components/ErrorState.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import FeedSectionHeader from './FeedSectionHeader.jsx';
import FeedEmptyState from './FeedEmptyState.jsx';
import FriendReviewCard from './FriendReviewCard.jsx';
import { useSearchListing } from '../../search/hooks/useSearchListing.js';
import { getFriendsReviewsFeed } from '../services/feedService.js';
import { FRIENDS_REVIEWS_QUERY } from '../models/feedModel.js';
import { buildSearchPagePath, SEARCH_TYPES } from '../../search/models/searchModel.js';
import '../styles/_feed-section.scss';
import '../styles/_friends-reviews.scss';

const PROFILES_PATH = buildSearchPagePath({ type: SEARCH_TYPES.users });

function FriendsReviewsSection() {
  const { data, isLoading, error, retry } = useSearchListing(getFriendsReviewsFeed, FRIENDS_REVIEWS_QUERY);

  let content;
  if (isLoading) {
    content = <LoadingState message="Cargando las reseñas de tus amigos..." />;
  } else if (error) {
    content = <ErrorState message={error} onRetry={retry} />;
  } else if (data.items.length === 0) {
    content = data.followingCount === 0 ? (
      <FeedEmptyState
        icon="reviews"
        title="Seguí a otros cocineros para ver sus reseñas"
        message="Acá vas a ver qué opinan de las recetas que prueban las personas que seguís."
        actionLabel="Buscar perfiles"
        actionTo={PROFILES_PATH}
      />
    ) : (
      <FeedEmptyState
        icon="rate_review"
        title="Tus amigos todavía no escribieron reseñas"
        message="Cuando las personas que seguís reseñen una receta, la vas a ver acá."
      />
    );
  } else {
    content = (
      <div className="FriendsReviews">
        {data.items.map((review) => (
          <FriendReviewCard key={review.key} review={review} />
        ))}
      </div>
    );
  }

  return (
    <section className="FeedSection" aria-labelledby="feed-friends-reviews-title">
      <FeedSectionHeader title="Reseñas de amigos" titleId="feed-friends-reviews-title" />
      {content}
    </section>
  );
}

export default FriendsReviewsSection;
