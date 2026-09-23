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
import '../styles/_role-page.scss';

function RolePage() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Modal de alta/edición: null = cerrado, 'create' o el rol que se está editando.
  const [formTarget, setFormTarget] = useState(null);
  // Rol pendiente de confirmar eliminación, o null si el modal está cerrado.
  const [pendingDeleteRole, setPendingDeleteRole] = useState(null);
  // Rol cuya eliminación falló (con el motivo), o null si no hay ningún aviso para
  // mostrar. Se muestra en un modal aparte en vez de un banner que queda pegado en pantalla.
  const [deleteFailure, setDeleteFailure] = useState(null);
  const [deletingRoleId, setDeletingRoleId] = useState(null);

  // Carga (o recarga) la lista de roles desde el backend.
  const loadRoles = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (err) {
      // El backend devuelve 404 cuando no hay roles cargados, no es un error crítico.
      if (err.message.includes('No se encontraron')) {
        setRoles([]);
      } else {
        setFetchError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Crea o edita un rol según qué haya en formTarget, y refresca la lista al terminar.
  const handleSubmitForm = async (data) => {
    if (formTarget === 'create') {
      await createRole(data);
    } else {
      await updateRole(formTarget.id, data);
    }
    setFormTarget(null);
    await loadRoles();
  };

  // Al confirmar el modal de eliminación, borra el rol y lo saca de la lista local. Si
  // falla (409, todavía tiene usuarios asignados), se cierra el modal de confirmación y
  // se muestra el motivo en un modal de aviso aparte.
  const handleConfirmDelete = async () => {
    const role = pendingDeleteRole;
    setDeletingRoleId(role.id);
    try {
      await deleteRole(role.id);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
    } catch (err) {
      setDeleteFailure({ name: role.name, message: err.message });
    } finally {
      setDeletingRoleId(null);
      setPendingDeleteRole(null);
    }
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
            className="RolePage-refreshButton"
            onClick={loadRoles}
            disabled={isLoading}
            title="Actualizar"
          >
            <span className="material-symbols-outlined">refresh</span>
          </button>
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

      {fetchError && <p className="RolePage-status RolePage-status--error">⚠ {fetchError}</p>}

      {isLoading && <p className="RolePage-status">Cargando roles...</p>}

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
                <th className="RolePage-cell--center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="RolePage-roleName">{role.name}</td>
                  <td className="RolePage-roleDescription">{role.description || '—'}</td>
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
                        onClick={() => setPendingDeleteRole(role)}
                        disabled={deletingRoleId === role.id}
                        title="Eliminar rol"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
          message="Esta acción no se puede deshacer y va a fallar si el rol todavía tiene usuarios asignados."
          confirmLabel="Eliminar"
          danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteRole(null)}
        />
      )}

      {deleteFailure && (
        <AlertModal
          title={`No se pudo eliminar "${deleteFailure.name}"`}
          message={deleteFailure.message}
          onClose={() => setDeleteFailure(null)}
        />
      )}
    </section>
  );
}

export default RolePage;
