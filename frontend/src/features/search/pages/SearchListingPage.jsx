// Página de listado completo de un tipo de resultado (ruta /buscar/:searchType): se llega
// desde "Ver todas", las cards "+N más" o el click en una categoría. Según el tipo muestra
// el listado de recetas (con filtros y "Inventario") o el de categorías / usuarios.
// Los filtros viven en la URL: esta página los lee y, cuando cambian, reescribe la URL.
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import SearchNavbar from '../components/SearchNavbar.jsx';
import RecipeListing from '../components/RecipeListing.jsx';
import NameOrRecipesListing from '../components/NameOrRecipesListing.jsx';
import CategoryResultItem from '../components/CategoryResultItem.jsx';
import UserProfileCard from '../components/UserProfileCard.jsx';
import { getCategoryListing, getUserListing } from '../services/searchService.js';
import { CATEGORY_ACCENTS, SEARCH_PAGE_PATH, SEARCH_TYPES } from '../models/searchModel.js';
import {
  nameOrRecipesFiltersToParams, parseNameOrRecipesFilters, parseRecipeFilters, recipeFiltersToParams,
} from '../models/searchListingModel.js';
import '../styles/_search-listing.scss';

// Qué pide y cómo dibuja el listado de categorías (ver NameOrRecipesListing).
const CATEGORY_LISTING = {
  fetchPage: getCategoryListing,
  title: 'Categorías para',
  allTitle: 'Todas las categorías',
  plural: 'categorías',
  formatSummary: (total) => `${total} ${total === 1 ? 'categoría encontrada' : 'categorías encontradas'}`,
  allLabel: 'Todas',
  withRecipesLabel: 'Con recetas',
  gridLayout: 'cards',
  renderItem: (category, term, index) => (
    <CategoryResultItem
      key={category.id}
      category={category}
      term={term}
      accent={CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length]}
      variant="card"
    />
  ),
};

// Qué pide y cómo dibuja el listado de usuarios.
const USER_LISTING = {
  fetchPage: getUserListing,
  title: 'Perfiles para',
  allTitle: 'Todos los perfiles',
  plural: 'perfiles',
  formatSummary: (total) => `${total} ${total === 1 ? 'perfil encontrado' : 'perfiles encontrados'}`,
  allLabel: 'Todos',
  withRecipesLabel: 'Con recetas publicadas',
  gridLayout: 'profiles',
  renderItem: (user, term) => <UserProfileCard key={user.id} user={user} term={term} />,
};

function SearchListingPage() {
  const { searchType } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const term = (searchParams.get('q') ?? '').trim();

  // Un tipo inexistente en la URL (ej. /buscar/cualquiera) vuelve a la página de resultados.
  if (!Object.values(SEARCH_TYPES).includes(searchType)) {
    return <Navigate to={SEARCH_PAGE_PATH} replace />;
  }

  return (
    <div className="SearchListingPage">
      {/* key: si cambia lo buscado, la barra se vuelve a montar con el texto nuevo. */}
      <SearchNavbar key={term} initialQuery={term} searchType={searchType} />

      {searchType === SEARCH_TYPES.recipes ? (
        <RecipeListing
          filters={parseRecipeFilters(searchParams)}
          onFiltersChange={(filters) => setSearchParams(recipeFiltersToParams(filters))}
        />
      ) : (
        // key: al pasar de categorías a usuarios el listado arranca de cero (sin la
        // respuesta del otro tipo, que podría tener la misma consulta).
        <NameOrRecipesListing
          key={searchType}
          config={searchType === SEARCH_TYPES.categories ? CATEGORY_LISTING : USER_LISTING}
          filters={parseNameOrRecipesFilters(searchParams)}
          onFiltersChange={(filters) => setSearchParams(nameOrRecipesFiltersToParams(filters))}
        />
      )}
    </div>
  );
}

export default SearchListingPage;
