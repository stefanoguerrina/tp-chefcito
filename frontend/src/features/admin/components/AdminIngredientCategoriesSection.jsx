// Sección "Categorías de Ingredientes" del panel: tarjetas de distribución y top, y la
// tabla de gestión. Sus datos se piden recién cuando se abre esta sección.
// Recibe: header ({ title, subtitle }).
import AdminSectionLayout from './AdminSectionLayout.jsx';
import AdminMetricCard from './AdminMetricCard.jsx';
import AdminCategoryDistribution from './AdminCategoryDistribution.jsx';
import AdminTopIngredientsGrid from './AdminTopIngredientsGrid.jsx';
import AdminIngredientCategoriesTable from './AdminIngredientCategoriesTable.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import { useAdminIngredientCategories } from '../hooks/useAdminIngredientCategories.js';
import { formatIngredientsCount } from '../models/adminIngredientsModel.js';

function AdminIngredientCategoriesSection({ header }) {
  const {
    categories,
    ingredientsCount,
    ingredientCountByCategory,
    topCategories,
    categoriesDistribution,
    isLoading,
    error,
    handleRetry,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  } = useAdminIngredientCategories();

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
          footerTitle="Distribución de Ingredientes"
          footerHint={formatIngredientsCount(ingredientsCount)}
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
        categories={categories}
        ingredientCountByCategory={ingredientCountByCategory}
        isLoading={isLoading}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </AdminSectionLayout>
  );
}

export default AdminIngredientCategoriesSection;
