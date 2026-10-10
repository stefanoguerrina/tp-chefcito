// Sección "Categorías de Ingredientes" del panel: tarjetas de distribución y top, y la
// tabla de gestión. Sus datos se piden recién cuando se abre esta sección.
// Recibe: header ({ title, subtitle }), isActive (si se está viendo: al volver a ella se
// actualizan sus datos en silencio) e ingredientsCount (total de ingredientes, del resumen
// que pide AdminPage).
import AdminSectionLayout from './AdminSectionLayout.jsx';
import AdminMetricCard from './AdminMetricCard.jsx';
import AdminCategoryDistribution from './AdminCategoryDistribution.jsx';
import AdminTopIngredientsGrid from './AdminTopIngredientsGrid.jsx';
import AdminCategoriesTable from './AdminCategoriesTable.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import { useAdminIngredientCategories } from '../hooks/useAdminIngredientCategories.js';
import { formatIngredientsCount } from '../models/adminIngredientsModel.js';
import { formatCategoryCode } from '../models/adminIngredientCategoriesModel.js';
import { useRefreshOnReturn } from '../../../core/hooks/useRefreshOnReturn.js';

const COUNT_LABELS = { header: 'Ingredientes asociados', singular: 'ingrediente', plural: 'ingredientes' };
const FORM_TEXTS = {
  idPrefix: 'ingredient-category-form',
  namePlaceholder: 'Ej: Lácteos',
  descriptionPlaceholder: 'Para qué ingredientes se usa esta categoría',
};

function AdminIngredientCategoriesSection({ header, isActive, ingredientsCount }) {
  const {
    categories,
    ingredientCountByCategory,
    topCategories,
    categoriesDistribution,
    isLoading,
    error,
    handleRetry,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    refresh,
  } = useAdminIngredientCategories();
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

      <AdminCategoriesTable
        title="Categorías de Ingredientes"
        categories={categories}
        countByCategory={ingredientCountByCategory}
        countLabels={COUNT_LABELS}
        formatCode={formatCategoryCode}
        deleteMessage="Esta acción no se puede deshacer y va a fallar si la categoría todavía tiene ingredientes asociados."
        formTexts={FORM_TEXTS}
        isLoading={isLoading}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </AdminSectionLayout>
  );
}

export default AdminIngredientCategoriesSection;
