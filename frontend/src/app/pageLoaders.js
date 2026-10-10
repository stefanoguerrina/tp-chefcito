// Funciones que descargan el código de cada página (un archivo por página, ver App.jsx).
// Están acá, y no en App.jsx, para poder reutilizarlas en la precarga (preloadPages) sin
// que UserLayout tenga que importar App.
import { lazy } from 'react';
import { requestStarted, requestFinished } from '../shared/utils/requestTracker.js';

export const loadAuthPage = () => import('../features/auth/pages/AuthPage.jsx');
export const loadHomePage = () => import('../features/user/pages/HomePage.jsx');
export const loadProfilePage = () => import('../features/user/pages/ProfilePage.jsx');
export const loadRecipePage = () => import('../features/recipe/pages/RecipePage.jsx');
export const loadRecipeEditorPage = () => import('../features/recipe/pages/RecipeEditorPage.jsx');
export const loadRecipeDetailPage = () => import('../features/recipe/pages/RecipeDetailPage.jsx');
export const loadInventoryPage = () => import('../features/inventory/pages/InventoryPage.jsx');
export const loadSavedRecipesPage = () => import('../features/userRecipe/pages/SavedRecipesPage.jsx');
export const loadSearchResultsPage = () => import('../features/search/pages/SearchResultsPage.jsx');
export const loadSearchListingPage = () => import('../features/search/pages/SearchListingPage.jsx');
export const loadAdminPage = () => import('../features/admin/pages/AdminPage.jsx');
export const loadDonationResultPage = () => import('../features/donation/pages/DonationResultPage.jsx');
export const loadDonationsPage = () => import('../features/donation/pages/DonationsPage.jsx');

// Las páginas de un usuario común (las que cuelgan de UserLayout).
export const USER_PAGE_LOADERS = [
  loadHomePage,
  loadProfilePage,
  loadRecipePage,
  loadRecipeEditorPage,
  loadRecipeDetailPage,
  loadInventoryPage,
  loadSavedRecipesPage,
  loadSearchResultsPage,
  loadSearchListingPage,
  loadDonationsPage,
];

// Como lazy() de React, pero la descarga de la página cuenta como un pedido en curso para
// el loader global (RequestIndicator): al navegar, React Router deja la pantalla anterior
// visible hasta que la nueva está lista, y sin esto no habría ninguna señal de que algo
// se está cargando. Recibe: la función que descarga la página. Devuelve: el componente.
export const lazyPage = (loadPage) =>
  lazy(() => {
    requestStarted();
    return loadPage().finally(requestFinished);
  });

// Descarga en segundo plano el código de las páginas indicadas, cuando el navegador está
// libre, para que después navegar a ellas sea instantáneo. Si una descarga falla no pasa
// nada: se vuelve a intentar al entrar a esa página. Recibe: la lista de funciones load*.
export const preloadPages = (loaders) => {
  const preloadAll = () => loaders.forEach((loadPage) => loadPage().catch(() => {}));
  if ('requestIdleCallback' in window) window.requestIdleCallback(preloadAll);
  else setTimeout(preloadAll, 1000);
};
