// Hook de búsqueda: pide resultados al backend para un texto, descartando respuestas
// viejas. Lo usan el panel de la barra (mientras se escribe, con debounce) y la página
// de resultados /buscar (sin esperar: el texto ya está completo en la URL).
import { useEffect, useState } from 'react';
import { quickSearch } from '../services/searchService.js';
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_LENGTH } from '../models/searchModel.js';

// Estado sin ninguna respuesta todavía.
const EMPTY_RESPONSE = { term: '', results: null, error: '' };

// Recibe: query (el texto a buscar, tal cual está en el input o en la URL) y, opcional,
// { debounceMs }: cuánto esperar después del último cambio antes de pedir (0 = enseguida).
// Devuelve: { results, resultsTerm, isLoading, error, retry }.
//   - results: la última respuesta recibida ({ categories, recipes, users }) o null. Mientras
//     llega la del texto nuevo se sigue devolviendo la anterior, así el panel no parpadea
//     vacío en cada tecla; resultsTerm dice a qué texto corresponde (para resaltarlo).
//   - retry: vuelve a pedir la búsqueda actual después de un error.
export function useQuickSearch(query, { debounceMs = SEARCH_DEBOUNCE_MS } = {}) {
  const term = query.trim();
  // Cada respuesta se guarda junto con el texto que la generó: comparándolo con el texto
  // actual se sabe si todavía se está buscando, sin un estado "loading" aparte.
  const [response, setResponse] = useState(EMPTY_RESPONSE);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (term.length < SEARCH_MIN_LENGTH) return undefined;

    // Si el usuario sigue escribiendo antes de que llegue la respuesta, este efecto se
    // limpia: el timer pendiente se cancela y una respuesta que llegue tarde se ignora
    // (si no, una búsqueda vieja y lenta podría pisar a una nueva más rápida).
    let isStale = false;
    const timerId = setTimeout(() => {
      quickSearch(term)
        .then((results) => {
          if (!isStale) setResponse({ term, results, error: '' });
        })
        .catch((err) => {
          if (!isStale) setResponse({ term, results: null, error: err.message });
        });
    }, debounceMs);

    return () => {
      isStale = true;
      clearTimeout(timerId);
    };
  }, [term, retryCount, debounceMs]);

  const isLoading = term.length >= SEARCH_MIN_LENGTH && response.term !== term;

  const retry = () => {
    // Borrar la respuesta con error hace que isLoading vuelva a ser true enseguida.
    setResponse(EMPTY_RESPONSE);
    setRetryCount((count) => count + 1);
  };

  return {
    results: response.results,
    resultsTerm: response.term,
    isLoading,
    error: isLoading ? '' : response.error,
    retry,
  };
}
