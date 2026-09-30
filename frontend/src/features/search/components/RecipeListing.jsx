// Listado completo de recetas con filtros (incluidas las necesidades nutricionales), "Con
// mi despensa", orden, vista y paginación.
// Lo usan dos páginas: /buscar/recetas (todas las recetas) y /guardadas (solo las que
// guardó el usuario, con filters.savedOnly). No guarda los filtros: los recibe (vienen de
// la URL) y avisa cuando cambian.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import SearchListingHeader from './SearchListingHeader.jsx';
import RecipeListingControls from './RecipeListingControls.jsx';
import ListingSearchInput from './ListingSearchInput.jsx';
import RecipeFiltersPanel from './RecipeFiltersPanel.jsx';
import PantryNotice from './PantryNotice.jsx';
import PantryMatchInfo from './PantryMatchInfo.jsx';
import NutritionHighlights from './NutritionHighlights.jsx';
import ListingEmptyState from './ListingEmptyState.jsx';
import SearchPagination from './SearchPagination.jsx';
import AssistantBanner from './AssistantBanner.jsx';
import { useSearchListing } from '../hooks/useSearchListing.js';
import { useRecipeFilterCatalogs } from '../hooks/useRecipeFilterCatalogs.js';
import { useSavedRecipes } from '../../userRecipe/hooks/useSavedRecipes.js';
import { deleteUserRecipe } from '../../userRecipe/services/userRecipeService.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { getRecipeListing } from '../services/searchService.js';
import { SEARCH_PAGE_PATH, SEARCH_TYPES } from '../models/searchModel.js';
import {
  countActiveRecipeFilters, EMPTY_RECIPE_SIDEBAR_FILTERS, recipeFiltersToApiQuery,
} from '../models/searchListingModel.js';
import '../styles/_search-listing.scss';

