// Main application component managing authentication state and route navigation.
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../features/user/pages/HomePage.jsx';
import AdminPage from '../features/admin/pages/AdminPage.jsx';
import AuthPage from '../features/auth/pages/AuthPage.jsx';

function App() {
  const [isAppLoggedIn, setIsAppLoggedIn] = useState(false);
  // Tracks whether the logged-in user has the admin role.
  const [isAdmin, setIsAdmin] = useState(false);

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
                  <HomePage />
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
