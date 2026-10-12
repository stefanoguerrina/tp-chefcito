// Estructura común de cada sección del panel: la barra superior con el título y el
// contenido debajo.
// Recibe: header ({ title, subtitle }, ver ADMIN_SECTION_HEADERS) y children.
import AdminTopbar from './AdminTopbar.jsx';

function AdminSectionLayout({ header, children }) {
  return (
    <>
      <AdminTopbar title={header.title} subtitle={header.subtitle} />
      <main className="AdminPage-main">{children}</main>
    </>
  );
}

export default AdminSectionLayout;
