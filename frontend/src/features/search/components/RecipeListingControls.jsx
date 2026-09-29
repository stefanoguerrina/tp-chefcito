// Controles del encabezado del listado de recetas: "Todo" / "Con mi despensa", el orden y
// la vista (cuadrícula o lista).
import ListingModeToggle from './ListingModeToggle.jsx';
import ListingSortSelect from './ListingSortSelect.jsx';
import ViewModeSwitch from './ViewModeSwitch.jsx';
import { getRecipeSortOptions } from '../models/searchListingModel.js';

// Recibe: filters (ver parseRecipeFilters), total (cantidad a mostrar en el botón activo, o
// undefined mientras carga), viewMode, onFiltersChange(cambios) y onViewModeChange(vista).
function RecipeListingControls({ filters, total, viewMode, onFiltersChange, onViewModeChange }) {
  return (
    <>
      <ListingModeToggle
        label="Qué recetas mostrar"
        value={filters.pantry}
        onChange={(pantry) => onFiltersChange({ pantry })}
        options={[
          { value: false, label: 'Todo', count: total },
          { value: true, label: 'Inventario', icon: 'kitchen', count: total },
        ]}
      />
      {/* Con la despensa, el orden lo define cuánto de cada receta tenés. */}
      {!filters.pantry && (
        <ListingSortSelect
          id="recipe-listing-sort"
          options={getRecipeSortOptions(filters)}
          value={filters.sort}
          onChange={(sort) => onFiltersChange({ sort })}
        />
      )}
      <ViewModeSwitch value={viewMode} onChange={onViewModeChange} />
    </>
  );
}

export default RecipeListingControls;
