// Hook que arma el nombre completo, las iniciales y la foto del admin logueado, para
// mostrarlos en el pie de la sidebar. Los toma del usuario que ya comparte CurrentUserContext (el JWT
// solo trae { id, username, isAdmin }): no hace ningún pedido propio.
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { useCurrentUser } from '../../../app/CurrentUserContext.jsx';
import { getPersonInitials } from '../models/adminDashboardModel.js';
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Devuelve: { fullName, initials, avatarUrl } (avatarUrl ya con la URL completa, o null).
export const useAdminProfile = () => {
  // Mientras el usuario no llegó (o si falló), se usa el username del token como
  // respaldo: la sidebar nunca se queda con el pie vacío.
  const { username } = useAuthContext();
  const { currentUser } = useCurrentUser();

  if (!currentUser) {
    return {
      fullName: username ? `@${username}` : 'Administrador',
      initials: username?.[0]?.toUpperCase() ?? 'A',
      avatarUrl: null,
    };
  }

  return {
    fullName: `${currentUser.name} ${currentUser.lastName}`.trim(),
    initials: getPersonInitials(currentUser),
    avatarUrl: resolveImageUrl(currentUser.avatarUrl),
  };
};
