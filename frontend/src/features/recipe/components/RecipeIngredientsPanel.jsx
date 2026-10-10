// Ingredientes del detalle de receta: lista donde el usuario puede ir tildando lo que ya
// tiene listo, con la cantidad de cada uno y la etiqueta "Lo tenés" en los que ya tiene en
// su inventario. Lo tildado no se guarda: es una ayuda para cocinar, se reinicia al salir.
import { useState } from 'react';
import '../styles/_recipe-ingredients-panel.scss';

// Recibe: la cantidad cruda (Prisma manda los Decimal como string, ej. "400.00").
// Devuelve: el número listo para mostrar, sin decimales de más ("400", "1.5"), o null si
// el ingrediente no tiene cantidad cargada.
const formatQuantity = (requiredQuantity) =>
  requiredQuantity == null ? null : String(Number(parseFloat(requiredQuantity).toFixed(2)));

// Recibe: ingredients (recipeingredient[] crudo, con su ingredient anidado) y
// pantryIngredientIds (Set con los ids de ingredientes que el usuario tiene en su inventario).
function RecipeIngredientsPanel({ ingredients, pantryIngredientIds }) {
  // Ids de los ingredientes que el usuario ya tildó como listos.
  const [checkedIds, setCheckedIds] = useState(new Set());

  // Tilda o destilda un ingrediente (un Set nuevo, React necesita otra referencia).
  const handleToggle = (idIngredient) =>
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idIngredient)) next.delete(idIngredient);
      else next.add(idIngredient);
      return next;
    });

  return (
    <section className="RecipeDetailCard RecipeIngredientsPanel">
      <div className="RecipeDetailCard-header">
        <div>
          <h2 className="RecipeDetailCard-title">Ingredientes</h2>
          <p className="RecipeDetailCard-subtitle">Marcá los ingredientes que ya tenés listos</p>
        </div>
      </div>

      {ingredients.length === 0 ? (
        <p className="RecipeDetailCard-empty">Esta receta todavía no tiene ingredientes cargados.</p>
      ) : (
        <ul className="RecipeIngredientsPanel-list">
          {ingredients.map((item) => {
            const isChecked = checkedIds.has(item.idIngredient);
            const quantity = formatQuantity(item.requiredQuantity);
            return (
              <li
                key={item.idIngredient}
                className={`RecipeIngredientsPanel-item${isChecked ? ' RecipeIngredientsPanel-item--checked' : ''}`}
              >
                <label className="RecipeIngredientsPanel-check">
                  <input type="checkbox" checked={isChecked} onChange={() => handleToggle(item.idIngredient)} />
                  <span className="RecipeIngredientsPanel-name">
                    {item.ingredient?.name ?? `Ingrediente #${item.idIngredient}`}
                  </span>
                </label>
                <span className="RecipeIngredientsPanel-right">
                  {quantity && (
                    <span className="RecipeIngredientsPanel-quantity">
                      {quantity} {item.ingredient?.unitOfMeasure ?? ''}
                    </span>
                  )}
                  {pantryIngredientIds.has(item.idIngredient) && (
                    <span className="RecipeIngredientsPanel-pantry" title="Lo tenés en tu inventario">
                      Lo tenés
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default RecipeIngredientsPanel;
