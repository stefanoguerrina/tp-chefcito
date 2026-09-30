// Filtro "Necesidades nutricionales" del panel de filtros de recetas: un checkbox por
// necesidad (alta en proteínas, baja en calorías...). Si se eligen varias, la receta tiene
// que cumplir todas. Los límites son por porción y se ven al lado de cada opción.
import { NUTRITION_FILTER_OPTIONS } from '../models/searchListingModel.js';

// Recibe: selectedValues (valores elegidos, ej. ['proteica']) y onChange(valores).
function NutritionGoalsChecklist({ selectedValues, onChange }) {
  const handleToggle = (value) => {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((selected) => selected !== value)
        : [...selectedValues, value]
    );
  };

  return (
    <fieldset className="FilterGroup">
      <legend className="FilterGroup-title">Necesidades nutricionales</legend>

      <div className="FilterGroup-options">
        {NUTRITION_FILTER_OPTIONS.map((option) => (
          <label key={option.value} className="FilterGroup-option">
            <input
              type="checkbox"
              checked={selectedValues.includes(option.value)}
              onChange={() => handleToggle(option.value)}
            />
            <span>
              {option.label}
              <span className="FilterGroup-hint">{option.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default NutritionGoalsChecklist;
