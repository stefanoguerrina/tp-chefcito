// Lista de seguidores o de seguidos de un perfil (contenido de una pestaña de
// FollowListModal): cada persona lleva a su perfil.
import { Link } from 'react-router-dom';
import UserAvatar from '../../../core/components/UserAvatar.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import { useFollowList } from '../hooks/useFollowList.js';
import { FOLLOW_LISTS } from '../models/followModel.js';

// Recibe: userId del perfil, kind ('followers' | 'following') y onUserClick (se llama al
// abrir un perfil de la lista, para cerrar el modal).
function FollowList({ userId, kind, onUserClick }) {
  const { users, isLoading, error, handleRetry } = useFollowList(userId, kind);

  if (isLoading) return <LoadingState message="Cargando..." />;
  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (users.length === 0) return <p className="FollowListModal-empty">{FOLLOW_LISTS[kind].emptyMessage}</p>;

  return (
    <ul className="FollowListModal-list">
      {users.map((user) => (
        <li key={user.id}>
          <Link to={`/usuarios/${user.id}`} className="FollowListModal-user" onClick={onUserClick}>
            <UserAvatar user={user} size={40} />
            <span className="FollowListModal-userText">
              <span className="FollowListModal-userName">{user.fullName}</span>
              <span className="FollowListModal-userHandle">@{user.username}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default FollowList;
