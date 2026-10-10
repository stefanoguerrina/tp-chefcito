// Hook que carga una de las listas de un perfil (seguidores o seguidos), con sus estados
// de carga y error. Se monta una vez por pestaña (ver FollowListModal), así cada pestaña
// arranca cargando.
import { useState, useEffect } from 'react';
import { getFollowList } from '../services/followService.js';

// Recibe: userId del perfil y kind ('followers' | 'following').
// Devuelve: { users, isLoading, error, handleRetry }.
export const useFollowList = (userId, kind) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede llamar
  // desde el useEffect sin renders en cascada.
  const loadUsers = () =>
    getFollowList(userId, kind)
      .then((data) => {
        setUsers(data);
        setError('');
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, kind]);

  const handleRetry = () => {
    setIsLoading(true);
    loadUsers();
  };

  return { users, isLoading, error, handleRetry };
};
