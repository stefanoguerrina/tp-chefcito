// Página raíz del panel de administración: layout separado de la home de usuario común
// (sidebar + topbar propios), con el dashboard de métricas como landing y acceso a los
// paneles de gestión (Roles, Ingredientes, Cat. de ingrediente, Cat. de receta). Los
// usuarios se gestionan desde la tabla del dashboard.
// La sección activa sale de la URL (/admin/:section), así se puede recargar o volver
// atrás sin perderla. Solo se llega acá con rol admin (ProtectedRoute en App.jsx).
// Solo se monta la sección activa: cada una pide sus propios datos al abrirse, así al
// entrar al panel no se cargan también los de las secciones que no se están viendo.
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.jsx';
import AdminSectionLayout from '../components/AdminSectionLayout.jsx';
import AdminDashboardSection from '../components/AdminDashboardSection.jsx';
import AdminIngredientsSection from '../components/AdminIngredientsSection.jsx';
import AdminIngredientCategoriesSection from '../components/AdminIngredientCategoriesSection.jsx';
import AdminRecipeCategoriesSection from '../components/AdminRecipeCategoriesSection.jsx';
import RolePage from '../../role/pages/RolePage.jsx';
import { useAdminProfile } from '../hooks/useAdminProfile.js';
import { ADMIN_SECTIONS, ADMIN_SECTION_HEADERS } from '../models/adminSectionsModel.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import '../styles/_admin-page.scss';

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

  const sectionHeader = ADMIN_SECTION_HEADERS[activeSection];

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
        {activeSection === ADMIN_SECTIONS.dashboard && (
          <AdminDashboardSection header={sectionHeader} onSelectSection={setActiveSection} />
        )}

        {activeSection === ADMIN_SECTIONS.roles && (
          <AdminSectionLayout header={sectionHeader}>
            <RolePage />
          </AdminSectionLayout>
        )}

        {activeSection === ADMIN_SECTIONS.ingredients && <AdminIngredientsSection header={sectionHeader} />}

        {activeSection === ADMIN_SECTIONS.ingredientCategories && (
          <AdminIngredientCategoriesSection header={sectionHeader} />
        )}

        {activeSection === ADMIN_SECTIONS.recipeCategories && (
          <AdminRecipeCategoriesSection header={sectionHeader} />
        )}
      </div>
    </div>
  );
}

export default AdminPage;
