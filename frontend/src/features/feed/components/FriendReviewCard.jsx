// Una reseña de un amigo en la home: quién la escribió (lleva a su perfil) y hace cuánto,
// la receta reseñada (lleva a la receta), las estrellas y el comentario.
import { Link } from 'react-router-dom';
import UserAvatar from '../../../core/components/UserAvatar.jsx';
import RatingStars from '../../../core/components/RatingStars.jsx';
import { formatRelativeTime } from '../../../shared/utils/formatRelativeTime.js';

// Recibe: review (ver toFriendReview en feedModel).
function FriendReviewCard({ review }) {
  const { author, recipe } = review;

  return (
    <article className="FriendReviewCard">
      <header className="FriendReviewCard-header">
        <Link className="FriendReviewCard-author" to={`/usuarios/${author.id}`}>
          <UserAvatar user={author} size={36} />
          <span className="FriendReviewCard-authorText">
            <span className="FriendReviewCard-name">{author.fullName}</span>
            <span className="FriendReviewCard-username">@{author.username}</span>
          </span>
        </Link>
        <span className="FriendReviewCard-time">{formatRelativeTime(review.createdAt)}</span>
      </header>

      <Link className="FriendReviewCard-recipe" to={`/recetas/${recipe.id}`}>
        <img className="FriendReviewCard-recipeImage" src={recipe.image} alt="" loading="lazy" />
        <span className="FriendReviewCard-recipeText">
          <span className="FriendReviewCard-recipeLabel">Reseñó:</span>
          <span className="FriendReviewCard-recipeName">{recipe.name}</span>
        </span>
        <span className="FriendReviewCard-recipeArrow material-symbols-outlined" aria-hidden="true">chevron_right</span>
      </Link>

      <div className="FriendReviewCard-rating">
        <RatingStars rating={review.rating} />
        <span>{review.rating.toFixed(1)}</span>
      </div>

      {review.comment && <p className="FriendReviewCard-comment">“{review.comment}”</p>}
    </article>
  );
}

export default FriendReviewCard;
