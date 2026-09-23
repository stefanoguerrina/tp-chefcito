// Tabla resumen de usuarios del dashboard: rol, recetas publicadas (con sus valoraciones)
// y fecha de registro, con acciones directas de editar / dar de baja / reactivar (sin
// tener que ir a la sección "Usuarios" para eso). El alta de un usuario nuevo sigue
// yendo a esa sección, porque necesita el formulario completo (CreateUserForm).
import { useState } from 'react';
import EditProfileModal from '../../user/components/EditProfileModal.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import AdminUserRolesModal from './AdminUserRolesModal.jsx';
import { formatRecipesCount, formatReviewsCount } from '../models/adminDashboardModel.js';
import { getCurrentUserId } from '../../../shared/utils/decodeToken.js';
import '../styles/_admin-users-table.scss';

// Filtros del control segmentado, con la condición que aplica cada uno y el título que
// toma la tabla mientras ese filtro está activo (ej: "Usuarios Activos").
const FILTERS = [
  { id: 'all', label: 'Todos', title: 'Usuarios Registrados', matches: () => true },
  { id: 'active', label: 'Activos', title: 'Usuarios Activos', matches: (row) => row.isActive },
  { id: 'inactive', label: 'Inactivos', title: 'Usuarios Inactivos', matches: (row) => !row.isActive },
];

const ROWS_PER_PAGE = 6;

// Formatea una fecha ISO (YYYY-MM-DD o DateTime) a formato legible DD/MM/AAAA.
// Misma lógica que ya usa SearchUsersForm para "Fecha de alta" en el panel de usuarios.
const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  const datePart = String(dateValue).slice(0, 10);
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

// Filtra las filas por nombre completo o @usuario (búsqueda case-insensitive, mismo
// criterio simple que el resto de los buscadores del panel, ej. AdminIngredientsTable).
const filterRowsByQuery = (rows, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return rows;
  return rows.filter(
    (row) => row.fullName?.toLowerCase().includes(normalized) || row.username?.toLowerCase().includes(normalized)
  );
};