// Recibe: filters (ver parseRecipeFilters) y onFiltersChange(nuevosFiltros).
function RecipeListing({ filters, onFiltersChange }) {
  const navigate = useNavigate();
  const { userId } = useAuthContext();
  const [viewMode, setViewMode] = useState('grid');
  const [removeError, setRemoveError] = useState('');
  const { categories, ingredients } = useRecipeFilterCatalogs();
  const { savedRecipeIds, handleToggleSave, saveError, clearSaveError } = useSavedRecipes();
  const { data, isLoading, error, retry, refresh } = useSearchListing(getRecipeListing, recipeFiltersToApiQuery(filters));

  const { savedOnly } = filters;
  const activeFiltersCount = countActiveRecipeFilters(filters);
  const isFiltered = activeFiltersCount > 0 || Boolean(filters.term) || filters.pantry;
  // Si se llegó desde una categoría (sin texto buscado), el título usa su nombre.
  const categoryName = categories.find((category) => category.id === filters.categoryId)?.name;
  const highlight = savedOnly ? null : filters.term || categoryName;
  // Con la despensa vacía no hay nada que listar: lo explica PantryNotice, no hace falta
  // además el "no encontramos recetas".
  const isPantryEmpty = filters.pantry && data?.pantry?.inventoryCount === 0;

  // Cualquier cambio de filtro u orden vuelve a la página 1 (la actual podría no existir más).
  const changeFilters = (changes) => onFiltersChange({ ...filters, ...changes, page: 1 });
  const handleClearFilters = () => changeFilters(EMPTY_RECIPE_SIDEBAR_FILTERS);
  const handlePageChange = (page) => onFiltersChange({ ...filters, page });

  // En "Recetas guardadas" el listón siempre quita la receta y, si sale bien, se vuelve a
  // pedir la página para que desaparezca del listado.
  const handleRemoveSaved = (idRecipe) =>
    deleteUserRecipe(idRecipe)
      .then(refresh)
      .catch((err) => setRemoveError(err.message));

  let summary = 'Buscando recetas...';
  if (data) {
    const recipesLabel = `${data.total} ${data.total === 1 ? 'receta' : 'recetas'}`;
    if (savedOnly) summary = isFiltered ? `${recipesLabel} guardadas con estos filtros` : `${recipesLabel} guardadas`;
    else summary = `${recipesLabel} ${data.total === 1 ? 'encontrada' : 'encontradas'}`;
  }

  let title = 'Todas las recetas';
  if (savedOnly) title = 'Recetas guardadas';
  else if (highlight) title = 'Recetas de';

  return (
    <>
      <SearchListingHeader title={title} highlight={highlight} summary={summary}>
        <RecipeListingControls
          filters={filters}
          total={data && !isLoading ? data.total : undefined}
          viewMode={viewMode}
          onFiltersChange={changeFilters}
          onViewModeChange={setViewMode}
        />
      </SearchListingHeader>

      {savedOnly && (
        <ListingSearchInput
          value={filters.term}
          onChange={(term) => changeFilters({ term })}
          placeholder="Buscar en tus recetas guardadas por nombre…"
          label="Buscar en recetas guardadas"
        />
      )}

      <div className="SearchListing-layout">
        <RecipeFiltersPanel
          filters={filters}
          categories={categories}
          ingredients={ingredients}
          activeCount={activeFiltersCount}
          onChange={changeFilters}
          onClear={handleClearFilters}
        />

        <section className={`SearchListing-results${isLoading && data ? ' SearchListing-results--loading' : ''}`} aria-busy={isLoading}>
          {error && <ErrorState title="No pudimos cargar las recetas" message={error} onRetry={retry} />}
          {!error && !data && <p className="SearchListing-status">Buscando recetas...</p>}

          {!error && data && (
            <>
              {filters.pantry && data.pantry && <PantryNotice pantry={data.pantry} total={data.total} />}

              {data.total === 0 && !isPantryEmpty && (savedOnly && !isFiltered ? (
                <ListingEmptyState
                  message="Todavía no guardaste recetas. Guardá las que te gusten desde su card para encontrarlas acá."
                  actionLabel="Explorar recetas"
                  onAction={() => navigate(`${SEARCH_PAGE_PATH}/${SEARCH_TYPES.recipes}`)}
                />
              ) : (
                <ListingEmptyState
                  message="No encontramos recetas con estos filtros."
                  actionLabel={activeFiltersCount > 0 ? 'Limpiar filtros' : undefined}
                  onAction={handleClearFilters}
                />
              ))}

              {data.items.length > 0 && (
                <>
                  <div className={`SearchListing-grid SearchListing-grid--${viewMode}`}>
                    {data.items.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        horizontal={viewMode === 'list'}
                        onClick={() => navigate(`/recetas/${recipe.id}`)}
                        // Guardar una receta propia no tiene sentido (ya está en "Mis recetas").
                        showSaveButton={savedOnly || recipe.authorId !== userId}
                        isSaved={savedOnly || savedRecipeIds.has(recipe.id)}
                        onToggleSave={() => (savedOnly ? handleRemoveSaved(recipe.id) : handleToggleSave(recipe.id))}
                      >
                        {recipe.nutritionHighlights?.length > 0 && (
                          <NutritionHighlights highlights={recipe.nutritionHighlights} />
                        )}
                        {recipe.pantryMatch && <PantryMatchInfo match={recipe.pantryMatch} />}
                      </RecipeCard>
                    ))}
                  </div>
                  <SearchPagination
                    page={data.page}
                    totalPages={data.totalPages}
                    total={data.total}
                    pageSize={data.pageSize}
                    itemLabel="recetas"
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </>
          )}
        </section>
      </div>

      {!savedOnly && (
        <AssistantBanner
          title={highlight ? `¿Buscás una receta de «${highlight}» en particular?` : '¿No encontrás lo que buscás?'}
          description="Pedile una idea a Chefcito Bot con los ingredientes que tengas en tu despensa."
        />
      )}

      {saveError && <AlertModal title="No se pudo guardar la receta" message={saveError} onClose={clearSaveError} />}
      {removeError && (
        <AlertModal title="No se pudo quitar la receta" message={removeError} onClose={() => setRemoveError('')} />
      )}
    </>
  );
}

export default RecipeListing;
