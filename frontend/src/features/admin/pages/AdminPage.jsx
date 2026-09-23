// Página raíz del panel de administración: layout separado de la home de usuario común
// (sidebar + topbar propios), con el dashboard de métricas como landing y acceso a los
// paneles de gestión que ya existían (Usuarios, Roles, Ingredientes, Cat. de ingrediente).
// Solo se llega acá si isAdmin es true (gate hecho en App.jsx).
import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar.jsx';
import AdminTopbar from '../components/AdminTopbar.jsx';
import AdminMetricCard from '../components/AdminMetricCard.jsx';
import AdminStatTile from '../components/AdminStatTile.jsx';
import AdminBarChart from '../components/AdminBarChart.jsx';
import AdminRankingList from '../components/AdminRankingList.jsx';
import AdminUsersTable from '../components/AdminUsersTable.jsx';
import AdminIngredientsTable from '../components/AdminIngredientsTable.jsx';
import AdminIngredientCategoriesTable from '../components/AdminIngredientCategoriesTable.jsx';
import AdminRecipeCategoriesTable from '../components/AdminRecipeCategoriesTable.jsx';
import AdminCategoryDistribution from '../components/AdminCategoryDistribution.jsx';
import AdminTopIngredientsGrid from '../components/AdminTopIngredientsGrid.jsx';
import SearchUsersForm from '../../user/components/SearchUsersForm.jsx';
import RolePage from '../../role/pages/RolePage.jsx';
import { useAdminDashboard } from '../hooks/useAdminDashboard.js';
import { useAdminIngredients } from '../hooks/useAdminIngredients.js';
import { useAdminIngredientCategories } from '../hooks/useAdminIngredientCategories.js';
import { useAdminRecipeCategories } from '../hooks/useAdminRecipeCategories.js';
import { useAdminProfile } from '../hooks/useAdminProfile.js';
import { ADMIN_SECTIONS, ADMIN_SECTION_HEADERS } from '../models/adminSectionsModel.js';
import { formatCategoriesCount, formatIngredientsCount } from '../models/adminIngredientsModel.js';
import '../styles/_admin-page.scss';

