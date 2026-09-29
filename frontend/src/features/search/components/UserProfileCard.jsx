// Card de un perfil en el listado completo de usuarios (/buscar/usuarios): foto grande,
// nombre y @usuario. Adapta a nuestro stack el diseño "Animated Profile Card" (Tailwind +
// lucide-react): SASS con los colores del tema y Material Symbols. Toda la card lleva al
// perfil.
import { Link } from 'react-router-dom';
import HighlightedText from './HighlightedText.jsx';
import '../styles/_user-profile-card.scss';

// Recibe: user ({ id, username, fullName, avatarUrl, initials }, ver toUserResult en
// searchModel) y term (lo buscado, para resaltarlo).
function UserProfileCard({ user, term }) {
  return (
    <Link to={`/usuarios/${user.id}`} className="UserProfileCard">
      {user.avatarUrl ? (
        <img className="UserProfileCard-avatar" src={user.avatarUrl} alt="" loading="lazy" />
      ) : (
        <span className="UserProfileCard-avatar UserProfileCard-avatar--initials" aria-hidden="true">
          {user.initials}
        </span>
      )}

      <div className="UserProfileCard-info">
        <h3 className="UserProfileCard-name">
          <HighlightedText text={user.fullName} term={term} />
        </h3>
        <p className="UserProfileCard-username">
          @<HighlightedText text={user.username} term={term} />
        </p>
      </div>

      {/* Parte del link (no un botón aparte): un botón dentro de un link no es HTML válido. */}
      <span className="UserProfileCard-action">
        <span className="material-symbols-outlined" aria-hidden="true">person</span>
        Ver perfil
      </span>
    </Link>
  );
}

export default UserProfileCard;
