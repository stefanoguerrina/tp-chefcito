// Bloque que se suma a cada receta cuando se filtra por necesidades nutricionales: el valor
// por porción de los nutrientes filtrados (ej. "Proteínas 38,7 gr"), para que se vea por
// qué la receta cumple el filtro.
import { formatNutrientAmount } from '../../recipe/models/recipeModel.js';
import '../styles/_nutrition-highlights.scss';

// Recibe: highlights ([{ name, unit, perServing }], ver createRecipeListing).
function NutritionHighlights({ highlights }) {
  return (
    <div className="NutritionHighlights">
      <p className="NutritionHighlights-title">
        <span className="material-symbols-outlined" aria-hidden="true">nutrition</span>
        Por porción
      </p>
      <ul className="NutritionHighlights-list">
        {highlights.map((nutrient) => (
          <li key={nutrient.name}>
            {nutrient.name} <strong>{formatNutrientAmount(nutrient.perServing, nutrient.unit)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NutritionHighlights;
