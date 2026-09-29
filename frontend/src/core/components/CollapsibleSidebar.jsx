// Sidebar colapsable compartida por la del usuario (features/user) y la del admin
// (features/admin). Adapta a nuestro stack el componente "sidebar" de Aceternity/shadcn:
// mismo comportamiento, pero con SASS, NavLink y Material Symbols en vez de Tailwind,
// Next.js, framer-motion y lucide-react.
// - Desktop (md+): riel angosto solo con íconos que se expande al pasar el mouse.
// - Mobile: barra superior con botón de menú que abre la sidebar como panel lateral.
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './_collapsible-sidebar.scss';

// Arma la clase de un item según si está activo y si es una acción "peligrosa"
// (cerrar sesión: se pinta de rojo al pasar el mouse).
const getItemClassName = (item, isActive) => {
  let className = 'CollapsibleSidebar-item';
  if (isActive) className += ' CollapsibleSidebar-item--active';
  if (item.isDanger) className += ' CollapsibleSidebar-item--danger';
  return className;
};

// Un acceso de la sidebar: ícono + texto. Con "to" es un NavLink (NavLink marca solo el
// de la ruta activa); sin "to" es un botón que ejecuta item.onClick.
// Recibe: item { icon, label, to?, end?, onClick?, isActive?, isDanger?, disabled?, title? }
//         y onClick (opcional: lo usa la sidebar para cerrar el panel en mobile).
function SidebarItem({ item, onClick }) {
  const content = (
    <>
      <span className="CollapsibleSidebar-itemIcon material-symbols-outlined">{item.icon}</span>
      <span className="CollapsibleSidebar-label">{item.label}</span>
    </>
  );

  if (item.to) {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) => getItemClassName(item, isActive)}
        onClick={onClick}
      >
        {content}
      </NavLink>
    );
  }

  const handleClick = () => {
    item.onClick();
    onClick?.();
  };

  return (
    <button
      type="button"
      className={getItemClassName(item, item.isActive)}
      onClick={handleClick}
      disabled={item.disabled}
      title={item.title}
    >
      {content}
    </button>
  );
}

// Recibe:
//   brandSubtitle: texto chico debajo de "Chefcito" (opcional, ej. "Panel de Administrador").
//   items: accesos de navegación (forma de cada uno en SidebarItem).
//   footerItems: acciones de abajo (cambiar tema, cerrar sesión), misma forma que items.
//   account: { name, detail, initials, avatarUrl?, to? } del usuario logueado, para el pie.
//   className: clase extra para que cada feature ajuste sus propios detalles de estilo.
function CollapsibleSidebar({ brandSubtitle, items, footerItems, account, className = '' }) {
  // Solo importa en mobile: si el panel lateral está abierto. En desktop la expansión es
  // CSS puro (:hover en _collapsible-sidebar.scss), no necesita estado.
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Se activa si la foto de perfil no llega a cargar (URL rota, sin conexión, etc.):
  // en ese caso se muestra el círculo con las iniciales.
  const [avatarBroken, setAvatarBroken] = useState(false);

  const handleOpenMenu = () => setIsMobileOpen(true);
  const handleCloseMenu = () => setIsMobileOpen(false);

  const brand = (
    <Link className="CollapsibleSidebar-brand" to="/" onClick={handleCloseMenu}>
      <span className="CollapsibleSidebar-brandIcon material-symbols-outlined">restaurant_menu</span>
      <span className="CollapsibleSidebar-brandText CollapsibleSidebar-label">
        <span className="CollapsibleSidebar-brandName">Chefcito</span>
        {brandSubtitle && <span className="CollapsibleSidebar-brandSubtitle">{brandSubtitle}</span>}
      </span>
    </Link>
  );

  const accountContent = account && (
    <>
      <span className="CollapsibleSidebar-itemIcon">
        {account.avatarUrl && !avatarBroken ? (
          <img
            className="CollapsibleSidebar-avatar"
            src={account.avatarUrl}
            alt=""
            onError={() => setAvatarBroken(true)}
          />
        ) : (
          <span className="CollapsibleSidebar-avatar CollapsibleSidebar-avatar--initials">
            {account.initials}
          </span>
        )}
      </span>
      <span className="CollapsibleSidebar-accountText CollapsibleSidebar-label">
        <span className="CollapsibleSidebar-accountName">{account.name}</span>
        <span className="CollapsibleSidebar-accountDetail">{account.detail}</span>
      </span>
    </>
  );

  return (
    <div className={`CollapsibleSidebar ${className}`}>
      {/* Solo mobile: reemplaza a la sidebar cuando no hay lugar a los costados. */}
      <header className="CollapsibleSidebar-topbar">
        {brand}
        <button
          type="button"
          className="CollapsibleSidebar-iconButton"
          onClick={handleOpenMenu}
          aria-label="Abrir menú"
          aria-expanded={isMobileOpen}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {/* Fondo oscuro detrás del panel abierto en mobile: tocarlo lo cierra. */}
      {isMobileOpen && <div className="CollapsibleSidebar-backdrop" onClick={handleCloseMenu} />}

      <aside className={`CollapsibleSidebar-panel${isMobileOpen ? ' CollapsibleSidebar-panel--open' : ''}`}>
        <div className="CollapsibleSidebar-header">
          {brand}
          <button
            type="button"
            className="CollapsibleSidebar-iconButton CollapsibleSidebar-closeButton"
            onClick={handleCloseMenu}
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Elegir una sección cierra el panel en mobile (en desktop no tiene efecto). */}
        <nav className="CollapsibleSidebar-nav">
          {items.map((item) => (
            <SidebarItem key={item.label} item={item} onClick={handleCloseMenu} />
          ))}
        </nav>

        <div className="CollapsibleSidebar-footer">
          {footerItems.map((item) => (
            <SidebarItem key={item.label} item={item} />
          ))}

          {account?.to ? (
            // NavLink (no Link): la cuenta es el único acceso al perfil, así que se marca
            // como activa cuando se está en esa ruta, igual que los demás accesos.
            <NavLink
              className={({ isActive }) =>
                `CollapsibleSidebar-item CollapsibleSidebar-account${isActive ? ' CollapsibleSidebar-item--active' : ''}`
              }
              to={account.to}
              onClick={handleCloseMenu}
            >
              {accountContent}
            </NavLink>
          ) : (
            account && <div className="CollapsibleSidebar-item CollapsibleSidebar-account">{accountContent}</div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default CollapsibleSidebar;
