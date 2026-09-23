// Barra de navegación lateral fija, visible en toda página de un usuario autenticado.
// Un admin no usa esta sidebar: tiene la suya propia en features/admin.
// Recibe: activePanel (panel activo actualmente), onTogglePanel (callback) y
// onLogout (callback de App.jsx que cierra la sesión y vuelve al login).
import { useState } from 'react';
import { useSidebarProfile } from '../hooks/useSidebarProfile.js';
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

function Sidebar({ activePanel, onTogglePanel, onLogout }) {
  const { fullName, username, initials, avatarUrl } = useSidebarProfile();
  // Se activa si la URL de avatar cargada por el usuario no llega a cargar (rota,
  // sin conexión, etc.); en ese caso se cae al círculo con iniciales.
  const [avatarBroken, setAvatarBroken] = useState(false);

  return (
    <aside className="Sidebar">
      <a className="Sidebar-brand" href="#top">
        <span className="Sidebar-brandIcon material-symbols-outlined">restaurant_menu</span>
        <span className="Sidebar-brandName">Chefcito</span>
      </a>

      <nav className="Sidebar-nav">
        {/* Botón de inicio: cierra cualquier panel abierto */}
        <button
          type="button"
          className={`Sidebar-link${activePanel === null ? ' Sidebar-link--active' : ''}`}
          onClick={() => onTogglePanel(null)}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="Sidebar-linkLabel">Inicio</span>
        </button>

        {/* Botones de panel propio: cada uno alterna su panel correspondiente */}
        {USER_NAV_LINKS.map((link) => (
          <button
            key={link.panel}
            type="button"
            className={`Sidebar-link${activePanel === link.panel ? ' Sidebar-link--active' : ''}`}
            onClick={() => onTogglePanel(link.panel)}
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="Sidebar-linkLabel">{link.label}</span>
          </button>
        ))}

        {/* TODO: conectar con las futuras features de exploración y notificaciones. */}
        {PENDING_NAV_LINKS.map((link) => (
          <button key={link.icon} type="button" className="Sidebar-link" disabled title={`${link.label} (próximamente)`}>
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="Sidebar-linkLabel">{link.label}</span>
          </button>
        ))}
      </nav>

      <div className="Sidebar-footer">
        <div className="Sidebar-account">
          {avatarUrl && !avatarBroken ? (
            <img
              className="Sidebar-avatar"
              src={avatarUrl}
              alt=""
              onError={() => setAvatarBroken(true)}
            />
          ) : (
            <span className="Sidebar-avatar Sidebar-avatar--initials">{initials}</span>
          )}
          <span className="Sidebar-accountText">
            <span className="Sidebar-accountName">{fullName}</span>
            <span className="Sidebar-accountUsername">@{username}</span>
          </span>
        </div>

        <button
          type="button"
          className="Sidebar-logout"
          onClick={onLogout}
          title="Cerrar sesión"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
