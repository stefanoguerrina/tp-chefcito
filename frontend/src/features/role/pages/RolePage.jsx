// Panel de administración de roles — listar, crear, editar y eliminar roles.
// Sigue el mismo lenguaje visual que el dashboard de administración (features/admin):
// tarjeta blanca, tabla con acciones en ícono y modales en vez de window.confirm.
// Solo accesible para admins (gate hecho en App.jsx: un admin cae directo en AdminPage).
import { useState, useEffect } from 'react';
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from '../services/roleService.js';
import RoleFormModal from '../components/RoleFormModal.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import { useDeleteConfirmation } from '../../../core/hooks/useDeleteConfirmation.js';
import { useRefreshOnReturn } from '../../../core/hooks/useRefreshOnReturn.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import { getRoleUsersCount, formatUsersCount, getDeleteBlockReason } from '../models/roleModel.js';
import '../styles/_role-page.scss';

// Recibe: isActive (opcional; AdminPage deja la sección montada aunque no se vea, y al
// volver a ella se actualiza la lista en silencio).
function RolePage({ isActive = true }) {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Modal de alta/edición: null = cerrado, 'create' o el rol que se está editando.
  const [formTarget, setFormTarget] = useState(null);
  // Al confirmar el borrado, se elimina el rol y se lo saca de la lista local. Si falla
  // (409, todavía tiene usuarios asignados), el hook muestra el motivo en un modal de aviso.
  const deletion = useDeleteConfirmation(async (role) => {
    await deleteRole(role.id);
    setRoles((prev) => prev.filter((r) => r.id !== role.id));
  });
  const { pendingDelete: pendingDeleteRole, deletingId: deletingRoleId, deleteFailure } = deletion;

  // Carga la lista de roles desde el backend (lista vacía = todavía no hay roles).
  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede
  // llamar desde el useEffect sin renders en cascada.
  const fetchRoles = () =>
    fetchListOrEmpty(() => getAllRoles())
      .then((data) => {
        setRoles(data);
        setFetchError('');
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setIsLoading(false));

  // Vuelve a pedir la lista mostrando el loading (al tocar "Reintentar" tras un error).
  const loadRoles = () => {
    setIsLoading(true);
    return fetchRoles();
  };

  useEffect(() => {
    fetchRoles();
  }, []);
  useRefreshOnReturn(isActive, fetchRoles);

  // Crea o edita un rol según qué haya en formTarget y actualiza la lista local con lo que
  // respondió el backend (sin volver a pedirla). Al editar se conserva _count, que el PATCH
  // no devuelve; un rol nuevo todavía no tiene usuarios.
  const handleSubmitForm = async (data) => {
    if (formTarget === 'create') {
      const created = await createRole(data);
      setRoles((prev) => [...prev, created]);
    } else {
      const updated = await updateRole(formTarget.id, data);
      setRoles((prev) => prev.map((role) => (role.id === updated.id ? { ...role, ...updated } : role)));
    }
    setFormTarget(null);
  };

  return (
    <section className="RolePage">
      <header className="RolePage-header">
        <div className="RolePage-titleGroup">
          <h2 className="RolePage-title">Roles registrados</h2>
          <span className="RolePage-count">
            {roles.length} rol{roles.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <div className="RolePage-actions">
          <button
            type="button"
            className="RolePage-newButton"
            onClick={() => setFormTarget('create')}
            title="Nuevo rol"
            aria-label="Nuevo rol"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      {fetchError && <ErrorState message={fetchError} onRetry={loadRoles} />}

      {isLoading && <LoadingState message="Cargando roles..." />}

      {!isLoading && !fetchError && roles.length === 0 && (
        <p className="RolePage-status">No hay roles creados todavía.</p>
      )}

      {!isLoading && roles.length > 0 && (
        <div className="RolePage-scroll">
          <table className="RolePage-table">
            <thead>
              <tr>
                <th>Rol</th>
                <th>Descripción</th>
                <th className="RolePage-cell--center">Usuarios</th>
                <th className="RolePage-cell--center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => {
                const deleteBlockReason = getDeleteBlockReason(role);
                return (
                <tr key={role.id}>
                  <td className="RolePage-roleName">{role.name}</td>
                  <td className="RolePage-roleDescription">{role.description || '—'}</td>
                  <td className="RolePage-cell--center RolePage-usersCount">
                    {formatUsersCount(getRoleUsersCount(role))}
                  </td>
                  <td className="RolePage-cell--center">
                    <div className="RolePage-rowActions">
                      <button
                        type="button"
                        className="RolePage-iconButton"
                        onClick={() => setFormTarget(role)}
                        title="Editar rol"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        type="button"
                        className="RolePage-iconButton RolePage-iconButton--danger"
                        onClick={() => deletion.requestDelete(role)}
                        disabled={deletingRoleId === role.id || deleteBlockReason !== null}
                        title={deleteBlockReason ?? 'Eliminar rol'}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {formTarget !== null && (
        <RoleFormModal
          initialData={formTarget === 'create' ? null : formTarget}
          onSubmit={handleSubmitForm}
          onCancel={() => setFormTarget(null)}
        />
      )}

      {pendingDeleteRole && (
        <ConfirmModal
          title={`Eliminar rol "${pendingDeleteRole.name}"`}
          message="Esta acción no se puede deshacer. Ningún usuario tiene este rol asignado."
          confirmLabel="Eliminar"
          danger
          onConfirm={deletion.handleConfirmDelete}
          onCancel={deletion.cancelDelete}
        />
      )}

      {deleteFailure && (
        <AlertModal
          title={`No se pudo eliminar "${deleteFailure.name}"`}
          message={deleteFailure.message}
          onClose={deletion.clearDeleteFailure}
        />
      )}
    </section>
  );
}

export default RolePage;
