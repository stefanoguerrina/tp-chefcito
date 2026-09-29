// Página de resultados de búsqueda (ruta /buscar?q=texto): se llega con Enter o la lupa
// de la barra de búsqueda. Muestra las primeras categorías, recetas y perfiles que
// coinciden; si en una sección hay más de los que entran, el último lugar es una card
// "+N más" que lleva al listado completo.
import { useSearchParams } from 'react-router-dom';
import SearchNavbar from '../components/SearchNavbar.jsx';
import SearchResultsSection from '../components/SearchResultsSection.jsx';
import SearchMoreCard from '../components/SearchMoreCard.jsx';
import CategoryResultItem from '../components/CategoryResultItem.jsx';
import UserResultItem from '../components/UserResultItem.jsx';
import RecipeSuggestions from '../components/RecipeSuggestions.jsx';
import AssistantBanner from '../components/AssistantBanner.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import { useQuickSearch } from '../hooks/useQuickSearch.js';
import {
  buildSearchPagePath, CATEGORY_ACCENTS, countQuickSearchResults, isQuickSearchEmpty,
  splitSectionForPreview, SEARCH_MIN_LENGTH, SEARCH_TYPES,
} from '../models/searchModel.js';
import '../styles/_search-results-page.scss';

// Lugares de las grillas de categorías y perfiles (3 columnas en desktop).
const CATEGORY_SLOTS = 3;
const USER_SLOTS = 3;

function SearchResultsPage() {
  // Lo buscado vive en la URL (?q=): así la búsqueda se puede recargar, compartir y
  // volver a ella con "Atrás".
  const [searchParams] = useSearchParams();
  const term = (searchParams.get('q') ?? '').trim();
  // Sin debounce: acá el texto ya está completo, no se está escribiendo.
  const { results, isLoading, error, retry } = useQuickSearch(term, { debounceMs: 0 });

  const categories = results && splitSectionForPreview(results.categories, CATEGORY_SLOTS);
  const users = results && splitSectionForPreview(results.users, USER_SLOTS);
  const hasResults = results && !isLoading && !error && !isQuickSearchEmpty(results);
  const totalResults = results ? countQuickSearchResults(results) : 0;

  return (
    <div className="SearchResultsPage">
      {/* key: si cambia lo buscado (una búsqueda nueva, o "Atrás" del navegador) la barra
          se vuelve a montar con el texto nuevo en el input. */}
      <SearchNavbar key={term} initialQuery={term} />

      {term.length < SEARCH_MIN_LENGTH && (
        <div className="SearchResultsPage-empty">
          <span className="material-symbols-outlined" aria-hidden="true">manage_search</span>
          <p>Escribí al menos {SEARCH_MIN_LENGTH} letras en el buscador para ver resultados.</p>
        </div>
      )}

      {isLoading && <p className="SearchResultsPage-status">Buscando resultados...</p>}

      {error && <ErrorState title="No pudimos completar la búsqueda" message={error} onRetry={retry} />}

      {results && !isLoading && !error && isQuickSearchEmpty(results) && (
        <div className="SearchResultsPage-empty">
          <span className="material-symbols-outlined" aria-hidden="true">search_off</span>
          <p>
            No encontramos resultados para <strong>«{term}»</strong>.
          </p>
          <p>Probá con otra palabra o revisá cómo está escrita.</p>
        </div>
      )}

      {hasResults && (
        <>
          <header className="SearchResultsPage-header">
            <h1 className="SearchResultsPage-title">
              Resultados para <span>«{term}»</span>
            </h1>
            <p className="SearchResultsPage-summary">
              Encontramos <strong>{totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}</strong>
            </p>
          </header>

          {categories.visibleItems.length > 0 && (
            <SearchResultsSection title="Categorías sugeridas" total={results.categories.total} layout="categories">
              {categories.visibleItems.map((category, index) => (
                <CategoryResultItem
                  key={category.id}
                  category={category}
                  term={term}
                  accent={CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length]}
                  variant="card"
                />
              ))}
              {categories.hiddenCount > 0 && (
                <SearchMoreCard
                  hiddenCount={categories.hiddenCount}
                  label={categories.hiddenCount === 1 ? 'Categoría más' : 'Categorías más'}
                  actionLabel="Ver todas"
                  to={buildSearchPagePath({ term, type: SEARCH_TYPES.categories })}
                />
              )}
            </SearchResultsSection>
          )}

          {results.recipes.items.length > 0 && (
            <RecipeSuggestions
              section={results.recipes}
              seeAllTo={buildSearchPagePath({ term, type: SEARCH_TYPES.recipes })}
            />
          )}

          {users.visibleItems.length > 0 && (
            <SearchResultsSection title="Perfiles sugeridos" total={results.users.total} layout="users">
              {users.visibleItems.map((user) => (
                <UserResultItem key={user.id} user={user} term={term} variant="card" />
              ))}
              {users.hiddenCount > 0 && (
                <SearchMoreCard
                  hiddenCount={users.hiddenCount}
                  label={users.hiddenCount === 1 ? 'Perfil más' : 'Perfiles más'}
                  actionLabel="Ver todos"
                  to={buildSearchPagePath({ term, type: SEARCH_TYPES.users })}
                />
              )}
            </SearchResultsSection>
          )}

          <AssistantBanner
            title={`¿No encontrás la receta de «${term}» que buscabas?`}
            description="Pedile una idea a Chefcito Bot. Decile qué ingredientes tenés en la alacena y te arma una receta personalizada en segundos."
          />
        </>
      )}
    </div>
  );
}

export default SearchResultsPage;
