// Hook de la tabla de usuarios del dashboard. La tabla está paginada en el backend: solo
// se pide la página que se ve (6 usuarios), con el filtro de estado y la búsqueda en el
// mismo pedido, en vez de traer a todos los usuarios activos e inactivos juntos. Cada
// cambio de filtro, búsqueda o página pide solo esa página.
import { useState, useEffect, useMemo } from 'react';
import { getAdminUsers } from '../services/adminService.js';
import { deleteUserService } from '../../user/services/deleteUserService.js';
import { restoreUserService } from '../../user/services/restoreUserService.js';
import { toUserRow } from '../models/adminDashboardModel.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { useCurrentUser } from '../../../app/CurrentUserContext.jsx';

// Espera después de la última tecla antes de buscar: así no sale un pedido por cada letra.
const SEARCH_DELAY_MS = 350;

const EMPTY_PAGE = { users: [], total: 0, page: 1, totalPages: 1 };

// Recibe: onUsersChanged (opcional, se llama después de dar de alta, de baja o reactivar
// a alguien: el dashboard lo usa para actualizar sus cifras).
export const useAdminUsers = ({ onUsersChanged } = {}) => {
  const { userId: currentUserId } = useAuthContext();
  const { updateCurrentUser } = useCurrentUser();

  const [status, setStatus] = useState('all');
  // Lo que se escribe en el buscador y lo que efectivamente se busca (con demora).
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  // Cambia para volver a pedir la página actual (después de una acción sobre un usuario).
  const [reloadCount, setReloadCount] = useState(0);

  const [pageData, setPageData] = useState(EMPTY_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // Usuario sobre el que hay una acción en curso (dar de baja / reactivar).
  const [busyUserId, setBusyUserId] = useState(null);

  // Pide la página cada vez que cambia algo de lo que la define. isCurrent evita que una
  // respuesta vieja (ej. de una búsqueda anterior que tardó más) pise a la más nueva.
  useEffect(() => {
    let isCurrent = true;
    getAdminUsers({ status, query, page })
      .then((result) => {
        if (!isCurrent) return;
        setPageData(result);
        setError('');
        // Si la página ya no existía (ej. se dio de baja al último de la última), el
        // backend devolvió la última que hay: se sincroniza el número.
        if (result.page !== page) setPage(result.page);
      })
      .catch((err) => isCurrent && setError(err.message || 'No pudimos cargar los usuarios.'))
      .finally(() => isCurrent && setIsLoading(false));
    return () => {
      isCurrent = false;
    };
  }, [status, query, page, reloadCount]);

  // Busca recién cuando se deja de escribir por un momento, y vuelve a la página 1.
  useEffect(() => {
    const timer = setTimeout(() => {
      const nextQuery = searchInput.trim();
      if (nextQuery === query) return;
      setIsLoading(true);
      setQuery(nextQuery);
      setPage(1);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchInput, query]);

  const rows = useMemo(() => pageData.users.map(toUserRow), [pageData.users]);

  const reloadPage = () => {
    setIsLoading(true);
    setReloadCount((count) => count + 1);
  };

  const handleChangeStatus = (nextStatus) => {
    if (nextStatus === status) return;
    setIsLoading(true);
    setStatus(nextStatus);
    setPage(1);
  };

  const handleChangePage = (nextPage) => {
    setIsLoading(true);
    setPage(nextPage);
  };

  // Un usuario nuevo queda primero en "Todos" (el listado ordena los más nuevos arriba):
  // se vuelve a esa vista, sin búsqueda, para que el admin lo vea al cerrar el modal.
  const handleUserCreated = () => {
    setSearchInput('');
    setQuery('');
    setStatus('all');
    setPage(1);
    reloadPage();
    onUsersChanged?.();
  };

  // Da de baja (baja lógica) o reactiva a un usuario y vuelve a pedir la página actual.
  // Si falla, se relanza para que la tabla muestre el motivo en un modal.
  const runUserAction = async (userId, action) => {
    setBusyUserId(userId);
    try {
      await action(userId);
      reloadPage();
      onUsersChanged?.();
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = (userId) => runUserAction(userId, deleteUserService);
  const handleRestoreUser = (userId) => runUserAction(userId, restoreUserService);

  // El modal de edición ya hizo el PATCH: acá solo se refleja en la fila (sin volver a
  // pedir la página), conservando lo que el PATCH no devuelve (roles, recetas, valoraciones).
  const handleUserUpdated = (updatedUser) => {
    setPageData((prev) => ({
      ...prev,
      users: prev.users.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user)),
    }));
    // Si el admin se editó a sí mismo, el pie de su sidebar también muestra el cambio.
    if (updatedUser.id === currentUserId) updateCurrentUser(updatedUser);
  };

  return {
    rows,
    total: pageData.total,
    page: pageData.page,
    totalPages: pageData.totalPages,
    status,
    searchInput,
    isLoading,
    error,
    busyUserId,
    handleChangeStatus,
    handleSearchChange: (event) => setSearchInput(event.target.value),
    handleChangePage,
    handleRetry: reloadPage,
    handleUserCreated,
    handleDeleteUser,
    handleRestoreUser,
    handleUserUpdated,
    // Al cerrar el modal de roles, se vuelve a pedir la página: trae los roles al día.
    handleUserRolesChanged: reloadPage,
  };
};
