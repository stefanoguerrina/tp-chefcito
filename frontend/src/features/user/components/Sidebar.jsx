// Sidebar de toda página de un usuario autenticado (un admin tiene la suya en features/admin).
// Solo arma los datos (accesos, acciones y cuenta) y algún ajuste visual propio
// (_sidebar.scss): el comportamiento de colapsar/expandir y el panel de mobile vienen de
// core/components/CollapsibleSidebar.
import CollapsibleSidebar from '../../../core/components/CollapsibleSidebar.jsx';
import { useSidebarProfile } from '../hooks/useSidebarProfile.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { useThemeContext } from '../../../app/ThemeContext.jsx';
import '../styles/_sidebar.scss';

// Secciones del usuario. "end" en Inicio evita que quede marcado en todas las rutas
// (todas empiezan con "/"). El perfil no está acá: se entra tocando la cuenta del pie.
const USER_NAV_LINKS = [
  { icon: 'home', label: 'Inicio', to: '/', end: true },
  { icon: 'add_box', label: 'Mis recetas', to: '/mis-recetas' },
  { icon: 'kitchen', label: 'Mi inventario', to: '/inventario' },
  { icon: 'bookmark', label: 'Recetas guardadas', to: '/guardadas' },
  { icon: 'volunteer_activism', label: 'Donaciones', to: '/donaciones' },
];

function Sidebar() {
  const { logout } = useAuthContext();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const { fullName, username, initials, avatarUrl } = useSidebarProfile();

  const footerItems = [
    { icon: isDarkMode ? 'light_mode' : 'dark_mode', label: isDarkMode ? 'Modo claro' : 'Modo oscuro', onClick: toggleTheme },
    { icon: 'logout', label: 'Cerrar sesión', onClick: logout, isDanger: true },
  ];

  return (
    <CollapsibleSidebar
      className="Sidebar"
      items={USER_NAV_LINKS}
      footerItems={footerItems}
      account={{ name: fullName, detail: `@${username}`, initials, avatarUrl, to: '/perfil' }}
    />
  );
}

export default Sidebar;
