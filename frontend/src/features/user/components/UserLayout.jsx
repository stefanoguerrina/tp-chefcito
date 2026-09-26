// Layout de todas las páginas de un usuario común: sidebar fija + el contenido de la ruta
// activa (<Outlet />). Cada sección (Inicio, Mis recetas, Perfil, etc.) es una ruta hija
// definida en App.jsx, así que se puede navegar con la URL, usar "Atrás" y recargar (F5).
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import '../styles/_home-page.scss';

function UserLayout() {
  return (
    <div className="HomePage">
      <Sidebar />

      <div className="HomePage-content">
        <main className="HomePage-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;
