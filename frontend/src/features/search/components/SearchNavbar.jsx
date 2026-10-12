// Barra de búsqueda (home y página de resultados): input con botón de limpiar y de
// buscar, y debajo el panel de resultados rápidos que se va actualizando mientras el
// usuario escribe. Enter (o la lupa) lleva a la página de resultados /buscar.
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuickSearchPanel from './QuickSearchPanel.jsx';
import { useQuickSearch } from '../hooks/useQuickSearch.js';
import { buildSearchPagePath, SEARCH_MAX_LENGTH, SEARCH_MIN_LENGTH } from '../models/searchModel.js';
import '../styles/_search-navbar.scss';

const PANEL_ID = 'quick-search-panel';

// Cuántos píxeles hay que bajar para que la barra empiece a difuminar el fondo.
const SCROLL_FADE_THRESHOLD = 8;

// Recibe (opcionales): initialQuery, el texto con el que arranca el input (en /buscar, lo
// que se buscó, para poder corregirlo sin volver a escribirlo todo), y searchType: en un
// listado completo (ej. /buscar/recetas), Enter busca en ese mismo listado en vez de
// volver a la página de resultados general.
function SearchNavbar({ initialQuery = '', searchType }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // true una vez que se scrolleó: recién ahí la barra difumina lo que pasa por detrás
  // (arriba de todo no tapa nada, así que no hace falta).
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > SCROLL_FADE_THRESHOLD);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  // Con el panel cerrado no se pide nada: en /buscar el input arranca lleno y, si no, se
  // haría la misma búsqueda que ya está haciendo la página.
  const { results, resultsTerm, isLoading, error, retry } = useQuickSearch(isPanelOpen ? query : '');

  const term = query.trim();
  const canSearch = term.length >= SEARCH_MIN_LENGTH;
  const isPanelVisible = isPanelOpen && canSearch;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_FADE_THRESHOLD);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cierra el panel al tocar cualquier parte de la pantalla fuera del buscador. Se
  // escucha en document porque el click "afuera" no pasa por ningún handler de React
  // de este componente. Solo mientras el panel está abierto.
  useEffect(() => {
    if (!isPanelVisible) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsPanelOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isPanelVisible]);

  const handleChange = (event) => {
    setQuery(event.target.value);
    setIsPanelOpen(true);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') setIsPanelOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // Enter o la lupa: el usuario ya terminó de escribir y quiere ver todos los resultados.
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSearch) return;
    setIsPanelOpen(false);
    navigate(buildSearchPagePath({ term, type: searchType }));
  };

  const handleNavigate = () => setIsPanelOpen(false);

  return (
    <div className={`SearchNavbar${isScrolled ? ' SearchNavbar--scrolled' : ''}`}>
      <div className="SearchNavbar-container" ref={containerRef}>
        <form className="SearchNavbar-form" role="search" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="SearchNavbar-input"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsPanelOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Buscá recetas, categorías o usuarios..."
            aria-label="Buscar recetas, categorías o usuarios"
            aria-controls={PANEL_ID}
            aria-expanded={isPanelVisible}
            maxLength={SEARCH_MAX_LENGTH}
            enterKeyHint="search"
            autoComplete="off"
          />
          {query && (
            <button type="button" className="SearchNavbar-clear" onClick={handleClear} aria-label="Limpiar búsqueda" title="Limpiar búsqueda">
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          )}
          <button
            type="submit"
            className="SearchNavbar-submit"
            disabled={!canSearch}
            aria-label="Buscar"
            title={canSearch ? 'Buscar' : `Escribí al menos ${SEARCH_MIN_LENGTH} letras`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">search</span>
          </button>
        </form>

        {isPanelVisible && (
          <QuickSearchPanel
            id={PANEL_ID}
            query={query}
            results={results}
            resultsTerm={resultsTerm}
            isLoading={isLoading}
            error={error}
            onRetry={retry}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
  );
}

export default SearchNavbar;
