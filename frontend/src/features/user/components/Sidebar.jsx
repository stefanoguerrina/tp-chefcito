// Barra de navegación lateral fija, visible en toda página de un usuario autenticado.
// Un admin no usa esta sidebar: tiene la suya propia en features/admin.
// Cada acceso es un NavLink a una ruta real: NavLink marca solo el link de la ruta activa.
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebarProfile } from '../hooks/useSidebarProfile.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import '../styles/_sidebar.scss';

// Accesos todavía sin feature propia: quedan visibles pero inertes hasta que existan.
const PENDING_NAV_LINKS = [
  { icon: 'explore', label: 'Explorar' },
  { icon: 'notifications', label: 'Notificaciones' },
];

// Secciones del usuario. "end" en Inicio evita que quede marcado en todas las rutas
// (todas empiezan con "/").
const USER_NAV_LINKS = [
  { icon: 'home', label: 'Inicio', to: '/', end: true },
  { icon: 'add_box', label: 'Mis recetas', to: '/mis-recetas' },
  { icon: 'kitchen', label: 'Mi inventario', to: '/inventario' },
  { icon: 'bookmark', label: 'Recetas guardadas', to: '/guardadas' },
  { icon: 'account_circle', label: 'Perfil', to: '/perfil' },
];

// Arma la clase del link según si su ruta está activa (NavLink pasa isActive).
const getLinkClassName = ({ isActive }) => `Sidebar-link${isActive ? ' Sidebar-link--active' : ''}`;

function Sidebar() {
  const { logout } = useAuthContext();
  const { fullName, username, initials, avatarUrl } = useSidebarProfile();
  // Se activa si la URL de avatar cargada por el usuario no llega a cargar (rota,
  // sin conexión, etc.); en ese caso se cae al círculo con iniciales.
  const [avatarBroken, setAvatarBroken] = useState(false);

  return (
    <aside className="Sidebar">
      <NavLink className="Sidebar-brand" to="/">
        <span className="Sidebar-brandIcon material-symbols-outlined">restaurant_menu</span>
        <span className="Sidebar-brandName">Chefcito</span>
      </NavLink>

      <nav className="Sidebar-nav">
        {USER_NAV_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={getLinkClassName}>
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="Sidebar-linkLabel">{link.label}</span>
          </NavLink>
        ))}

        {/* TODO: conectar con las futuras features de exploración y notificaciones. */}
        {PENDING_NAV_LINKS.map((link) => (
          <button key={link.icon} type="button" className="Sidebar-link Sidebar-link--pending" disabled title={`${link.label} (próximamente)`}>
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
          onClick={logout}
          title="Cerrar sesión"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
