// Componente raíz: provee la sesión (AuthProvider) y define todas las rutas de la app,
// protegidas según el nivel de acceso (visitante, usuario común o administrador).
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import ProtectedRoute, { PUBLIC_HOME_PATH } from './ProtectedRoute.jsx';
import AuthPage from '../features/auth/pages/AuthPage.jsx';
import UserLayout from '../features/user/components/UserLayout.jsx';
import HomePage from '../features/user/pages/HomePage.jsx';
import ProfilePage from '../features/user/pages/ProfilePage.jsx';
import RecipePage from '../features/recipe/pages/RecipePage.jsx';
import RecipeEditorPage from '../features/recipe/pages/RecipeEditorPage.jsx';
import RecipeDetailPage from '../features/recipe/pages/RecipeDetailPage.jsx';
import InventoryPage from '../features/inventory/pages/InventoryPage.jsx';
import SavedRecipesPage from '../features/userRecipe/pages/SavedRecipesPage.jsx';
import AdminPage from '../features/admin/pages/AdminPage.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Visitantes sin sesión: landing con login y registro. */}
          <Route element={<ProtectedRoute allow="guest" />}>
            <Route path={PUBLIC_HOME_PATH} element={<AuthPage />} />
          </Route>

          {/* Usuario común: todas las secciones comparten la sidebar (UserLayout). */}
          <Route element={<ProtectedRoute allow="user" />}>
            <Route element={<UserLayout />}>
              <Route index element={<HomePage />} />
              <Route path="recetas/:recipeId" element={<RecipeDetailPage />} />
              <Route path="mis-recetas" element={<RecipePage />} />
              <Route path="mis-recetas/nueva" element={<RecipeEditorPage />} />
              <Route path="mis-recetas/:recipeId/editar" element={<RecipeEditorPage />} />
              <Route path="perfil" element={<ProfilePage />} />
              <Route path="usuarios/:userId" element={<ProfilePage />} />
              <Route path="inventario" element={<InventoryPage />} />
              <Route path="guardadas" element={<SavedRecipesPage />} />
            </Route>
          </Route>

          {/* Administrador: panel propio, la sección va en la URL. */}
          <Route element={<ProtectedRoute allow="admin" />}>
            <Route path="admin/:section?" element={<AdminPage />} />
          </Route>

          {/* Cualquier otra URL vuelve al inicio (ProtectedRoute decide cuál según el rol). */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
