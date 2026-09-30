// Sección "Categorías de Recetas" del panel: tarjetas de distribución y top, y la tabla
// de gestión. Sus datos se piden recién cuando se abre esta sección.
// Recibe: header ({ title, subtitle }).
import AdminSectionLayout from './AdminSectionLayout.jsx';
import AdminMetricCard from './AdminMetricCard.jsx';
import AdminCategoryDistribution from './AdminCategoryDistribution.jsx';
import AdminTopIngredientsGrid from './AdminTopIngredientsGrid.jsx';
import AdminRecipeCategoriesTable from './AdminRecipeCategoriesTable.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import { useAdminRecipeCategories } from '../hooks/useAdminRecipeCategories.js';

function AdminRecipeCategoriesSection({ header }) {
  const {
    categories,
    recipesCount,
    recipeCountByCategory,
    topCategories,
    categoriesDistribution,
    isLoading,
    error,
    handleRetry,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  } = useAdminRecipeCategories();

  return (
    <AdminSectionLayout header={header}>
      {error && <ErrorState message={error} onRetry={handleRetry} />}
      {isLoading && categories.length === 0 && (
        <p className="AdminPage-status">Cargando categorías...</p>
      )}

      <section className="AdminPage-metricsGrid">
        <AdminMetricCard
          label="Total de categorías"
          value={categories.length}
          unit={categories.length === 1 ? 'categoría' : 'categorías'}
          footerTitle="Distribución de Recetas"
          footerHint={`${recipesCount} ${recipesCount === 1 ? 'receta' : 'recetas'}`}
          variant="primary"
        >
          <AdminCategoryDistribution distribution={categoriesDistribution} />
        </AdminMetricCard>

        <AdminMetricCard label="Top categorías con más recetas" variant="secondary">
          <AdminTopIngredientsGrid
            items={topCategories}
            unitLabel="recetas"
            unitLabelSingular="receta"
            emptyMessage="Todavía ninguna categoría tiene recetas asociadas."
          />
        </AdminMetricCard>
      </section>

      <AdminRecipeCategoriesTable
        categories={categories}
        recipeCountByCategory={recipeCountByCategory}
        isLoading={isLoading}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </AdminSectionLayout>
  );
}

export default AdminRecipeCategoriesSection;
