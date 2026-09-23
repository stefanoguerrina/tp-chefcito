// Sub-panel de roles de un usuario — se muestra expandido dentro de SearchUsersForm
// al clickear "Roles", o dentro de AdminUserRolesModal desde el dashboard. Permite ver
// qué roles tiene asignados y asignarle/quitarle roles mediante la tabla intermedia
// userrole. Cada cambio pide confirmación en un modal antes de ejecutarse. Solo lo ve un admin.
import { useState, useEffect } from 'react';
import { getAllRoles, getRolesByUser, assignRoleToUser, removeRoleFromUser } from '../services/roleService.js';
import ConfirmRoleModal from './ConfirmRoleModal.jsx';
import '../styles/_user-roles-panel.scss';

// Recibe: userId (número), username (para el mensaje del modal de confirmación).
function UserRolesPanel({ userId, username }) {
  const [allRoles, setAllRoles] = useState([]);
  const [assignedRoleIds, setAssignedRoleIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Rol sobre el que se pidió confirmación: { role, action: 'assign' | 'remove' } o null.
  const [pendingAction, setPendingAction] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [rolesData, userRolesData] = await Promise.all([
        getAllRoles().catch((err) => {
          // El backend devuelve 404 cuando no hay roles cargados — no es un error crítico.
          if (err.message.includes('No se encontraron')) return [];
          throw err;
        }),
        getRolesByUser(userId),
      ]);
      setAllRoles(rolesData);
      setAssignedRoleIds(userRolesData.map((r) => r.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Abre el modal de confirmación para el rol clickeado, según si ya está asignado o no.
  const handleChipClick = (role) => {
    const isAssigned = assignedRoleIds.includes(role.id);
    setPendingAction({ role, action: isAssigned ? 'remove' : 'assign' });
  };

  // Ejecuta la asignación/remoción confirmada en el modal y actualiza el estado local.
  const handleConfirmPendingAction = async () => {
    const { role, action } = pendingAction;
    if (action === 'remove') {
      await removeRoleFromUser(role.id, userId);
      setAssignedRoleIds((prev) => prev.filter((id) => id !== role.id));
    } else {
      await assignRoleToUser(role.id, userId);
      setAssignedRoleIds((prev) => [...prev, role.id]);
    }
    setPendingAction(null);
  };

  return (
    <div className="UserRolesPanel">
      <h4 className="UserRolesPanel-title">Roles del usuario</h4>

      {isLoading && <p className="UserRolesPanel-status">Cargando roles...</p>}

      {error && <p className="UserRolesPanel-status UserRolesPanel-status--error">⚠ {error}</p>}

      {!isLoading && allRoles.length === 0 && !error && (
        <p className="UserRolesPanel-status">
          No hay roles creados todavía. Creá uno desde el panel de Roles.
        </p>
      )}

      {!isLoading && allRoles.length > 0 && (
        <div className="UserRolesPanel-chips">
          {allRoles.map((role) => {
            const isAssigned = assignedRoleIds.includes(role.id);
            return (
              <button
                key={role.id}
                type="button"
                className={`UserRolesPanel-chip${isAssigned ? ' UserRolesPanel-chip--assigned' : ''}`}
                onClick={() => handleChipClick(role)}
                title={role.description || role.name}
              >
                <span className="material-symbols-outlined">{isAssigned ? 'check' : 'add'}</span>
                {role.name}
              </button>
            );
          })}
        </div>
      )}

      {pendingAction && (
        <ConfirmRoleModal
          role={pendingAction.role}
          action={pendingAction.action}
          username={username}
          onConfirm={handleConfirmPendingAction}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}

export default UserRolesPanel;
