// Hook de los listados completos de búsqueda: pide una página al backend cada vez que
// cambian los filtros y descarta las respuestas que llegan tarde.
import { useEffect, useState } from 'react';

const EMPTY_RESPONSE = { query: null, data: null, error: '' };

// Recibe: fetchPage (función del servicio, ej. getRecipeListing) y apiQuery (el query
// string de los filtros actuales).
// Devuelve: { data, isLoading, error, retry, refresh }. Mientras llega la página nueva se
// sigue devolviendo la anterior, así el listado no desaparece en cada click de un filtro.
// retry vuelve a pedir después de un error (mostrando "cargando"); refresh vuelve a pedir
// la misma página sin sacarla de la pantalla (ej. después de quitar una receta guardada).
export function useSearchListing(fetchPage, apiQuery) {
  // Cada respuesta se guarda junto con la consulta que la generó: si no coincide con la
  // actual, todavía se está cargando (mismo criterio que useQuickSearch).
  const [response, setResponse] = useState(EMPTY_RESPONSE);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Si los filtros cambian antes de que llegue la respuesta, se ignora la vieja.
    let isStale = false;
    fetchPage(apiQuery)
      .then((data) => {
        if (!isStale) setResponse({ query: apiQuery, data, error: '' });
      })
      .catch((err) => {
        if (!isStale) setResponse({ query: apiQuery, data: null, error: err.message });
      });
    return () => {
      isStale = true;
    };
  }, [fetchPage, apiQuery, retryCount]);

  const isLoading = response.query !== apiQuery;

  const retry = () => {
    setResponse(EMPTY_RESPONSE);
    setRetryCount((count) => count + 1);
  };

  const refresh = () => setRetryCount((count) => count + 1);

  return { data: response.data, isLoading, error: isLoading ? '' : response.error, retry, refresh };
}
