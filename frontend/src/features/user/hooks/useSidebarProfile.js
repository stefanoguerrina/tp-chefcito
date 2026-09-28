// Hook que trae los datos del usuario logueado (nombre, apellido, avatar) para
// mostrarlos en el pie de la sidebar. El JWT solo trae { id, username, isAdmin }, así
// que hace falta este pedido extra para tener el nombre real y la foto de la persona.
// Mismo patrón que features/admin/hooks/useAdminProfile.js, pero para la sidebar de usuario.
import { useState, useEffect } from 'react';
import { getUserByIdService } from '../services/getUserByIdService.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Evento que se dispara al guardar el perfil propio (ver ProfilePage), con el usuario
// actualizado en event.detail: así el pie de la sidebar muestra el nombre y la foto nuevos
// sin tener que recargar la página.
export const PROFILE_UPDATED_EVENT = 'chefcito:profile-updated';

// Iniciales para el avatar de respaldo (nombre + apellido, o la primera letra del
// username si todavía no llegó el nombre real).
const getInitials = (name, lastName, username) => {
  const first = name?.trim()?.[0] ?? username?.[0] ?? '?';
  const second = lastName?.trim()?.[0] ?? '';
  return `${first}${second}`.toUpperCase();
};

export const useSidebarProfile = () => {
  // Arranca con el username del token como respaldo, por si el fetch todavía no
  // resolvió o llega a fallar: la sidebar nunca se queda con el pie vacío. Sin "@"
  // acá: ese prefijo lo pone el JSX en la línea de username, que ya lo muestra aparte.
  const { userId, username } = useAuthContext();
  const [fullName, setFullName] = useState(username ?? 'Mi cuenta');
  const [initials, setInitials] = useState(username?.[0]?.toUpperCase() ?? '?');
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Copia al estado los datos del usuario que muestra el pie de la sidebar.
  const applyUser = (user) => {
    setFullName(`${user.name} ${user.lastName}`.trim());
    setInitials(getInitials(user.name, user.lastName, user.username));
    setAvatarUrl(resolveImageUrl(user.avatarUrl));
  };

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const user = await getUserByIdService(userId);
        if (user) applyUser(user);
      } catch {
        // Si falla, se queda con el respaldo (@username) armado más arriba.
      }
    })();
  }, [userId]);

  // Refleja al instante los cambios guardados desde "Editar perfil".
  useEffect(() => {
    const handleProfileUpdated = (event) => applyUser(event.detail);
    window.addEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handleProfileUpdated);
  }, []);

  return { fullName, username, initials, avatarUrl };
};
