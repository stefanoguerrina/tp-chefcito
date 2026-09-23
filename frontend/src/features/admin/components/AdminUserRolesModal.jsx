// Modal para gestionar los roles de un usuario puntual desde el dashboard de admin.
// Envuelve UserRolesPanel (features/role), que ya tiene toda la lógica de asignar/quitar
// roles con su propio modal de confirmación — acá solo se lo presenta dentro de un modal
// con el lenguaje visual del panel de administración.
// Recibe: user ({ id, username, fullName }), onClose.
import UserRolesPanel from '../../role/components/UserRolesPanel.jsx';
import '../styles/_admin-user-roles-modal.scss';

function AdminUserRolesModal({ user, onClose }) {
  return (
    <div className="AdminUserRolesModal-overlay" onClick={onClose}>
      <div
        className="AdminUserRolesModal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-user-roles-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="AdminUserRolesModal-header">
          <div>
            <h3 className="AdminUserRolesModal-title" id="admin-user-roles-modal-title">
              Roles de {user.fullName}
            </h3>
            <p className="AdminUserRolesModal-subtitle">@{user.username}</p>
          </div>
          <button
            type="button"
            className="AdminUserRolesModal-close"
            onClick={onClose}
            title="Cerrar"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="AdminUserRolesModal-body">
          <UserRolesPanel userId={user.id} username={user.username} />
        </div>
      </div>
    </div>
  );
}

export default AdminUserRolesModal;
