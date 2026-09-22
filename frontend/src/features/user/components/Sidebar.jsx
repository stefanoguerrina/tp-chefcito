// Barra de navegación lateral fija, visible en toda página autenticada.
// Para un admin, expone botones de acceso a los distintos paneles de administración.
// Recibe: isAdmin, activeAdminPanel (panel activo actualmente), onTogglePanel (callback).
import '../styles/_sidebar.scss';

// Accesos todavía sin feature propia: quedan visibles pero inertes hasta que existan.
const PENDING_NAV_LINKS = [
  { icon: 'explore', label: 'Explorar' },
  { icon: 'notifications', label: 'Notificaciones' },
];

// Paneles disponibles para cualquier usuario autenticado (no requieren rol admin).
const USER_NAV_LINKS = [
  { icon: 'add_box', label: 'Mis recetas', panel: 'myRecipes' },
  { icon: 'kitchen', label: 'Mi inventario', panel: 'inventory' },
  { icon: 'bookmark', label: 'Recetas guardadas', panel: 'savedRecipes' },
];

// Paneles de admin disponibles en la sidebar: cada uno tiene un ícono, label e id.
const ADMIN_NAV_LINKS = [
  { icon: 'manage_accounts', label: 'Usuarios', panel: 'users' },
  { icon: 'shield_person', label: 'Roles', panel: 'roles' },
  { icon: 'category', label: 'Categorías de ingrediente', panel: 'ingredientCategories' },
  { icon: 'grocery', label: 'Ingredientes', panel: 'ingredients' },
];

function Sidebar({ isAdmin, activeAdminPanel, onTogglePanel }) {
  return (
    <aside className="Sidebar">
      <a className="Sidebar-logo" href="#top" title="Chefcito">
        <span className="material-symbols-outlined">restaurant_menu</span>
      </a>

      <nav className="Sidebar-nav">
        {/* Botón de inicio: cierra cualquier panel admin abierto */}
        <button
          type="button"
          className={`Sidebar-link${activeAdminPanel === null ? ' Sidebar-link--active' : ''}`}
          title="Inicio"
          onClick={() => onTogglePanel(null)}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="Sidebar-tooltip">Inicio</span>
        </button>

        {/* Botones de panel propio: cada uno alterna su panel correspondiente (no requieren admin) */}
        {USER_NAV_LINKS.map((link) => (
          <button
            key={link.panel}
            type="button"
            className={`Sidebar-link${activeAdminPanel === link.panel ? ' Sidebar-link--active' : ''}`}
            title={link.label}
            onClick={() => onTogglePanel(link.panel)}
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="Sidebar-tooltip">{link.label}</span>
          </button>
        ))}

        {/* TODO: conectar con las futuras features de exploración y notificaciones. */}
        {PENDING_NAV_LINKS.map((link) => (
          <button key={link.icon} type="button" className="Sidebar-link" title={link.label}>
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="Sidebar-tooltip">{link.label}</span>
          </button>
        ))}

        <button type="button" className="Sidebar-link" title="Perfil">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="Sidebar-tooltip">Perfil</span>
        </button>

        {/* Separador visual antes de los controles de admin */}
        {isAdmin && <hr className="Sidebar-divider" />}

        {/* Botones de admin: cada uno alterna su panel correspondiente */}
        {isAdmin &&
          ADMIN_NAV_LINKS.map((link) => (
            <button
              key={link.panel}
              type="button"
              className={`Sidebar-link${activeAdminPanel === link.panel ? ' Sidebar-link--active' : ''}`}
              title={link.label}
              onClick={() => onTogglePanel(link.panel)}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="Sidebar-tooltip">{link.label}</span>
            </button>
          ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
