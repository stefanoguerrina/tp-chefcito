// Sección "Ingredientes" del panel: tarjetas de distribución y más usados, y la tabla de
// gestión. Sus datos se piden recién cuando se abre esta sección.
// Recibe: header ({ title, subtitle }).
import AdminSectionLayout from './AdminSectionLayout.jsx';
import AdminMetricCard from './AdminMetricCard.jsx';
import AdminCategoryDistribution from './AdminCategoryDistribution.jsx';
import AdminTopIngredientsGrid from './AdminTopIngredientsGrid.jsx';
import AdminIngredientsTable from './AdminIngredientsTable.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import { useAdminIngredients } from '../hooks/useAdminIngredients.js';
import { formatCategoriesCount } from '../models/adminIngredientsModel.js';

function AdminIngredientsSection({ header }) {
  const {
    ingredients,
    categories,
    usageCountByIngredient,
    topUsedIngredients,
    categoryDistribution,
    colorIndexByCategoryId,
    isLoading,
    error,
    handleRetry,
    handleSaveIngredient,
    handleUpdateIngredientCategories,
    handleDeleteIngredient,
  } = useAdminIngredients();

  return (
    <AdminSectionLayout header={header}>
      {error && <ErrorState message={error} onRetry={handleRetry} />}
      {isLoading && ingredients.length === 0 && (
        <p className="AdminPage-status">Cargando ingredientes...</p>
      )}

      <section className="AdminPage-metricsGrid">
        <AdminMetricCard
          label="Total de ingredientes"
          value={ingredients.length}
          unit={ingredients.length === 1 ? 'ingrediente' : 'ingredientes'}
          footerTitle="Distribución de Ingredientes"
          footerHint={formatCategoriesCount(categories.length)}
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
        categories={categories}
        usageCountByIngredient={usageCountByIngredient}
        colorIndexByCategoryId={colorIndexByCategoryId}
        isLoading={isLoading}
        onSaveIngredient={handleSaveIngredient}
        onUpdateIngredientCategories={handleUpdateIngredientCategories}
        onDeleteIngredient={handleDeleteIngredient}
      />
    </AdminSectionLayout>
  );
}

export default AdminIngredientsSection;
