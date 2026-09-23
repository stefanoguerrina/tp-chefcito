// Sidebar del panel de administración: marca, navegación entre secciones y datos del
// admin logueado con su botón de cerrar sesión.
// Recibe: activeSection (id de la sección abierta), onSelectSection (callback),
//         adminName y adminInitials (para el pie, ver useAdminProfile) y onLogout (callback).
import { ADMIN_NAV_ITEMS } from '../models/adminSectionsModel.js';
import '../styles/_admin-sidebar.scss';

function AdminSidebar({ activeSection, onSelectSection, adminName, adminInitials, onLogout }) {
  return (
    <aside className="AdminSidebar">
      <div className="AdminSidebar-brand">
        <span className="AdminSidebar-brandIcon material-symbols-outlined">restaurant_menu</span>
        <span className="AdminSidebar-brandText">
          <span className="AdminSidebar-brandName">Chefcito</span>
          <span className="AdminSidebar-brandSubtitle">Panel de Administrador</span>
        </span>
      </div>

      <nav className="AdminSidebar-nav">
        {ADMIN_NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`AdminSidebar-link${activeSection === item.id ? ' AdminSidebar-link--active' : ''}`}
            onClick={() => onSelectSection(item.id)}
            disabled={item.isPending}
            title={item.isPending ? `${item.label} (próximamente)` : item.label}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="AdminSidebar-linkLabel">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="AdminSidebar-footer">
        <div className="AdminSidebar-account">
          <span className="AdminSidebar-avatar">{adminInitials}</span>
          <span className="AdminSidebar-accountText">
            <span className="AdminSidebar-accountName">{adminName}</span>
            <span className="AdminSidebar-accountRole">Administrador</span>
          </span>
        </div>

        <button
          type="button"
          className="AdminSidebar-logout"
          onClick={onLogout}
          title="Cerrar sesión"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