function AdminUsersTable({
  rows,
  isLoading,
  busyUserId,
  onManageUsers,
  onDeleteUser,
  onRestoreUser,
  onUserUpdated,
  onUserRolesChanged,
}) {
  const [activeFilterId, setActiveFilterId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // El admin logueado no puede darse de baja a sí mismo ni cambiarse sus propios roles
  // (podría sacarse el rol de admin y quedar afuera del panel). Se compara contra esto
  // para deshabilitar su propia fila en esas dos acciones.
  const currentAdminId = getCurrentUserId();

  // Usuario que se está editando en este momento (raw completo) o null si el modal está cerrado.
  const [editingUser, setEditingUser] = useState(null);
  // Fila cuyos roles se están gestionando en este momento, o null si el modal está cerrado.
  const [rolesTargetRow, setRolesTargetRow] = useState(null);
  // Fila pendiente de confirmar baja/reactivación, con el tipo de acción a mostrar en el modal.
  const [pendingAction, setPendingAction] = useState(null);
  // Acción que falló (con el motivo), o null si no hay ningún aviso para mostrar. Se
  // muestra en un modal aparte en vez de un banner que queda pegado en pantalla.
  const [actionFailure, setActionFailure] = useState(null);

  const activeFilter = FILTERS.find((filter) => filter.id === activeFilterId);
  const filteredRows = filterRowsByQuery(rows.filter(activeFilter.matches), searchQuery);

  // Se calcula sobre las filas ya filtradas: cambiar de filtro o buscar cambia el total de páginas.
  const totalPages = Math.max(Math.ceil(filteredRows.length / ROWS_PER_PAGE), 1);
  const pageRows = filteredRows.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  // Al cambiar de filtro se vuelve a la primera página: si no, se podía quedar en una
  // página que ya no existe para el nuevo conjunto de filas.
  const handleChangeFilter = (filterId) => {
    setActiveFilterId(filterId);
    setCurrentPage(1);
  };

  // Igual que al cambiar de filtro: buscar cambia qué filas entran, así que se vuelve a
  // la primera página.
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => setCurrentPage((page) => Math.max(page - 1, 1));
  const handleNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));

  // Al confirmar el modal de baja/reactivación, dispara la acción correspondiente. Si
  // falla, se cierra el modal de confirmación y se muestra el motivo en un modal de
  // aviso aparte, en vez de dejar un banner pegado en pantalla.
  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    const { type, row } = pendingAction;
    try {
      if (type === 'delete') {
        await onDeleteUser(row.id);
      } else {
        await onRestoreUser(row.id);
      }
    } catch (err) {
      setActionFailure({ username: row.username, message: err.message });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <section className="AdminUsersTable">
      <header className="AdminUsersTable-header">
        <h2 className="AdminUsersTable-title">{activeFilter.title}</h2>

        <div className="AdminUsersTable-actions">
          <div className="AdminUsersTable-tabs">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`AdminUsersTable-tab${activeFilterId === filter.id ? ' AdminUsersTable-tab--active' : ''}`}
                onClick={() => handleChangeFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="AdminUsersTable-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar usuario..."
            />
          </div>

          <button
            type="button"
            className="AdminUsersTable-newButton"
            onClick={onManageUsers}
            title="Alta de usuario"
            aria-label="Alta de usuario"
          >
            <span className="material-symbols-outlined">person_add</span>
          </button>
        </div>
      </header>

      {isLoading && <p className="AdminUsersTable-status">Cargando usuarios...</p>}

      {!isLoading && filteredRows.length === 0 && (
        <p className="AdminUsersTable-status">
          {searchQuery ? 'No hay usuarios que coincidan con la búsqueda.' : 'No hay usuarios para este filtro.'}
        </p>
      )}

      {!isLoading && filteredRows.length > 0 && (
        <>
          <div className="AdminUsersTable-scroll">
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
                {pageRows.map((row) => (
                  <tr key={row.id} className={row.isActive ? '' : 'AdminUsersTable-row--inactive'}>
                    <td>
                      <div className="AdminUsersTable-user">
                        <span className="AdminUsersTable-avatar">{row.initials}</span>
                        <span className="AdminUsersTable-userText">
                          <span className="AdminUsersTable-userName">{row.fullName}</span>
                          <span className="AdminUsersTable-userMeta">
                            @{row.username} · ID {row.id}
                            {!row.isActive && ' · Dado de baja'}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="AdminUsersTable-role">{row.roleLabel}</td>
                    <td>
                      <div className="AdminUsersTable-recipes">{formatRecipesCount(row.recipesCount)}</div>
                      <div className="AdminUsersTable-reviews">
                        {row.reviewStats.count > 0 ? (
                          <>
                            <span
                              className="material-symbols-outlined AdminUsersTable-starIcon"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                            {row.reviewStats.average}
                            <span className="AdminUsersTable-reviewsCount">
                              ({formatReviewsCount(row.reviewStats.count)})
                            </span>
                          </>
                        ) : (
                          'Sin valoraciones aún'
                        )}
                      </div>
                    </td>
                    <td className="AdminUsersTable-date AdminUsersTable-cell--center">{formatDate(row.createdAt)}</td>
                    <td className="AdminUsersTable-cell--center">
                      <div className="AdminUsersTable-rowActions">
                        <button
                          type="button"
                          className="AdminUsersTable-iconButton"
                          onClick={() => setEditingUser(row.raw)}
                          title="Editar usuario"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>

                        <button
                          type="button"
                          className="AdminUsersTable-iconButton"
                          onClick={() => setRolesTargetRow(row)}
                          disabled={row.id === currentAdminId}
                          title={row.id === currentAdminId ? 'No podés modificar tus propios roles' : 'Roles'}
                        >
                          <span className="material-symbols-outlined">shield_person</span>
                        </button>

                        {row.isActive ? (
                          <button
                            type="button"
                            className="AdminUsersTable-iconButton AdminUsersTable-iconButton--danger"
                            onClick={() => setPendingAction({ type: 'delete', row })}
                            disabled={busyUserId === row.id || row.id === currentAdminId}
                            title={row.id === currentAdminId ? 'No podés dar de baja tu propia cuenta' : 'Dar de baja'}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="AdminUsersTable-iconButton AdminUsersTable-iconButton--restore"
                            onClick={() => setPendingAction({ type: 'restore', row })}
                            disabled={busyUserId === row.id}
                            title="Reactivar"
                          >
                            <span className="material-symbols-outlined">restore_from_trash</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="AdminUsersTable-footer">
            <span>
              Mostrando {pageRows.length} de {filteredRows.length} usuarios
            </span>

            <div className="AdminUsersTable-pagination">
              <button
                type="button"
                className="AdminUsersTable-pageButton"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                title="Página anterior"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="AdminUsersTable-pageIndicator">
                Página {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                className="AdminUsersTable-pageButton"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                title="Página siguiente"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </footer>
        </>
      )}

      {editingUser && (
        <EditProfileModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={(updatedUser) => {
            onUserUpdated(updatedUser);
            setEditingUser(null);
          }}
        />
      )}

      {rolesTargetRow && (
        <AdminUserRolesModal
          user={rolesTargetRow}
          onClose={() => {
            // Se pide el rol actualizado de este usuario recién al cerrar (no en cada
            // click de un chip): evita refrescos de más mientras el admin todavía está
            // probando distintas combinaciones de roles dentro del modal.
            onUserRolesChanged(rolesTargetRow.id);
            setRolesTargetRow(null);
          }}
        />
      )}

      {pendingAction?.type === 'delete' && (
        <ConfirmModal
          title={`Dar de baja a @${pendingAction.row.username}`}
          message={`La cuenta de ${pendingAction.row.fullName} va a dejar de estar activa y no va a poder iniciar sesión. Es una baja lógica: podés reactivarla después desde la pestaña "Inactivos".`}
          confirmLabel="Dar de baja"
          danger
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {pendingAction?.type === 'restore' && (
        <ConfirmModal
          title={`Reactivar a @${pendingAction.row.username}`}
          message={`La cuenta de ${pendingAction.row.fullName} vuelve a quedar activa y va a poder iniciar sesión con normalidad.`}
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
