// Tabla de usuarios del dashboard: filtro activos/inactivos, buscador, paginación y todas
// las acciones sobre un usuario sin salir de acá: alta (modal con los mismos campos que el
// registro), editar, roles, dar de baja y reactivar. Cada fila es un AdminUserRow.
// El filtro, la búsqueda y la página los maneja useAdminUsers, que pide al backend solo la
// página que se ve; esta tabla solo los muestra y abre los modales.
import { useState } from 'react';
import EditProfileModal from '../../user/components/EditProfileModal.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import AdminUserRolesModal from './AdminUserRolesModal.jsx';
import AdminCreateUserModal from './AdminCreateUserModal.jsx';
import AdminUserRow from './AdminUserRow.jsx';
import AdminTablePagination from './AdminTablePagination.jsx';
import AdminUsersTableHeader from './AdminUsersTableHeader.jsx';
import { formatRecipesCount } from '../models/adminDashboardModel.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import '../styles/_admin-users-table.scss';

// Texto del modal de baja: aclara qué pasa con las recetas del usuario, que es lo que más
// puede preocupar (no se borran, solo se ocultan hasta que se lo reactive).
// Recibe: la fila. Devuelve: el mensaje.
const buildDeleteMessage = (row) => {
  const recipesNote =
    row.recipesCount > 0
      ? ` Sus ${formatRecipesCount(row.recipesCount)} dejan de verse en la app, pero no se borran: vuelven a aparecer si lo reactivás.`
      : '';
  return `La cuenta de ${row.fullName} va a dejar de estar activa y no va a poder iniciar sesión.${recipesNote} Podés reactivarla desde la pestaña "Inactivos".`;
};

// Recibe: users (lo que devuelve useAdminUsers: filas de la página, filtro, búsqueda,
// paginación y acciones).
function AdminUsersTable({ users }) {
  const { rows, total, page, totalPages, status, searchInput, isLoading, busyUserId } = users;

  // El admin logueado no puede darse de baja a sí mismo ni cambiarse sus propios roles
  // (podría sacarse el rol de admin y quedar afuera del panel).
  const { userId: currentAdminId } = useAuthContext();

  // Si el modal de alta de usuario está abierto.
  const [isCreating, setIsCreating] = useState(false);
  // Usuario que se está editando en este momento (raw completo) o null si el modal está cerrado.
  const [editingUser, setEditingUser] = useState(null);
  // Fila cuyos roles se están gestionando en este momento, o null si el modal está cerrado.
  const [rolesTargetRow, setRolesTargetRow] = useState(null);
  // Fila pendiente de confirmar baja/reactivación, con el tipo de acción a mostrar en el modal.
  const [pendingAction, setPendingAction] = useState(null);
  // Acción que falló (con el motivo), o null si no hay ningún aviso para mostrar.
  const [actionFailure, setActionFailure] = useState(null);

  // Al confirmar el modal de baja/reactivación, dispara la acción correspondiente. Si
  // falla, se cierra el modal de confirmación y se muestra el motivo en un modal de aviso.
  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    const { type, row } = pendingAction;
    try {
      if (type === 'delete') {
        await users.handleDeleteUser(row.id);
      } else {
        await users.handleRestoreUser(row.id);
      }
    } catch (err) {
      setActionFailure({ username: row.username, message: err.message });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <section className="AdminUsersTable">
      <AdminUsersTableHeader
        status={status}
        searchInput={searchInput}
        onChangeStatus={users.handleChangeStatus}
        onSearchChange={users.handleSearchChange}
        onCreate={() => setIsCreating(true)}
      />

      {/* "Cargando" solo la primera vez: al cambiar de página o de filtro se sigue viendo
          la página anterior (atenuada) hasta que llega la nueva, sin saltos. */}
      {isLoading && rows.length === 0 && <LoadingState message="Cargando usuarios..." />}

      {!isLoading && rows.length === 0 && (
        <p className="AdminUsersTable-status">
          {searchInput ? 'No hay usuarios que coincidan con la búsqueda.' : 'No hay usuarios para este filtro.'}
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className={`AdminUsersTable-scroll${isLoading ? ' AdminUsersTable-scroll--loading' : ''}`}>
            <table className="AdminUsersTable-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Recetas publicadas</th>
                  <th className="AdminUsersTable-cell--center">Fecha de registro</th>
                  <th className="AdminUsersTable-cell--center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <AdminUserRow
                    key={row.id}
                    row={row}
                    isCurrentAdmin={row.id === currentAdminId}
                    isBusy={busyUserId === row.id}
                    onEdit={() => setEditingUser(row.raw)}
                    onManageRoles={setRolesTargetRow}
                    onDelete={() => setPendingAction({ type: 'delete', row })}
                    onRestore={() => setPendingAction({ type: 'restore', row })}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <AdminTablePagination
            summary={`Mostrando ${rows.length} de ${total} usuarios`}
            page={page}
            totalPages={totalPages}
            onChangePage={users.handleChangePage}
            isDisabled={isLoading}
          />
        </>
      )}

      {isCreating && (
        <AdminCreateUserModal onClose={() => setIsCreating(false)} onUserCreated={users.handleUserCreated} />
      )}

      {editingUser && (
        <EditProfileModal
          user={editingUser}
          canChangePassword={editingUser.id === currentAdminId}
          onClose={() => setEditingUser(null)}
          onSaved={(updatedUser) => {
            users.handleUserUpdated(updatedUser);
            setEditingUser(null);
          }}
        />
      )}

      {rolesTargetRow && (
        <AdminUserRolesModal
          user={rolesTargetRow}
          onClose={() => {
            // Se vuelve a pedir la página recién al cerrar (no en cada click de un chip):
            // evita pedidos de más mientras el admin prueba combinaciones de roles.
            users.handleUserRolesChanged();
            setRolesTargetRow(null);
          }}
        />
      )}

      {pendingAction?.type === 'delete' && (
        <ConfirmModal
          title={`Dar de baja a @${pendingAction.row.username}`}
          message={buildDeleteMessage(pendingAction.row)}
          confirmLabel="Dar de baja"
          danger
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {pendingAction?.type === 'restore' && (
        <ConfirmModal
          title={`Reactivar a @${pendingAction.row.username}`}
          message={`La cuenta de ${pendingAction.row.fullName} vuelve a quedar activa y va a poder iniciar sesión con normalidad. Sus recetas vuelven a verse en la app.`}
          confirmLabel="Reactivar"
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {actionFailure && (
        <AlertModal
          title={`No se pudo completar la acción sobre @${actionFailure.username}`}
          message={actionFailure.message}
          onClose={() => setActionFailure(null)}
        />
      )}
    </section>
  );
}

export default AdminUsersTable;
