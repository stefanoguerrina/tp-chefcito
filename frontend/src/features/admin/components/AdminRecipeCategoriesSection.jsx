// Sección "Categorías de Recetas" del panel: tarjetas de distribución y top, y la tabla
// de gestión. Sus datos se piden recién cuando se abre esta sección.
// Recibe: header ({ title, subtitle }), isActive (si se está viendo: al volver a ella se
// actualizan sus datos en silencio) y recipesCount (total de recetas, del resumen que pide
// AdminPage).
import AdminSectionLayout from './AdminSectionLayout.jsx';
import AdminMetricCard from './AdminMetricCard.jsx';
import AdminCategoryDistribution from './AdminCategoryDistribution.jsx';
import AdminTopIngredientsGrid from './AdminTopIngredientsGrid.jsx';
import AdminCategoriesTable from './AdminCategoriesTable.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import { useAdminRecipeCategories } from '../hooks/useAdminRecipeCategories.js';
import { formatCategoryCode } from '../models/adminRecipeCategoriesModel.js';
import { useRefreshOnReturn } from '../../../core/hooks/useRefreshOnReturn.js';

const COUNT_LABELS = { header: 'Recetas asociadas', singular: 'receta', plural: 'recetas' };
const FORM_TEXTS = {
  idPrefix: 'recipe-category-form',
  namePlaceholder: 'Ej: Postres',
  descriptionPlaceholder: 'Para qué recetas se usa esta categoría',
};

function AdminRecipeCategoriesSection({ header, isActive, recipesCount }) {
  const {
    categories,
    recipeCountByCategory,
    topCategories,
    categoriesDistribution,
    isLoading,
    error,
    handleRetry,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    refresh,
  } = useAdminRecipeCategories();
  useRefreshOnReturn(isActive, refresh);

  return (
    <AdminSectionLayout header={header}>
      {error && <ErrorState message={error} onRetry={handleRetry} />}
      {isLoading && categories.length === 0 && (
        <LoadingState message="Cargando categorías..." />
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

      <AdminCategoriesTable
        title="Categorías de Recetas"
        categories={categories}
        countByCategory={recipeCountByCategory}
        countLabels={COUNT_LABELS}
        formatCode={formatCategoryCode}
        deleteMessage="Esta acción no se puede deshacer. Las recetas que tengan asignada esta categoría van a perderla, pero no se eliminan."
        formTexts={FORM_TEXTS}
        isLoading={isLoading}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </AdminSectionLayout>
  );
}

export default AdminRecipeCategoriesSection;
