// Hook que arma los datos del pie de la sidebar (nombre, @usuario, iniciales y foto) a
// partir del usuario logueado que ya comparte CurrentUserContext: no hace ningún pedido
// propio, y al editar el perfil se actualiza solo (lee la misma copia que el perfil).
// Mismo patrón que features/admin/hooks/useAdminProfile.js, pero para la sidebar de usuario.
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { useCurrentUser } from '../../../app/CurrentUserContext.jsx';
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Iniciales para el avatar de respaldo (nombre + apellido, o la primera letra del
// username si todavía no llegó el nombre real).
const getInitials = (name, lastName, username) => {
  const first = name?.trim()?.[0] ?? username?.[0] ?? '?';
  const second = lastName?.trim()?.[0] ?? '';
  return `${first}${second}`.toUpperCase();
};

// Devuelve: { fullName, username, initials, avatarUrl }.
export const useSidebarProfile = () => {
  // Mientras el usuario no llegó (o si falló), se usa el username del token como
  // respaldo: la sidebar nunca se queda con el pie vacío. Sin "@" acá: ese prefijo lo
  // pone el JSX en la línea de username, que ya lo muestra aparte.
  const { username } = useAuthContext();
  const { currentUser } = useCurrentUser();

  if (!currentUser) {
    return {
      fullName: username ?? 'Mi cuenta',
      username,
      initials: username?.[0]?.toUpperCase() ?? '?',
      avatarUrl: null,
    };
  }

  return {
    fullName: `${currentUser.name} ${currentUser.lastName}`.trim(),
    username,
    initials: getInitials(currentUser.name, currentUser.lastName, currentUser.username),
    avatarUrl: resolveImageUrl(currentUser.avatarUrl),
  };
};
