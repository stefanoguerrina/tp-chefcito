// Hook que gestiona el estado y la lógica del panel de administración de usuarios.
import { useState, useEffect } from 'react';
import { searchUsersService } from '../services/searchUsersService.js';
import { deleteUserService } from '../services/deleteUserService.js';
import { restoreUserService } from '../services/restoreUserService.js';

export const useSearchUsersForm = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    // true cuando el panel está mostrando usuarios inactivos (dados de baja).
    const [showInactive, setShowInactive] = useState(false);
    // ID del usuario que está siendo eliminado en este momento (para mostrar estado de carga por fila).
    const [deletingUserId, setDeletingUserId] = useState(null);
    // ID del usuario que está siendo restaurado en este momento.
    const [restoringUserId, setRestoringUserId] = useState(null);
    // Error de la última acción (baja o reactivación): se muestra en un modal de aviso.
    const [actionError, setActionError] = useState('');

    // Solicita la lista de usuarios al backend (activos o inactivos).
    // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede
    // llamar desde el useEffect sin renders en cascada.
    const fetchUsers = (inactive) =>
        searchUsersService({ inactive })
            .then((data) => {
                setUsers(data);
                setError('');
            })
            .catch((err) => setError(err.message || 'Error al cargar la lista de usuarios.'))
            .finally(() => setIsLoading(false));

    // Recarga la lista mostrando el loading (botón "Refrescar", cambio activos/inactivos).
    const reloadUsers = (inactive) => {
        setIsLoading(true);
        return fetchUsers(inactive);
    };

    // Carga la lista de usuarios activos cuando el componente se monta.
    useEffect(() => {
        fetchUsers(false);
    }, []);

    const handleSearchChange = (event) => setSearchTerm(event.target.value);

    // Alterna entre mostrar usuarios activos e inactivos y recarga la lista correspondiente.
    const handleToggleInactive = () => {
        const nextInactive = !showInactive;
        setShowInactive(nextInactive);
        setSearchTerm('');
        reloadUsers(nextInactive);
    };

    // Envía la petición de baja lógica y elimina el usuario del estado local al completarse.
    const handleDeleteUser = async (userId) => {
        setDeletingUserId(userId);
        try {
            await deleteUserService(userId);
            // Actualización optimista: saca el usuario de la lista local sin esperar otro fetch.
            setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
        } catch (err) {
            setActionError(err.message || 'Error al dar de baja al usuario.');
        } finally {
            setDeletingUserId(null);
        }
    };

    // Envía la petición de reactivación y quita al usuario de la lista de inactivos al completarse.
    const handleRestoreUser = async (userId) => {
        setRestoringUserId(userId);
        try {
            await restoreUserService(userId);
            // Actualización optimista: saca el usuario de la lista de inactivos local.
            setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
        } catch (err) {
            setActionError(err.message || 'Error al restaurar al usuario.');
        } finally {
            setRestoringUserId(null);
        }
    };

    // Agrega el nuevo usuario al principio de la lista local cuando el admin lo crea.
    // Evita un refetch innecesario al servidor.
    const handleUserCreated = (newUser) => {
        setUsers((prevUsers) => [newUser, ...prevUsers]);
    };

    // Filtra la lista según el término de búsqueda (username, nombre, apellido o email).
    const filteredUsers = users.filter((user) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        return (
            user.username?.toLowerCase().includes(query) ||
            user.name?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query)
        );
    });

    return {
        searchTerm,
        filteredUsers,
        totalUsersCount: users.length,
        isLoading,
        error,
        showInactive,
        deletingUserId,
        restoringUserId,
        actionError,
        handleCloseActionError: () => setActionError(''),
        handleSearchChange,
        handleRefresh: () => reloadUsers(showInactive),
        handleToggleInactive,
        handleDeleteUser,
        handleRestoreUser,
        handleUserCreated
    };
};
