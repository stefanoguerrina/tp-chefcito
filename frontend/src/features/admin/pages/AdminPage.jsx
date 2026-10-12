// Página raíz del panel de administración: layout separado de la home de usuario común
// (sidebar + topbar propios), con el dashboard de métricas como landing y acceso a los
// paneles de gestión (Roles, Ingredientes, Cat. de ingrediente, Cat. de receta). Los
// usuarios se gestionan desde la tabla del dashboard.
// La sección activa sale de la URL (/admin/:section), así se puede recargar o volver
// atrás sin perderla. Solo se llega acá con rol admin (ProtectedRoute en App.jsx).
// Rendimiento:
// - cada sección es un archivo aparte: al entrar se descarga solo la abierta y las demás se
//   precargan en segundo plano;
// - una sección se monta (y pide sus datos) recién la primera vez que se abre, y después
//   queda montada pero oculta: al volver se ve al instante y se actualiza en silencio
//   (useRefreshOnReturn), sin "Cargando..." ni perder la búsqueda o la página de su tabla;
// - el resumen de cifras se pide una vez acá y lo comparten el dashboard y las secciones de
//   categorías (antes cada una pedía el suyo).
import { Suspense, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.jsx';
import AdminSectionLayout from '../components/AdminSectionLayout.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import { useAdminProfile } from '../hooks/useAdminProfile.js';
import { useAdminSummary } from '../hooks/useAdminSummary.js';
import { ADMIN_SECTIONS, ADMIN_NAV_ITEMS, ADMIN_SECTION_HEADERS } from '../models/adminSectionsModel.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { lazyPage, preloadPages } from '../../../app/pageLoaders.js';
import '../styles/_admin-page.scss';

// Funciones que descargan el código de cada sección (ver lazyPage y preloadPages).
const SECTION_LOADERS = {
  [ADMIN_SECTIONS.dashboard]: () => import('../components/AdminDashboardSection.jsx'),
  [ADMIN_SECTIONS.roles]: () => import('../../role/pages/RolePage.jsx'),
  [ADMIN_SECTIONS.ingredients]: () => import('../components/AdminIngredientsSection.jsx'),
  [ADMIN_SECTIONS.ingredientCategories]: () => import('../components/AdminIngredientCategoriesSection.jsx'),
  [ADMIN_SECTIONS.recipeCategories]: () => import('../components/AdminRecipeCategoriesSection.jsx'),
};
const DashboardSection = lazyPage(SECTION_LOADERS[ADMIN_SECTIONS.dashboard]);
const RolePage = lazyPage(SECTION_LOADERS[ADMIN_SECTIONS.roles]);
const IngredientsSection = lazyPage(SECTION_LOADERS[ADMIN_SECTIONS.ingredients]);
const IngredientCategoriesSection = lazyPage(SECTION_LOADERS[ADMIN_SECTIONS.ingredientCategories]);
const RecipeCategoriesSection = lazyPage(SECTION_LOADERS[ADMIN_SECTIONS.recipeCategories]);

function AdminPage() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const { section } = useParams();
  // Una sección desconocida en la URL cae en el dashboard.
  const activeSection = Object.values(ADMIN_SECTIONS).includes(section) ? section : ADMIN_SECTIONS.dashboard;

  // Cambiar de sección es navegar: el dashboard vive en /admin y el resto en /admin/:section.
  const setActiveSection = (nextSection) =>
    navigate(nextSection === ADMIN_SECTIONS.dashboard ? '/admin' : `/admin/${nextSection}`);

  const { fullName: adminName, initials: adminInitials, avatarUrl: adminAvatarUrl } = useAdminProfile();
  const summary = useAdminSummary();

  // Secciones ya abiertas: quedan montadas (ocultas) para no volver a cargarlas. Se
  // actualiza durante el render (patrón de React para estado que depende de un cambio de
  // props): así la sección nueva se monta en el mismo render en que se elige.
  const [visitedSections, setVisitedSections] = useState([activeSection]);
  if (!visitedSections.includes(activeSection)) setVisitedSections([...visitedSections, activeSection]);

  // Al entrar, descarga en segundo plano el código de las demás secciones.
  useEffect(() => {
    preloadPages(Object.values(SECTION_LOADERS));
  }, []);

  // Las cifras del resumen cambian con lo que se hace en cualquier sección (ej. crear un
  // ingrediente): se actualizan en silencio cada vez que se cambia de sección (no al
  // entrar: useAdminSummary ya las pide al montarse).
  const previousSection = useRef(activeSection);
  useEffect(() => {
    if (previousSection.current === activeSection) return;
    previousSection.current = activeSection;
    summary.refreshSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // Recibe: el id de una sección y si es la que se ve. Devuelve: su componente.
  const renderSection = (sectionId, isActive) => {
    const header = ADMIN_SECTION_HEADERS[sectionId];
    switch (sectionId) {
      case ADMIN_SECTIONS.roles:
        return (
          <AdminSectionLayout header={header}>
            <RolePage isActive={isActive} />
          </AdminSectionLayout>
        );
      case ADMIN_SECTIONS.ingredients:
        return <IngredientsSection header={header} isActive={isActive} />;
      case ADMIN_SECTIONS.ingredientCategories:
        return (
          <IngredientCategoriesSection
            header={header}
            isActive={isActive}
            ingredientsCount={summary.metrics?.ingredientsCount ?? 0}
          />
        );
      case ADMIN_SECTIONS.recipeCategories:
        return (
          <RecipeCategoriesSection header={header} isActive={isActive} recipesCount={summary.metrics?.recipesCount ?? 0} />
        );
      default:
        return (
          <DashboardSection header={header} isActive={isActive} summary={summary} onSelectSection={setActiveSection} />
        );
    }
  };

  return (
    <div className="AdminPage">
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        adminName={adminName}
        adminInitials={adminInitials}
        adminAvatarUrl={adminAvatarUrl}
        onLogout={logout}
      />

      <div className="AdminPage-content">
        {/* En el orden de la sidebar; solo se ve la activa (hidden oculta las demás). */}
        {ADMIN_NAV_ITEMS.filter((item) => visitedSections.includes(item.id)).map((item) => (
          <div key={item.id} className="AdminPage-section" hidden={item.id !== activeSection}>
            <Suspense fallback={<LoadingState message="Cargando sección..." />}>
              {renderSection(item.id, item.id === activeSection)}
            </Suspense>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;
