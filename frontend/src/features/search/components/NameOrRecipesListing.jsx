// Listado completo de categorías (/buscar/categorias) o de usuarios (/buscar/usuarios).
// Los dos tienen los mismos filtros (todos / solo los que tienen recetas, orden por
// nombre o por cantidad de recetas): cambia qué se le pide al backend, los textos y cómo
// se dibuja cada resultado, que llegan en `config` (ver SearchListingPage).
import ErrorState from '../../../core/components/ErrorState.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import SearchListingHeader from './SearchListingHeader.jsx';
import ListingModeToggle from './ListingModeToggle.jsx';
import ListingSortSelect from './ListingSortSelect.jsx';
import ListingEmptyState from './ListingEmptyState.jsx';
import SearchPagination from './SearchPagination.jsx';
import { useSearchListing } from '../hooks/useSearchListing.js';
import { NAME_OR_RECIPES_SORT_OPTIONS, nameOrRecipesFiltersToApiQuery } from '../models/searchListingModel.js';
import '../styles/_search-listing.scss';

// Recibe:
//   config: { fetchPage, title, allTitle, plural, formatSummary(total), allLabel,
//             withRecipesLabel, gridLayout ('cards' | 'profiles', ver _search-listing.scss),
//             renderItem(item, term, index) } — ver CATEGORY_LISTING / USER_LISTING en
//             SearchListingPage.
//   filters (ver parseNameOrRecipesFilters) y onFiltersChange(nuevosFiltros).
function NameOrRecipesListing({ config, filters, onFiltersChange }) {
  const { data, isLoading, error, retry } = useSearchListing(config.fetchPage, nameOrRecipesFiltersToApiQuery(filters));

  // Cualquier cambio de filtro u orden vuelve a la página 1.
  const changeFilters = (changes) => onFiltersChange({ ...filters, ...changes, page: 1 });
  const handlePageChange = (page) => onFiltersChange({ ...filters, page });

  const totalLabel = data && !isLoading ? data.total : undefined;
  const summary = data ? config.formatSummary(data.total) : 'Buscando...';

  return (
    <>
      <SearchListingHeader
        title={filters.term ? config.title : config.allTitle}
        highlight={filters.term}
        summary={summary}
      >
        <ListingModeToggle
          label={`Qué ${config.plural} mostrar`}
          value={filters.onlyWithRecipes}
          onChange={(onlyWithRecipes) => changeFilters({ onlyWithRecipes })}
          options={[
            { value: false, label: config.allLabel, count: totalLabel },
            { value: true, label: config.withRecipesLabel, icon: 'menu_book', count: totalLabel },
          ]}
        />
        <ListingSortSelect
          id="name-or-recipes-listing-sort"
          options={NAME_OR_RECIPES_SORT_OPTIONS}
          value={filters.sort}
          onChange={(sort) => changeFilters({ sort })}
        />
      </SearchListingHeader>

      <section className={`SearchListing-results${isLoading && data ? ' SearchListing-results--loading' : ''}`} aria-busy={isLoading}>
        {error && <ErrorState title="No pudimos cargar el listado" message={error} onRetry={retry} />}
        {!error && !data && <LoadingState message="Buscando..." />}

        {!error && data?.total === 0 && (
          <ListingEmptyState
            message={`No encontramos ${config.plural} con estos filtros.`}
            actionLabel={filters.onlyWithRecipes ? `Ver ${config.allLabel.toLowerCase()}` : undefined}
            onAction={() => changeFilters({ onlyWithRecipes: false })}
          />
        )}

        {!error && data?.items.length > 0 && (
          <>
            <div className={`SearchListing-grid SearchListing-grid--${config.gridLayout}`}>
              {data.items.map((item, index) => config.renderItem(item, filters.term, index))}
            </div>
            <SearchPagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              pageSize={data.pageSize}
              itemLabel={config.plural}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </>
  );
}

export default NameOrRecipesListing;
