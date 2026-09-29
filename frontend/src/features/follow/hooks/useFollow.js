// Hook del botón "Seguir" de un perfil: carga si el usuario logueado ya lo sigue (y sus
// contadores de seguidores y seguidos) y permite seguirlo o dejar de seguirlo.
import { useState, useEffect } from 'react';
import { getFollowStatus, followUser, unfollowUser } from '../services/followService.js';

// Recibe: userId del perfil que se está mirando.
// Devuelve: followStatus ({ isFollowing, followersCount, followingCount } o null mientras
// carga o si falló), isFollowPending (hay un pedido en curso), handleToggleFollow,
// followError (mensaje de la última acción que falló, para un AlertModal) y clearFollowError.
export const useFollow = (userId) => {
  const [loadedStatus, setLoadedStatus] = useState(null);
  const [isFollowPending, setIsFollowPending] = useState(false);
  const [followError, setFollowError] = useState('');

  // Si falla la carga, el perfil se muestra igual, solo que sin los contadores.
  useEffect(() => {
    getFollowStatus(userId)
      .then(setLoadedStatus)
      .catch(() => setLoadedStatus(null));
  }, [userId]);

  // Al pasar de un perfil a otro, el estado del anterior no sirve: hasta que llegue el
  // nuevo se trata como "cargando" (null), así el botón no muestra "Siguiendo" de más.
  const followStatus = loadedStatus?.userId === userId ? loadedStatus : null;

  // Sigue o deja de seguir según el estado actual. No es optimista: espera al backend,
  // que devuelve el estado nuevo con los contadores ya actualizados.
  const handleToggleFollow = () => {
    if (!followStatus || isFollowPending) return;
    setIsFollowPending(true);
    const request = followStatus.isFollowing ? unfollowUser(userId) : followUser(userId);
    request
      .then(setLoadedStatus)
      .catch((err) => setFollowError(err.message))
      .finally(() => setIsFollowPending(false));
  };

  return {
    followStatus,
    isFollowPending,
    handleToggleFollow,
    followError,
    clearFollowError: () => setFollowError(''),
  };
};
