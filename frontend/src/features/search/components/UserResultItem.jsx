// Un usuario en los resultados de búsqueda (panel rápido y página /buscar): foto (o
// iniciales), nombre y @usuario. Todo el item lleva a su perfil.
import { Link } from 'react-router-dom';
import HighlightedText from './HighlightedText.jsx';
import '../styles/_search-result-items.scss';

// Recibe: user ({ id, username, fullName, avatarUrl, initials, recipeCount }; recipeCount
// solo viene en el listado completo y ahí se muestra), term (para resaltar),
// variant ('row' en el panel, 'card' en la página: más grande y con borde) y onNavigate
// (opcional, cierra el panel al elegirlo).
function UserResultItem({ user, term, variant = 'row', onNavigate }) {
  return (
    <Link to={`/usuarios/${user.id}`} className={`UserResultItem UserResultItem--${variant}`} onClick={onNavigate}>
      {user.avatarUrl ? (
        <img className="UserResultItem-avatar" src={user.avatarUrl} alt="" loading="lazy" />
      ) : (
        <span className="UserResultItem-avatar UserResultItem-avatar--initials" aria-hidden="true">
          {user.initials}
        </span>
      )}
      <span className="UserResultItem-text">
        <span className="UserResultItem-name">
          <HighlightedText text={user.fullName} term={term} />
        </span>
        <span className="UserResultItem-username">
          @<HighlightedText text={user.username} term={term} />
          {user.recipeCount !== null && user.recipeCount !== undefined && (
            <> · {user.recipeCount} {user.recipeCount === 1 ? 'receta' : 'recetas'}</>
          )}
        </span>
      </span>
      {/* Es parte del link (no un botón aparte): un botón dentro de un link no es HTML válido. */}
      <span className="UserResultItem-action">Ver perfil</span>
    </Link>
  );
}

export default UserResultItem;
