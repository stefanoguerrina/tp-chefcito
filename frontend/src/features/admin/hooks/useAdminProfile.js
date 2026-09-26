// Hook que trae los datos completos (nombre y apellido) del admin logueado, para
// mostrarlos en el pie de la sidebar. El JWT solo trae { id, username, isAdmin }, así
// que hace falta este pedido extra para tener el nombre real de la persona.
import { useState, useEffect } from 'react';
import { getUserByIdService } from '../../user/services/getUserByIdService.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { getPersonInitials } from '../models/adminDashboardModel.js';

export const useAdminProfile = () => {
  // Arranca con el username del token como respaldo, por si el fetch todavía no resolvió
  // o llega a fallar: la sidebar nunca se queda con el pie vacío.
  const { userId, username } = useAuthContext();
  const [fullName, setFullName] = useState(username ? `@${username}` : 'Administrador');
  const [initials, setInitials] = useState(username?.[0]?.toUpperCase() ?? 'A');

  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        const user = await getUserByIdService(userId);
        if (!user) return;
        setFullName(`${user.name} ${user.lastName}`.trim());
        setInitials(getPersonInitials(user));
      } catch {
        // Si falla, se queda con el respaldo (@username) armado más arriba.
      }
    })();
  }, [userId]);

  return { fullName, initials };
};
