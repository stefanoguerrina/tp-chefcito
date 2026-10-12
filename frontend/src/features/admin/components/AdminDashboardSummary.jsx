// Resumen del dashboard de administración: las dos tarjetas grandes (usuarios y recetas,
// con su ranking y gráfico) y los accesos rápidos a cada sección de gestión.
import AdminMetricCard from './AdminMetricCard.jsx';
import AdminStatTile from './AdminStatTile.jsx';
import AdminBarChart from './AdminBarChart.jsx';
import AdminRankingList from './AdminRankingList.jsx';
import { ADMIN_SECTIONS } from '../models/adminSectionsModel.js';

// Recibe: metrics (ver useAdminDashboard) y onSelectSection (abre una sección del panel).
function AdminDashboardSummary({ metrics, onSelectSection }) {
  return (
    <>
      <section className="AdminPage-metricsGrid">
        <AdminMetricCard
          label="Usuarios registrados"
          value={metrics.activeUsersCount + metrics.inactiveUsersCount}
          hint={`${metrics.activeUsersCount} activos · ${metrics.inactiveUsersCount} dados de baja`}
          footerTitle="Creadores con más recetas"
          variant="primary"
        >
          <AdminRankingList
            items={metrics.topCreators}
            unitLabel="recetas"
            unitLabelSingular="receta"
            emptyMessage="Todavía nadie publicó una receta."
          />
        </AdminMetricCard>

        <AdminMetricCard
          label="Recetas publicadas"
          value={metrics.recipesCount}
          unit="recetas"
          hint={`${metrics.recipesThisWeekCount} nuevas en los últimos 7 días`}
          badge="Recetas"
          footerTitle="Últimos 7 días"
          variant="secondary"
        >
          <AdminBarChart
            data={metrics.recipesLastWeek}
            emptyMessage="No hubo recetas nuevas esta semana."
          />
        </AdminMetricCard>
      </section>

      <section className="AdminPage-statsGrid">
        <AdminStatTile
          icon="grocery"
          label="Ingredientes cargados"
          value={metrics.ingredientsCount}
          onClick={() => onSelectSection(ADMIN_SECTIONS.ingredients)}
        />
        <AdminStatTile
          icon="category"
          label="Categorías de ingrediente"
          value={metrics.ingredientCategoriesCount}
          onClick={() => onSelectSection(ADMIN_SECTIONS.ingredientCategories)}
        />
        <AdminStatTile
          icon="menu_book"
          label="Categorías de receta"
          value={metrics.recipeCategoriesCount}
          onClick={() => onSelectSection(ADMIN_SECTIONS.recipeCategories)}
        />
        <AdminStatTile
          icon="shield_person"
          label="Roles definidos"
          value={metrics.rolesCount}
          onClick={() => onSelectSection(ADMIN_SECTIONS.roles)}
        />
      </section>
    </>
  );
}

export default AdminDashboardSummary;
