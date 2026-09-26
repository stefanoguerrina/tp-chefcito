// Admin panel component for searching, displaying, and managing registered users.
// Includes the full user CRUD: list, search, create (via CreateUserForm), delete and restore.
import { useState } from 'react';
import { useSearchUsersForm } from '../hooks/useSearchUsersForm.js';
import CreateUserForm from './CreateUserForm.jsx';
import UserRolesPanel from '../../role/components/UserRolesPanel.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import '../styles/_admin-panel.scss';

// Formatea una fecha ISO (YYYY-MM-DD o DateTime) a formato legible DD/MM/AAAA.
const formatDate = (dateValue) => {
    if (!dateValue) return null;
    const datePart = String(dateValue).slice(0, 10);
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
};

const SearchUsersForm = () => {
    const {
        searchTerm,
        filteredUsers,
        totalUsersCount,
        isLoading,
        error,
        showInactive,
        deletingUserId,
        restoringUserId,
        actionError,
        handleCloseActionError,
        handleSearchChange,
        handleRefresh,
        handleToggleInactive,
        handleDeleteUser,
        handleRestoreUser,
        handleUserCreated
    } = useSearchUsersForm();

    // Controla si se muestra el formulario de alta de usuario.
    const [showCreateForm, setShowCreateForm] = useState(false);

    // ID del usuario cuyo panel de roles está expandido (null = ninguno).
    const [expandedRolesUserId, setExpandedRolesUserId] = useState(null);
    const handleToggleRoles = (userId) => {
        setExpandedRolesUserId((prev) => (prev === userId ? null : userId));
    };

    // Acción pendiente de confirmar en el modal: { user, action: 'delete' | 'restore' } o null.
    const [pendingAction, setPendingAction] = useState(null);

    // Pide confirmación antes de dar de baja — evita bajas accidentales.
    const handleDeleteClick = (user) => setPendingAction({ user, action: 'delete' });

    // Pide confirmación antes de reactivar.
    const handleRestoreClick = (user) => setPendingAction({ user, action: 'restore' });

    // Ejecuta la acción que se confirmó en el modal.
    const handleConfirmPendingAction = () => {
        const { user, action } = pendingAction;
        setPendingAction(null);
        if (action === 'delete') {
            handleDeleteUser(user.id);
        } else {
            handleRestoreUser(user.id);
        }
    };

    // Al crear un usuario exitosamente, cierra el formulario y actualiza la lista.
    const handleUserCreatedAndClose = (newUser) => {
        handleUserCreated(newUser);
        setShowCreateForm(false);
    };

    return (
        <div className="admin-panel">
            <div className="admin-panel__header">
                <h2 className="admin-panel__title">Panel de Administración — Usuarios</h2>
                <span className="admin-panel__count">
                    {totalUsersCount} usuario{totalUsersCount !== 1 ? 's' : ''} {showInactive ? 'inactivo' : 'registrado'}{totalUsersCount !== 1 ? 's' : ''}
                </span>
            </div>

            <div className="admin-panel__controls">
                <input
                    className="admin-panel__search"
                    type="text"
                    placeholder="Buscar por usuario, nombre o email..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    id="adminUserSearch"
                />
                <button
                    className="admin-panel__btn admin-panel__btn--refresh"
                    onClick={handleRefresh}
                    disabled={isLoading}
                >
                    {isLoading ? 'Cargando...' : '↻ Refrescar'}
                </button>
                {/* Toggle entre activos e inactivos */}
                <button
                    className={`admin-panel__btn ${showInactive ? 'admin-panel__btn--toggle-active' : 'admin-panel__btn--toggle-inactive'}`}
                    onClick={handleToggleInactive}
                    disabled={isLoading}
                    id="toggleInactiveUsers"
                >
                    {showInactive ? '✓ Ver activos' : '☁ Ver inactivos'}
                </button>
                {/* Solo mostrar el botón de nuevo usuario cuando estamos en la vista de activos */}
                {!showInactive && (
                    <button
                        className="admin-panel__btn admin-panel__btn--new"
                        onClick={() => setShowCreateForm((prev) => !prev)}
                        id="toggleCreateUserForm"
                    >
                        {showCreateForm ? '✕ Cancelar' : '+ Nuevo usuario'}
                    </button>
                )}
            </div>

            {/* Formulario de alta de usuario (desplegable) */}
            {showCreateForm && !showInactive && (
                <CreateUserForm
                    onUserCreated={handleUserCreatedAndClose}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            {/* Error al cargar la lista */}
            {error && <ErrorState message={error} onRetry={handleRefresh} />}

            {pendingAction && (
                <ConfirmModal
                    title={pendingAction.action === 'delete' ? 'Dar de baja usuario' : 'Reactivar usuario'}
                    message={
                        pendingAction.action === 'delete'
                            ? `¿Querés dar de baja a "@${pendingAction.user.username}" (${pendingAction.user.name} ${pendingAction.user.lastName})? Podés reactivarlo después desde "Ver inactivos".`
                            : `¿Querés reactivar la cuenta de "@${pendingAction.user.username}" (${pendingAction.user.name} ${pendingAction.user.lastName})?`
                    }
                    confirmLabel={pendingAction.action === 'delete' ? 'Dar de baja' : 'Reactivar'}
                    danger={pendingAction.action === 'delete'}
                    onConfirm={handleConfirmPendingAction}
                    onCancel={() => setPendingAction(null)}
                />
            )}

            {actionError && (
                <AlertModal
                    title="No se pudo completar la acción"
                    message={actionError}
                    onClose={handleCloseActionError}
                />
            )}

            {isLoading && (
                <p className="admin-panel__loading">Cargando usuarios desde el servidor...</p>
            )}

            {!isLoading && !error && filteredUsers.length === 0 && (
                <p className="admin-panel__empty">
                    {showInactive
                        ? 'No hay usuarios inactivos.'
                        : 'No se encontraron usuarios.'}
                </p>
            )}

            {!isLoading && filteredUsers.length > 0 && (
                <ul className="admin-panel__list">
                    {filteredUsers.map((user) => (
                        <li key={user.id} className={`admin-panel__item ${showInactive ? 'admin-panel__item--inactive' : ''}`}>
                            <div className="admin-panel__item-info">
                                <span className="admin-panel__item-username">@{user.username}</span>
                                <span className="admin-panel__item-fullname">
                                    {user.name} {user.lastName}
                                </span>
                                <span className="admin-panel__item-email">📧 {user.email}</span>
                                {user.phone && (
                                    <span className="admin-panel__item-phone">📞 {user.phone}</span>
                                )}
                                {user.birthDate && (
                                    <span className="admin-panel__item-birthdate">
                                        🎂 {formatDate(user.birthDate)}
                                    </span>
                                )}
                                {showInactive && user.deletedAt && (
                                    <span className="admin-panel__item-deleted-at">
                                        🗑 Baja: {formatDate(user.deletedAt)}
                                    </span>
                                )}
                                <span className="admin-panel__item-id">ID: {user.id}</span>
                            </div>

                            <div className="admin-panel__item-actions admin-panel__item-actions--group">
                                {showInactive ? (
                                    // Vista inactivos: botón para restaurar
                                    <button
                                        className="admin-panel__btn admin-panel__btn--restore"
                                        onClick={() => handleRestoreClick(user)}
                                        disabled={restoringUserId === user.id}
                                    >
                                        {restoringUserId === user.id ? 'Restaurando...' : '↺ Restaurar'}
                                    </button>
                                ) : (
                                    <>
                                        {/* Gestión de roles: solo tiene sentido para usuarios activos */}
                                        <button
                                            type="button"
                                            className="admin-panel__btn admin-panel__btn--edit"
                                            onClick={() => handleToggleRoles(user.id)}
                                        >
                                            {expandedRolesUserId === user.id ? 'Ocultar roles' : 'Roles'}
                                        </button>
                                        <button
                                            className="admin-panel__btn admin-panel__btn--delete"
                                            onClick={() => handleDeleteClick(user)}
                                            disabled={deletingUserId === user.id}
                                        >
                                            {deletingUserId === user.id ? 'Eliminando...' : 'Eliminar'}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Panel expandible de roles del usuario */}
                            {!showInactive && expandedRolesUserId === user.id && (
                                <UserRolesPanel userId={user.id} username={user.username} />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchUsersForm;
