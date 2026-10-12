// Panel desplegable de la búsqueda rápida: aparece debajo del buscador mientras se
// escribe y muestra las primeras coincidencias en categorías, recetas y usuarios.
// Solo muestra lo que recibe: el pedido al backend lo hace useQuickSearch (en SearchNavbar).
import ErrorState from '../../../core/components/ErrorState.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import QuickSearchSection from './QuickSearchSection.jsx';
import CategoryResultItem from './CategoryResultItem.jsx';
import RecipeResultItem from './RecipeResultItem.jsx';
import UserResultItem from './UserResultItem.jsx';
import { buildSearchPagePath, CATEGORY_ACCENTS, isQuickSearchEmpty, SEARCH_TYPES } from '../models/searchModel.js';
import '../styles/_quick-search-panel.scss';

// Recibe: id (para aria-controls del input), query (lo escrito), results / resultsTerm /
// isLoading / error / onRetry (estado de useQuickSearch) y onNavigate (cierra el panel
// cuando se elige un resultado o un "Ver todas").
function QuickSearchPanel({ id, query, results, resultsTerm, isLoading, error, onRetry, onNavigate }) {
  const term = query.trim();
  const isEmpty = results && !isLoading && isQuickSearchEmpty(results);

  return (
    <div id={id} className="QuickSearchPanel" role="region" aria-label="Resultados rápidos" aria-busy={isLoading}>
      <div className="QuickSearchPanel-header">
        <span className="QuickSearchPanel-headerText">
          <span className="material-symbols-outlined" aria-hidden="true">filter_list</span>
          <span>
            Resultados rápidos para <strong>"{term}"</strong>
          </span>
        </span>
        {isLoading ? (
          <span className="QuickSearchPanel-status">Buscando...</span>
        ) : (
          <span className="QuickSearchPanel-hint">ESC para cerrar</span>
        )}
      </div>

      <div className="QuickSearchPanel-body">
        {error && <ErrorState title="No pudimos completar la búsqueda" message={error} onRetry={onRetry} />}

        {!error && !results && isLoading && <LoadingState message="Buscando resultados..." className="LoadingState--compact" />}

        {isEmpty && (
          <div className="QuickSearchPanel-empty">
            <span className="material-symbols-outlined" aria-hidden="true">search_off</span>
            <p>
              No encontramos categorías, recetas ni usuarios para <strong>"{resultsTerm}"</strong>.
            </p>
          </div>
        )}

        {!error && results && !isEmpty && (
          <>
            {results.categories.items.length > 0 && (
              <QuickSearchSection
                title="Categorías"
                total={results.categories.total}
                seeAllLabel="Ver todas las categorías"
                seeAllTo={buildSearchPagePath({ term: resultsTerm, type: SEARCH_TYPES.categories })}
                layout="grid3"
                onNavigate={onNavigate}
              >
                {results.categories.items.map((category, index) => (
                  <CategoryResultItem
                    key={category.id}
                    category={category}
                    term={resultsTerm}
                    accent={CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length]}
                    onNavigate={onNavigate}
                  />
                ))}
              </QuickSearchSection>
            )}

            {results.recipes.items.length > 0 && (
              <QuickSearchSection
                title="Recetas"
                total={results.recipes.total}
                seeAllLabel="Ver todas las recetas"
                seeAllTo={buildSearchPagePath({ term: resultsTerm, type: SEARCH_TYPES.recipes })}
                layout="grid2"
                onNavigate={onNavigate}
              >
                {results.recipes.items.map((recipe) => (
                  <RecipeResultItem key={recipe.id} recipe={recipe} term={resultsTerm} onNavigate={onNavigate} />
                ))}
              </QuickSearchSection>
            )}

            {results.users.items.length > 0 && (
              <QuickSearchSection
                title="Usuarios"
                total={results.users.total}
                seeAllLabel="Ver todos los usuarios"
                seeAllTo={buildSearchPagePath({ term: resultsTerm, type: SEARCH_TYPES.users })}
                layout="list"
                onNavigate={onNavigate}
              >
                {results.users.items.map((user) => (
                  <UserResultItem key={user.id} user={user} term={resultsTerm} onNavigate={onNavigate} />
                ))}
              </QuickSearchSection>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default QuickSearchPanel;
