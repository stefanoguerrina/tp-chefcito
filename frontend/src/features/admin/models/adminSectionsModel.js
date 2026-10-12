// Secciones del panel de administración: qué accesos muestra la sidebar y qué
// título muestra la topbar para cada uno. Es solo data (sin lógica ni JSX), por eso
// vive en models/: la consumen AdminPage, AdminSidebar y AdminTopbar.

// Ids de cada sección del panel. Se usan como valor del estado activeSection.
export const ADMIN_SECTIONS = {
  dashboard: 'dashboard',
  roles: 'roles',
  ingredients: 'ingredients',
  ingredientCategories: 'ingredientCategories',
  recipeCategories: 'recipeCategories',
};

// Accesos de la sidebar, en el orden en que se muestran. Un item puede llevar isPending
// (AdminSidebar lo muestra deshabilitado) mientras esa sección todavía no tiene panel
// propio en el frontend — hoy no hay ninguna en ese estado.
// "Usuarios" no es una sección aparte: la tabla del dashboard ya los lista, da de alta
// (modal), edita, les asigna roles y los da de baja o reactiva.
export const ADMIN_NAV_ITEMS = [
  { id: ADMIN_SECTIONS.dashboard, label: 'Dashboard', icon: 'grid_view' },
  { id: ADMIN_SECTIONS.roles, label: 'Roles y Permisos', icon: 'shield_person' },
  { id: ADMIN_SECTIONS.ingredients, label: 'Ingredientes', icon: 'grocery' },
  { id: ADMIN_SECTIONS.ingredientCategories, label: 'Cat. de Ingredientes', icon: 'category' },
  { id: ADMIN_SECTIONS.recipeCategories, label: 'Cat. de Recetas', icon: 'menu_book' },
];

// Encabezado que muestra la topbar según la sección activa. Solo título — ninguna
// sección lleva bajada (mismo criterio que "Admin Dashboard").
export const ADMIN_SECTION_HEADERS = {
  [ADMIN_SECTIONS.dashboard]: {
    title: 'Admin Dashboard',
  },
  [ADMIN_SECTIONS.roles]: {
    title: 'Roles y Permisos',
  },
  [ADMIN_SECTIONS.ingredients]: {
    title: 'Ingredientes',
  },
  [ADMIN_SECTIONS.ingredientCategories]: {
    title: 'Categorías de Ingredientes',
  },
  [ADMIN_SECTIONS.recipeCategories]: {
    title: 'Categorías de Recetas',
  },
};
