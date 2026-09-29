// Buscador por nombre dentro de un listado (ej. "Buscar en tus recetas guardadas"). A
// diferencia de la barra de búsqueda general, no navega a otra página: cambia el filtro
// de texto del listado en el que está.
import { useEffect, useState } from 'react';
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_LENGTH } from '../models/searchModel.js';
import '../styles/_listing-controls.scss';

// Recibe: value (el texto que ya está filtrando el listado), onChange(texto), placeholder
// y label (para lectores de pantalla).
function ListingSearchInput({ value, onChange, placeholder, label }) {
  const [text, setText] = useState(value);

  // Espera a que el usuario deje de escribir para no pedir una página por cada letra (mismo
  // debounce que la barra de búsqueda). Con menos de SEARCH_MIN_LENGTH letras no se filtra.
  useEffect(() => {
    const trimmed = text.trim();
    const nextValue = trimmed.length >= SEARCH_MIN_LENGTH ? trimmed : '';
    if (nextValue === value) return undefined;
    const timerId = setTimeout(() => onChange(nextValue), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timerId);
    // Solo tiene que reaccionar a lo que se escribe, no a cada render del padre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="ListingSearchInput">
      <span className="material-symbols-outlined" aria-hidden="true">search</span>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
      />
      {text && (
        <button type="button" className="ListingSearchInput-clear" onClick={() => setText('')}>
          Limpiar
        </button>
      )}
    </div>
  );
}

export default ListingSearchInput;
