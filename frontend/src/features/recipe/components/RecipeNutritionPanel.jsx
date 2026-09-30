// Valores nutricionales del detalle de receta: tabla "nutriente | por porción" calculada
// por el backend a partir de las cantidades de la receta y la tabla nutricional de cada
// ingrediente (ver recipeNutritionService.ts). Avisa qué ingredientes no se pudieron contar
// y qué valores pueden ser mayores (algún ingrediente no tiene ese nutriente cargado).
import { formatNutrientAmount, formatServings } from '../models/recipeModel.js';
import '../styles/_recipe-nutrition-panel.scss';

// Recibe: nutrition ({ servings, nutrients: [{ name, unit, total, perServing, isComplete }],
// missingIngredients, isComplete }, tal como lo devuelve GET /api/recipes/:id).
function RecipeNutritionPanel({ nutrition }) {
  const nutrients = nutrition?.nutrients ?? [];
  const servingsText = formatServings(nutrition?.servings);
  const hasPartialValues = nutrients.some((nutrient) => !nutrient.isComplete);

  return (
    <section className="RecipeDetailCard RecipeNutritionPanel">
      <div className="RecipeDetailCard-header">
        <div>
          <h2 className="RecipeDetailCard-title">Valores nutricionales</h2>
          <p className="RecipeDetailCard-subtitle">
            {servingsText
              ? `Por porción · la receta rinde ${servingsText}`
              : 'De la receta completa (no indica cuántas porciones rinde)'}
          </p>
        </div>
      </div>

      {nutrients.length === 0 ? (
        <p className="RecipeDetailCard-empty">
          Los ingredientes de esta receta todavía no tienen valores nutricionales cargados.
        </p>
      ) : (
        <table className="RecipeNutritionPanel-table">
          <thead>
            <tr>
              <th scope="col">Nutriente</th>
              <th scope="col">{servingsText ? 'Por porción' : 'Total'}</th>
            </tr>
          </thead>
          <tbody>
            {nutrients.map((nutrient) => (
              <tr key={nutrient.name}>
                <th scope="row">{nutrient.name}</th>
                <td>
                  {formatNutrientAmount(nutrient.perServing, nutrient.unit)}
                  {!nutrient.isComplete && (
                    <span className="RecipeNutritionPanel-mark" title="Puede ser mayor: faltan datos de algún ingrediente">
                      *
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {nutrients.length > 0 && (
        <div className="RecipeNutritionPanel-notes">
          {nutrition.missingIngredients.length > 0 && (
            <p>
              No incluye {nutrition.missingIngredients.join(', ')}: no tiene cantidad o valores nutricionales cargados.
            </p>
          )}
          {hasPartialValues && <p>* Puede ser mayor: algún ingrediente no tiene ese valor cargado.</p>}
          <p>Valores aproximados, calculados a partir de los ingredientes.</p>
        </div>
      )}
    </section>
  );
}

export default RecipeNutritionPanel;
