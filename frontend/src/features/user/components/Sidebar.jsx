// Barra de navegación lateral fija, visible en toda página de un usuario autenticado.
// Un admin no usa esta sidebar: tiene la suya propia en features/admin.
// Recibe: activePanel (panel activo actualmente), onTogglePanel (callback).
import '../styles/_sidebar.scss';

// Accesos todavía sin feature propia: quedan visibles pero inertes hasta que existan.
const PENDING_NAV_LINKS = [
  { icon: 'explore', label: 'Explorar' },
  { icon: 'notifications', label: 'Notificaciones' },
];

// Paneles disponibles en la sidebar del usuario.
const USER_NAV_LINKS = [
  { icon: 'add_box', label: 'Mis recetas', panel: 'myRecipes' },
  { icon: 'kitchen', label: 'Mi inventario', panel: 'inventory' },
  { icon: 'bookmark', label: 'Recetas guardadas', panel: 'savedRecipes' },
  { icon: 'account_circle', label: 'Perfil', panel: 'profile' },
];

function Sidebar({ activePanel, onTogglePanel }) {
  return (
    <aside className="Sidebar">
      <a className="Sidebar-logo" href="#top" title="Chefcito">
        <span className="material-symbols-outlined">restaurant_menu</span>
      </a>

      <nav className="Sidebar-nav">
        {/* Botón de inicio: cierra cualquier panel abierto */}
        <button
          type="button"
          className={`Sidebar-link${activePanel === null ? ' Sidebar-link--active' : ''}`}
          title="Inicio"
          onClick={() => onTogglePanel(null)}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="Sidebar-tooltip">Inicio</span>
        </button>

        {/* Botones de panel propio: cada uno alterna su panel correspondiente */}
        {USER_NAV_LINKS.map((link) => (
          <button
            key={link.panel}
            type="button"
            className={`Sidebar-link${activePanel === link.panel ? ' Sidebar-link--active' : ''}`}
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
      </nav>
    </aside>
  );
}

export default Sidebar;
