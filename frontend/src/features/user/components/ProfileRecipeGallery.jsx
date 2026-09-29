// Galería completa de recetas del perfil: buscador por nombre, "Todo" / "Con mi despensa",
// categoría y orden, en una grilla masonry con paginación. Usa el mismo listado que el
// buscador y "Recetas guardadas" (GET /api/search/recipes, acá con authorId) y, como
// ellos, guarda los filtros en la URL (ej. /perfil?despensa=1).
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import ListingSearchInput from '../../search/components/ListingSearchInput.jsx';
import ListingModeToggle from '../../search/components/ListingModeToggle.jsx';
import ListingSortSelect from '../../search/components/ListingSortSelect.jsx';
import PantryNotice from '../../search/components/PantryNotice.jsx';
import PantryMatchInfo from '../../search/components/PantryMatchInfo.jsx';
import ListingEmptyState from '../../search/components/ListingEmptyState.jsx';
import SearchPagination from '../../search/components/SearchPagination.jsx';
import { useSearchListing } from '../../search/hooks/useSearchListing.js';
import { getRecipeListing } from '../../search/services/searchService.js';
import {
  getRecipeSortOptions, parseRecipeFilters, recipeFiltersToApiQuery, recipeFiltersToParams,
} from '../../search/models/searchListingModel.js';
import '../../search/styles/_search-listing.scss';

// Recibe: authorId (dueño del perfil), totalRecipes (cuántas recetas tiene en total, para el
// botón "Todas (N)"), categories ([{ id, name }] de sus recetas, para el filtro),
// isOwnProfile, ownerName y onRecipeClick(recipeId).
function ProfileRecipeGallery({ authorId, totalRecipes, categories, isOwnProfile, ownerName, onRecipeClick }) {
  const sectionRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = parseRecipeFilters(searchParams, { authorId });
  const { data, isLoading, error, retry } = useSearchListing(getRecipeListing, recipeFiltersToApiQuery(filters));

  // replace: los filtros quedan en la URL (se recuperan al volver de una receta) pero no
  // suman pasos al historial, así "Atrás" sale del perfil en vez de deshacer filtros.
  const updateFilters = (nextFilters) => setSearchParams(recipeFiltersToParams(nextFilters), { replace: true });

  // Cualquier cambio de filtro u orden vuelve a la página 1 (la actual podría no existir más).
  const changeFilters = (changes) => updateFilters({ ...filters, ...changes, page: 1 });
  const handleClearFilters = () => changeFilters({ categoryId: null, pantry: false });

  // La galería no está arriba de la página: al cambiar de página se vuelve a su título.
  const handlePageChange = (page) => {
    updateFilters({ ...filters, page });
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const categoryOptions = [
    { value: '', label: 'Todas' },
    ...categories.map((category) => ({ value: String(category.id), label: category.name })),
  ];
  const hasClearableFilters = Boolean(filters.categoryId) || filters.pantry;
  // Con la despensa vacía ya lo explica PantryNotice: no hace falta el "no encontramos".
  const isPantryEmpty = filters.pantry && data?.pantry?.inventoryCount === 0;

  return (
    <section className="ProfilePage-allRecipes" ref={sectionRef}>
      <div className="ProfilePage-sectionHeader">
        <h3 className="ProfilePage-sectionTitle">
          {isOwnProfile ? 'Mis recetas' : `Recetas de ${ownerName}`}
        </h3>
        {data && (
          <span className="ProfilePage-galleryCount">
            {data.total} {data.total === 1 ? 'receta' : 'recetas'}
          </span>
        )}
      </div>

      <div className="ProfilePage-galleryFilters">
        <ListingSearchInput
          value={filters.term}
          onChange={(term) => changeFilters({ term })}
          placeholder="Buscar por nombre"
          label="Buscar recetas del perfil por nombre"
        />

        <div className="ProfilePage-galleryControls">
          <ListingModeToggle
            label="Qué recetas mostrar"
            value={filters.pantry}
            onChange={(pantry) => changeFilters({ pantry })}
            options={[
              { value: false, label: `Todas (${totalRecipes})` },
              { value: true, label: 'Inventario', icon: 'kitchen' },
            ]}
          />

          {categories.length > 0 && (
            <ListingSortSelect
              id="profile-recipes-category"
              label="Categoría:"
              options={categoryOptions}
              value={filters.categoryId ? String(filters.categoryId) : ''}
              onChange={(value) => changeFilters({ categoryId: Number(value) || null })}
            />
          )}

          {/* Con la despensa, el orden lo define cuánto de cada receta tenés. */}
          {!filters.pantry && (
            <ListingSortSelect
              id="profile-recipes-sort"
              options={getRecipeSortOptions(filters)}
              value={filters.sort}
              onChange={(sort) => changeFilters({ sort })}
            />
          )}
        </div>
      </div>

      <div className={`ProfilePage-results${isLoading && data ? ' ProfilePage-results--loading' : ''}`} aria-busy={isLoading}>
        {error && <ErrorState title="No pudimos cargar las recetas" message={error} onRetry={retry} />}
        {!error && !data && <p className="ProfilePage-empty">Cargando recetas...</p>}

        {!error && data && (
          <>
            {filters.pantry && data.pantry && <PantryNotice pantry={data.pantry} total={data.total} />}

            {data.total === 0 && !isPantryEmpty && (
              <ListingEmptyState
                message="No hay recetas con estos filtros."
                actionLabel={hasClearableFilters ? 'Limpiar filtros' : undefined}
                onAction={handleClearFilters}
              />
            )}

            {data.items.length > 0 && (
              <>
                {/* Grilla pareja (la del buscador): todas las cards de una fila miden lo mismo. */}
                <div className="SearchListing-grid SearchListing-grid--grid">
                  {data.items.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onClick={() => onRecipeClick(recipe.id)}
                      showSaveButton={false}
                      // En el perfil propio el autor sos vos: no hace falta mostrarlo.
                      showAuthor={!isOwnProfile}
                    >
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
                  scrollToTop={false}
                />
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default ProfileRecipeGallery;
