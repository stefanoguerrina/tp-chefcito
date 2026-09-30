// Panel de filtros del listado de recetas (/buscar/recetas): tiempo de preparación,
// valoración, necesidades nutricionales, categoría e ingredientes. En desktop es una columna fija a la izquierda;
// en mobile se despliega con el botón "Filtros" para no tapar los resultados.
import { useState } from 'react';
import FilterRadioGroup from './FilterRadioGroup.jsx';
import IngredientChecklist from './IngredientChecklist.jsx';
import NutritionGoalsChecklist from './NutritionGoalsChecklist.jsx';
import { RATING_FILTER_OPTIONS, TIME_FILTER_OPTIONS } from '../models/searchListingModel.js';
import '../styles/_recipe-filters-panel.scss';

// Recibe: filters (ver parseRecipeFilters), categories e ingredients (catálogos [{ id,
// name }]), activeCount (cuántos filtros hay activos), onChange(cambios) y onClear().
function RecipeFiltersPanel({ filters, categories, ingredients, activeCount, onChange, onClear }) {
  const [isOpenOnMobile, setIsOpenOnMobile] = useState(false);

  // Los radios trabajan con strings: '' = "Todas", y el id de categoría como texto.
  const categoryOptions = [
    { value: '', label: 'Todas' },
    ...categories.map((category) => ({ value: String(category.id), label: category.name })),
  ];

  return (
    <aside className={`RecipeFiltersPanel${isOpenOnMobile ? ' RecipeFiltersPanel--open' : ''}`} aria-label="Filtros">
      <button
        type="button"
        className="RecipeFiltersPanel-mobileToggle"
        aria-expanded={isOpenOnMobile}
        onClick={() => setIsOpenOnMobile((isOpen) => !isOpen)}
      >
        <span className="material-symbols-outlined" aria-hidden="true">tune</span>
        Filtros{activeCount > 0 && ` (${activeCount})`}
        <span className="material-symbols-outlined" aria-hidden="true">
          {isOpenOnMobile ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      <div className="RecipeFiltersPanel-content">
        <div className="RecipeFiltersPanel-header">
          <span className="RecipeFiltersPanel-heading">
            <span className="material-symbols-outlined" aria-hidden="true">tune</span>
            Filtros
          </span>
          {activeCount > 0 && (
            <button type="button" className="RecipeFiltersPanel-clear" onClick={onClear}>
              Limpiar filtros
            </button>
          )}
        </div>

        <FilterRadioGroup
          title="Tiempo de preparación"
          name="recipe-time"
          options={TIME_FILTER_OPTIONS}
          value={filters.time}
          onChange={(time) => onChange({ time })}
        />

        <FilterRadioGroup
          title="Valoración"
          name="recipe-rating"
          options={RATING_FILTER_OPTIONS}
          value={filters.rating}
          onChange={(rating) => onChange({ rating })}
        />

        <NutritionGoalsChecklist
          selectedValues={filters.nutritionGoals}
          onChange={(nutritionGoals) => onChange({ nutritionGoals })}
        />

        {categories.length > 0 && (
          <FilterRadioGroup
            title="Categoría"
            name="recipe-category"
            options={categoryOptions}
            value={filters.categoryId ? String(filters.categoryId) : ''}
            onChange={(value) => onChange({ categoryId: Number(value) || null })}
          />
        )}

        {ingredients.length > 0 && (
          <IngredientChecklist
            ingredients={ingredients}
            selectedIds={filters.ingredientIds}
            onChange={(ingredientIds) => onChange({ ingredientIds })}
          />
        )}
      </div>
    </aside>
  );
}

export default RecipeFiltersPanel;