// Recibe: onLogout (callback de App.jsx que cierra la sesión y vuelve al login).
function AdminPage({ onLogout }) {
  const [activeSection, setActiveSection] = useState(ADMIN_SECTIONS.dashboard);
  const {
    metrics,
    userRows,
    isLoading,
    error,
    busyUserId,
    handleRefresh,
    handleDeleteUser,
    handleRestoreUser,
    handleUserUpdated,
    handleUserRolesChanged,
  } = useAdminDashboard();
  const {
    ingredients,
    categories: ingredientCategories,
    usageCountByIngredient,
    topUsedIngredients,
    categoryDistribution,
    colorIndexByCategoryId,
    isLoading: isLoadingIngredients,
    error: ingredientsError,
    handleRefresh: handleRefreshIngredients,
    handleCreateIngredient,
    handleUpdateIngredient,
    handleDeleteIngredient,
  } = useAdminIngredients();
  const {
    categories: adminCategories,
    ingredientsCount: categoriesIngredientsCount,
    ingredientCountByCategory,
    topCategories,
    categoriesDistribution,
    isLoading: isLoadingCategories,
    error: categoriesError,
    handleRefresh: handleRefreshCategories,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  } = useAdminIngredientCategories();
  const {
    categories: recipeCategories,
    recipesCount: recipeCategoriesRecipesCount,
    recipeCountByCategory,
    topCategories: topRecipeCategories,
    categoriesDistribution: recipeCategoriesDistribution,
    isLoading: isLoadingRecipeCategories,
    error: recipeCategoriesError,
    handleRefresh: handleRefreshRecipeCategories,
    handleCreateCategory: handleCreateRecipeCategory,
    handleUpdateCategory: handleUpdateRecipeCategory,
    handleDeleteCategory: handleDeleteRecipeCategory,
  } = useAdminRecipeCategories();
  const { fullName: adminName, initials: adminInitials } = useAdminProfile();

  const sectionHeader = ADMIN_SECTION_HEADERS[activeSection];

  // La topbar solo tiene un botón de "Actualizar": cada sección con carga propia
  // (Dashboard, Ingredientes, Cat. de Ingredientes, Cat. de Recetas) le pasa su propio
  // refresh mientras está activa.
  const topbarRefreshBySection = {
    [ADMIN_SECTIONS.dashboard]: { onRefresh: handleRefresh, isRefreshing: isLoading },
    [ADMIN_SECTIONS.ingredients]: { onRefresh: handleRefreshIngredients, isRefreshing: isLoadingIngredients },
    [ADMIN_SECTIONS.ingredientCategories]: {
      onRefresh: handleRefreshCategories,
      isRefreshing: isLoadingCategories,
    },
    [ADMIN_SECTIONS.recipeCategories]: {
      onRefresh: handleRefreshRecipeCategories,
      isRefreshing: isLoadingRecipeCategories,
    },
  };
  const topbarRefresh = topbarRefreshBySection[activeSection];

  return (
    <div className="AdminPage">
      <AdminSidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        adminName={adminName}
        adminInitials={adminInitials}
        onLogout={onLogout}
      />

      <div className="AdminPage-content">
        <AdminTopbar
          title={sectionHeader.title}
          subtitle={sectionHeader.subtitle}
          onRefresh={topbarRefresh?.onRefresh}
          isRefreshing={topbarRefresh?.isRefreshing}
        />

        <main className="AdminPage-main">
          {activeSection === ADMIN_SECTIONS.dashboard && (
            <>
              {error && <p className="AdminPage-error">⚠ {error}</p>}
              {isLoading && !metrics && <p className="AdminPage-status">Cargando panel...</p>}

              {metrics && (
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
                      onClick={() => setActiveSection(ADMIN_SECTIONS.ingredients)}
                    />
                    <AdminStatTile
                      icon="category"
                      label="Categorías de ingrediente"
                      value={metrics.ingredientCategoriesCount}
                      onClick={() => setActiveSection(ADMIN_SECTIONS.ingredientCategories)}
                    />
                    <AdminStatTile
                      icon="menu_book"
                      label="Categorías de receta"
                      value={metrics.recipeCategoriesCount}
                      onClick={() => setActiveSection(ADMIN_SECTIONS.recipeCategories)}
                    />
                    <AdminStatTile
                      icon="shield_person"
                      label="Roles definidos"
                      value={metrics.rolesCount}
                      onClick={() => setActiveSection(ADMIN_SECTIONS.roles)}
                    />
                  </section>

                  <AdminUsersTable
                    rows={userRows}
                    isLoading={isLoading}
                    busyUserId={busyUserId}
                    onManageUsers={() => setActiveSection(ADMIN_SECTIONS.users)}
                    onDeleteUser={handleDeleteUser}
                    onRestoreUser={handleRestoreUser}
                    onUserUpdated={handleUserUpdated}
                    onUserRolesChanged={handleUserRolesChanged}
                  />
                </>
              )}
            </>
          )}

          {activeSection === ADMIN_SECTIONS.users && <SearchUsersForm />}
          {activeSection === ADMIN_SECTIONS.roles && <RolePage />}

          {activeSection === ADMIN_SECTIONS.ingredients && (
            <>
              {ingredientsError && <p className="AdminPage-error">⚠ {ingredientsError}</p>}
              {isLoadingIngredients && ingredients.length === 0 && (
                <p className="AdminPage-status">Cargando ingredientes...</p>
              )}

              <section className="AdminPage-metricsGrid">
                <AdminMetricCard
                  label="Total de ingredientes"
                  value={ingredients.length}
                  unit={ingredients.length === 1 ? 'ingrediente' : 'ingredientes'}
                  footerTitle="Distribución de Ingredientes"
                  footerHint={formatCategoriesCount(ingredientCategories.length)}
                  variant="primary"
                >
                  <AdminCategoryDistribution distribution={categoryDistribution} />
                </AdminMetricCard>

                <AdminMetricCard label="Top ingredientes más usados" variant="secondary">
                  <AdminTopIngredientsGrid
                    items={topUsedIngredients}
                    unitLabel="recetas"
                    unitLabelSingular="receta"
                    emptyMessage="Todavía ningún ingrediente se usó en una receta."
                  />
                </AdminMetricCard>
              </section>

              <AdminIngredientsTable
                ingredients={ingredients}
                categories={ingredientCategories}
                usageCountByIngredient={usageCountByIngredient}
                colorIndexByCategoryId={colorIndexByCategoryId}
                isLoading={isLoadingIngredients}
                onCreateIngredient={handleCreateIngredient}
                onUpdateIngredient={handleUpdateIngredient}
                onDeleteIngredient={handleDeleteIngredient}
              />
            </>
          )}

          {activeSection === ADMIN_SECTIONS.ingredientCategories && (
            <>
              {categoriesError && <p className="AdminPage-error">⚠ {categoriesError}</p>}
              {isLoadingCategories && adminCategories.length === 0 && (
                <p className="AdminPage-status">Cargando categorías...</p>
              )}

              <section className="AdminPage-metricsGrid">
                <AdminMetricCard
                  label="Total de categorías"
                  value={adminCategories.length}
                  unit={adminCategories.length === 1 ? 'categoría' : 'categorías'}
                  footerTitle="Distribución de Ingredientes"
                  footerHint={formatIngredientsCount(categoriesIngredientsCount)}
                  variant="primary"
                >
                  <AdminCategoryDistribution distribution={categoriesDistribution} />
                </AdminMetricCard>

                <AdminMetricCard label="Top categorías con más ingredientes" variant="secondary">
                  <AdminTopIngredientsGrid
                    items={topCategories}
                    unitLabel="ingredientes"
                    unitLabelSingular="ingrediente"
                    emptyMessage="Todavía ninguna categoría tiene ingredientes asociados."
                  />
                </AdminMetricCard>
              </section>

              <AdminIngredientCategoriesTable
                categories={adminCategories}
                ingredientCountByCategory={ingredientCountByCategory}
                isLoading={isLoadingCategories}
                onCreateCategory={handleCreateCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            </>
          )}

          {activeSection === ADMIN_SECTIONS.recipeCategories && (
            <>
              {recipeCategoriesError && <p className="AdminPage-error">⚠ {recipeCategoriesError}</p>}
              {isLoadingRecipeCategories && recipeCategories.length === 0 && (
                <p className="AdminPage-status">Cargando categorías...</p>
              )}

              <section className="AdminPage-metricsGrid">
                <AdminMetricCard
                  label="Total de categorías"
                  value={recipeCategories.length}
                  unit={recipeCategories.length === 1 ? 'categoría' : 'categorías'}
                  footerTitle="Distribución de Recetas"
                  footerHint={`${recipeCategoriesRecipesCount} ${recipeCategoriesRecipesCount === 1 ? 'receta' : 'recetas'}`}
                  variant="primary"
                >
                  <AdminCategoryDistribution distribution={recipeCategoriesDistribution} />
                </AdminMetricCard>

                <AdminMetricCard label="Top categorías con más recetas" variant="secondary">
                  <AdminTopIngredientsGrid
                    items={topRecipeCategories}
                    unitLabel="recetas"
                    unitLabelSingular="receta"
                    emptyMessage="Todavía ninguna categoría tiene recetas asociadas."
                  />
                </AdminMetricCard>
              </section>

              <AdminRecipeCategoriesTable
                categories={recipeCategories}
                recipeCountByCategory={recipeCountByCategory}
                isLoading={isLoadingRecipeCategories}
                onCreateCategory={handleCreateRecipeCategory}
                onUpdateCategory={handleUpdateRecipeCategory}
                onDeleteCategory={handleDeleteRecipeCategory}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminPage;
