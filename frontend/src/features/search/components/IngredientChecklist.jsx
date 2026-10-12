// Filtro "Ingredientes" del panel de filtros de recetas: un buscador para achicar la
// lista y un checkbox por ingrediente. Muestra las recetas que llevan TODOS los elegidos.
import { useState } from 'react';

// Recibe: ingredients ([{ id, name }]), selectedIds (ids elegidos) y onChange(ids).
function IngredientChecklist({ ingredients, selectedIds, onChange }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  // Los elegidos van siempre arriba, así no se pierden de vista al achicar la lista.
  const visibleIngredients = ingredients
    .filter((ingredient) => selectedIds.includes(ingredient.id) || ingredient.name.toLowerCase().includes(normalizedQuery))
    .sort((a, b) => Number(selectedIds.includes(b.id)) - Number(selectedIds.includes(a.id)));

  const handleToggle = (idIngredient) => {
    onChange(
      selectedIds.includes(idIngredient)
        ? selectedIds.filter((id) => id !== idIngredient)
        : [...selectedIds, idIngredient]
    );
  };

  return (
    <fieldset className="FilterGroup">
      <legend className="FilterGroup-title">Ingredientes</legend>

      <div className="IngredientChecklist-search">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrar ingrediente..."
          aria-label="Filtrar ingredientes"
        />
        <span className="material-symbols-outlined" aria-hidden="true">search</span>
      </div>

      <div className="FilterGroup-options IngredientChecklist-list">
        {visibleIngredients.length === 0 && <p className="IngredientChecklist-empty">No hay ingredientes con ese nombre.</p>}
        {visibleIngredients.map((ingredient) => (
          <label key={ingredient.id} className="FilterGroup-option">
            <input
              type="checkbox"
              checked={selectedIds.includes(ingredient.id)}
              onChange={() => handleToggle(ingredient.id)}
            />
            <span>{ingredient.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default IngredientChecklist;
