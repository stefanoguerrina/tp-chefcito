// Main application component managing authentication state and route navigation.
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../features/user/pages/HomePage.jsx';
import AdminPage from '../features/admin/pages/AdminPage.jsx';
import AuthPage from '../features/auth/pages/AuthPage.jsx';
import { decodeToken } from '../shared/utils/decodeToken.js';

// Lee el token guardado en localStorage (si lo hay) y lo valida: debe existir,
// tener un payload decodificable y no estar vencido (campo `exp`, en segundos).
// Así la sesión sobrevive a un F5 sin pedir login de nuevo, sea admin o usuario común.
const getStoredSession = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
    localStorage.removeItem('token');
    return null;
  }

  return { isAdmin: payload.isAdmin === true };
};

function App() {
  const storedSession = getStoredSession();
  const [isAppLoggedIn, setIsAppLoggedIn] = useState(storedSession !== null);
  // Tracks whether the logged-in user has the admin role.
  const [isAdmin, setIsAdmin] = useState(storedSession?.isAdmin ?? false);

  // Receives adminStatus from useAuth after a successful login.
  const handleSuccessfulLogin = (adminStatus) => {
    setIsAppLoggedIn(true);
    setIsAdmin(adminStatus === true);
  };

  // Cierra la sesión: descarta el JWT guardado y vuelve a AuthPage.
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAppLoggedIn(false);
    setIsAdmin(false);
  };

  return (
    <div className="App">
      {!isAppLoggedIn ? (
        <AuthPage onLoginSuccess={handleSuccessfulLogin} />
      ) : (
        <BrowserRouter>
          <Routes>
            {/* Un admin no ve la home de un usuario común: cae directo en su propio
                panel, con su propia navegación y ubicaciones (ver features/admin). */}
            <Route
              path="/"
              element={
                isAdmin ? (
                  <AdminPage onLogout={handleLogout} />
                ) : (
                  <HomePage onLogout={handleLogout} />
                )
              }
            />

            {/* Space reserved for future pages (e.g., Profile, Recipes, etc.) */}
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
