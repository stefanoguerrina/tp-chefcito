// Protección de rutas según el nivel de acceso del usuario (mismos niveles que el backend:
// usuario común y administrador). Se usa como ruta "padre" en App.jsx: si el usuario
// puede entrar, renderiza las rutas hijas (<Outlet />); si no, lo redirige.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthContext.jsx';

// Rutas por defecto de cada nivel.
export const PUBLIC_HOME_PATH = '/bienvenida';
export const USER_HOME_PATH = '/';
export const ADMIN_HOME_PATH = '/admin';

// Recibe: allow — 'user' (solo usuarios comunes), 'admin' (solo administradores) o
// 'guest' (solo visitantes sin sesión, ej. la landing con el login).
function ProtectedRoute({ allow }) {
  const { isLoggedIn, isAdmin } = useAuthContext();
  const location = useLocation();

  if (allow === 'guest') {
    // Alguien con sesión no tiene nada que hacer en la landing: va a su inicio.
    if (isLoggedIn) return <Navigate to={isAdmin ? ADMIN_HOME_PATH : USER_HOME_PATH} replace />;
    return <Outlet />;
  }

  // Sin sesión: a la landing, recordando a dónde quería ir para volver después del login.
  if (!isLoggedIn) {
    return <Navigate to={PUBLIC_HOME_PATH} replace state={{ from: location.pathname }} />;
  }

  // Con sesión pero sin el nivel pedido: a su propio inicio.
  if (allow === 'admin' && !isAdmin) return <Navigate to={USER_HOME_PATH} replace />;
  if (allow === 'user' && isAdmin) return <Navigate to={ADMIN_HOME_PATH} replace />;

  return <Outlet />;
}

export default ProtectedRoute;
