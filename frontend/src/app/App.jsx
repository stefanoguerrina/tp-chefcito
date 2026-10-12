// Componente raíz: provee el tema (ThemeProvider), la sesión (AuthProvider) y los datos del
// usuario logueado (CurrentUserProvider, que depende de la sesión) y define
// todas las rutas de la app, protegidas según el nivel de acceso (visitante, usuario común
// o administrador).
import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import { CurrentUserProvider } from './CurrentUserContext.jsx';
import { ThemeProvider } from './ThemeContext.jsx';
import ProtectedRoute, { PUBLIC_HOME_PATH } from './ProtectedRoute.jsx';
import UserLayout from '../features/user/components/UserLayout.jsx';
import LoadingScreen from '../core/components/LoadingScreen.jsx';
import RequestIndicator from '../core/components/RequestIndicator.jsx';
import * as pages from './pageLoaders.js';

// Cada página se descarga recién cuando se entra a su ruta (un archivo JS/CSS aparte por
// página, ver pageLoaders.js). Así un visitante solo baja la landing, un usuario no baja el
// panel de admin, etc., en vez de bajar la app entera antes de mostrar la primera pantalla.
// Las de un usuario se precargan en segundo plano apenas entra (ver UserLayout).
const AuthPage = pages.lazyPage(pages.loadAuthPage);
const HomePage = pages.lazyPage(pages.loadHomePage);
const ProfilePage = pages.lazyPage(pages.loadProfilePage);
const RecipePage = pages.lazyPage(pages.loadRecipePage);
const RecipeEditorPage = pages.lazyPage(pages.loadRecipeEditorPage);
const RecipeDetailPage = pages.lazyPage(pages.loadRecipeDetailPage);
const InventoryPage = pages.lazyPage(pages.loadInventoryPage);
const SavedRecipesPage = pages.lazyPage(pages.loadSavedRecipesPage);
const SearchResultsPage = pages.lazyPage(pages.loadSearchResultsPage);
const SearchListingPage = pages.lazyPage(pages.loadSearchListingPage);
const AdminPage = pages.lazyPage(pages.loadAdminPage);
const DonationResultPage = pages.lazyPage(pages.loadDonationResultPage);
const DonationsPage = pages.lazyPage(pages.loadDonationsPage);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrentUserProvider>
          <BrowserRouter>
            {/* Suspense muestra la pantalla de carga solo en la primera carga (mientras
                baja el archivo de esa página). Al navegar, React Router hace el cambio como
                transición: la página anterior sigue visible hasta que la nueva está lista, y
                si tarda aparece el loader global (lazyPage cuenta la descarga como un pedido). */}
            <Suspense fallback={<LoadingScreen />}>
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
                    <Route path="buscar" element={<SearchResultsPage />} />
                    <Route path="buscar/:searchType" element={<SearchListingPage />} />
                    <Route path="donaciones" element={<DonationsPage />} />
                    {/* Vuelta desde el checkout de Mercado Pago después de donar. */}
                    <Route path="donaciones/resultado" element={<DonationResultPage />} />
                  </Route>
                </Route>

                {/* Administrador: panel propio, la sección va en la URL. */}
                <Route element={<ProtectedRoute allow="admin" />}>
                  <Route path="admin/:section?" element={<AdminPage />} />
                </Route>

                {/* Cualquier otra URL vuelve al inicio (ProtectedRoute decide cuál según el rol). */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            {/* Loader global: aparece cuando un pedido al backend tarda, en cualquier pantalla. */}
            <RequestIndicator />
          </BrowserRouter>
        </CurrentUserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
