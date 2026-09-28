// Sidebar del panel de administración: navegación entre secciones, cambio de tema y datos
// del admin logueado con su botón de cerrar sesión. El comportamiento de colapsar/expandir
// y el panel de mobile vienen de core/components/CollapsibleSidebar.
// Recibe: activeSection (id de la sección abierta), onSelectSection (callback),
//         adminName y adminInitials (para el pie, ver useAdminProfile) y onLogout (callback).
import CollapsibleSidebar from '../../../core/components/CollapsibleSidebar.jsx';
import { ADMIN_NAV_ITEMS } from '../models/adminSectionsModel.js';
import { useThemeContext } from '../../../app/ThemeContext.jsx';
import '../styles/_admin-sidebar.scss';

function AdminSidebar({ activeSection, onSelectSection, adminName, adminInitials, onLogout }) {
  const { isDarkMode, toggleTheme } = useThemeContext();

  // Las secciones del panel no son rutas propias sino botones que cambian la sección
  // (AdminPage la guarda en la URL como /admin/:section).
  const items = ADMIN_NAV_ITEMS.map((item) => ({
    icon: item.icon,
    label: item.label,
    onClick: () => onSelectSection(item.id),
    isActive: activeSection === item.id,
    disabled: item.isPending,
    title: item.isPending ? `${item.label} (próximamente)` : undefined,
  }));

  const footerItems = [
    { icon: isDarkMode ? 'light_mode' : 'dark_mode', label: isDarkMode ? 'Modo claro' : 'Modo oscuro', onClick: toggleTheme },
    { icon: 'logout', label: 'Cerrar sesión', onClick: onLogout, isDanger: true },
  ];

  return (
    <CollapsibleSidebar
      className="AdminSidebar"
      brandSubtitle="Panel de Administrador"
      items={items}
      footerItems={footerItems}
      account={{ name: adminName, detail: 'Administrador', initials: adminInitials }}
    />
  );
}

export default AdminSidebar;
