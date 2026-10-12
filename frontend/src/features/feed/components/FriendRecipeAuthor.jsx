// Quién publicó una receta de la home y hace cuánto: foto, nombre y "· hace 2 horas".
// Lo comparten la card destacada y las compactas de "Recetas por amigos".
import UserAvatar from '../../../core/components/UserAvatar.jsx';
import { formatRelativeTime } from '../../../shared/utils/formatRelativeTime.js';

// Recibe: creator ({ fullName, avatarUrl, ... }, ver feedModel), publishedAt (fecha ISO) y
// avatarSize (en píxeles).
function FriendRecipeAuthor({ creator, publishedAt, avatarSize = 36 }) {
  return (
    <div className="FriendRecipeAuthor">
      <UserAvatar user={creator} size={avatarSize} />
      <span className="FriendRecipeAuthor-name">{creator.fullName}</span>
      {publishedAt && <span className="FriendRecipeAuthor-time">· {formatRelativeTime(publishedAt)}</span>}
    </div>
  );
}

export default FriendRecipeAuthor;
