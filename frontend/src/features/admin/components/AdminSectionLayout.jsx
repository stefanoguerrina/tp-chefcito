// Estructura común de cada sección del panel: la barra superior (título y, si la sección
// lo necesita, el botón "Actualizar") y el contenido debajo.
// Recibe: header ({ title, subtitle }, ver ADMIN_SECTION_HEADERS), onRefresh e
//         isRefreshing (opcionales, para el botón de la topbar) y children.
import AdminTopbar from './AdminTopbar.jsx';

function AdminSectionLayout({ header, onRefresh, isRefreshing, children }) {
  return (
    <>
      <AdminTopbar
        title={header.title}
        subtitle={header.subtitle}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
      <main className="AdminPage-main">{children}</main>
    </>
  );
}

export default AdminSectionLayout;
