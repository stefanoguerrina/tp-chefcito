// Modal reutilizable de "buscar y elegir" del editor de recetas: overlay + buscador +
// lista con scroll. Lo usan RecipeIngredientsStage (elegir ingrediente) y
// RecipeCategoryPicker (elegir categoría), cada uno pasando su propio catálogo ya
// filtrado (sin los que la receta ya tiene).
import { useEffect, useRef, useState } from 'react';
import '../styles/_recipe-search-modal.scss';

// Recibe: title y placeholder (textos propios de cada uso), items (catálogo ya
// filtrado, con { id, name, ... }), emptyMessage (sin resultados de búsqueda),
// allPickedMessage (no queda ningún item disponible), renderMeta (opcional, etiqueta
// extra por item, ej. la unidad de un ingrediente), onSelect y onClose.
function RecipeSearchModal({ title, placeholder, items, emptyMessage, allPickedMessage, renderMeta, onSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  // Difuminado de abajo: solo se muestra si de verdad queda contenido tapado por el
  // scroll, no todo el tiempo (si no, se ve raro con listas cortas que ya entran enteras).
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const listRef = useRef(null);

  const normalizedQuery = searchTerm.trim().toLowerCase();
  const results = normalizedQuery
    ? items.filter((item) => item.name.toLowerCase().includes(normalizedQuery))
    : items;

  const updateHasMoreBelow = () => {
    const list = listRef.current;
    if (!list) return;
    setHasMoreBelow(list.scrollHeight - list.scrollTop - list.clientHeight > 4);
  };

  // Recalcula cuando cambian los resultados (al tipear en el buscador), no solo al abrir.
  useEffect(() => {
    updateHasMoreBelow();
  }, [results.length]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') onClose();
  };

  return (
    <div className="RecipeSearchModal-overlay" onClick={onClose}>
      <div
        className="RecipeSearchModal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-search-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="RecipeSearchModal-header">
          <h3 id="recipe-search-modal-title">{title}</h3>
          <button type="button" className="RecipeSearchModal-closeButton" onClick={onClose} aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="RecipeSearchModal-searchWrapper">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            autoFocus
          />
        </div>

        <ul ref={listRef} className="RecipeSearchModal-list" onScroll={updateHasMoreBelow}>
          {results.length === 0 && (
            <li className="RecipeSearchModal-empty">{items.length === 0 ? allPickedMessage : emptyMessage}</li>
          )}
          {results.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => onSelect(item)}>
                <span>{item.name}</span>
                {renderMeta ? renderMeta(item) : null}
              </button>
            </li>
          ))}
        </ul>

        {hasMoreBelow && <div className="RecipeSearchModal-fade" aria-hidden="true" />}
      </div>
    </div>
  );
}

export default RecipeSearchModal;
