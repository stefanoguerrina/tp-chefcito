// Tarjeta compacta de un ingrediente ya elegido para la receta (el ingrediente en sí se
// elige desde AddIngredientModal, no acá). Muestra su nombre y cantidad; la cantidad es
// texto de solo lectura hasta que se toca "Editar", que la vuelve un campo editable (no
// se puede escribir tocándola directamente, para no confundirla con texto suelto). No se
// guarda una unidad aparte por receta: es la que ya tiene el ingrediente en el catálogo.
import { useState } from 'react';

// Recibe: item ({ idIngredient, quantity }), ingredientsCatalog (para mostrar nombre y
// unidad), canDelete, onChange (cambios de cantidad) y onDelete.
function RecipeIngredientCard({ item, ingredientsCatalog, canDelete, onChange, onDelete }) {
  const ingredient = ingredientsCatalog.find((ing) => String(ing.id) === item.idIngredient);
  // Si todavía no tiene cantidad (recién agregado desde el modal), arranca directamente
  // en modo edición: no tiene sentido obligar a tocar "Editar" antes de poder escribirla.
  const [isEditingQuantity, setIsEditingQuantity] = useState(!item.quantity);

  // Puede pasar en el instante entre elegirlo en el modal y que llegue el catálogo
  // actualizado; no debería quedar así, pero mejor no romper el render.
  if (!ingredient) return null;

  const handleToggleEdit = () => setIsEditingQuantity((value) => !value);

  // Enter confirma y vuelve al texto (el valor ya se guardó en cada tecla via onChange).
  const handleQuantityKeyDown = (event) => {
    if (event.key === 'Enter') setIsEditingQuantity(false);
  };

  const quantityText = item.quantity
    ? `${item.quantity}${ingredient.unitOfMeasure ? ` ${ingredient.unitOfMeasure}` : ''}`
    : 'Sin cantidad cargada';

  return (
    <div className="RecipeIngredientCard">
      <div className="RecipeIngredientCard-info">
        <span className="RecipeIngredientCard-dot" />
        <div className="RecipeIngredientCard-details">
          <span className="RecipeIngredientCard-name">{ingredient.name}</span>

          {isEditingQuantity ? (
            <span className="RecipeIngredientCard-qtyRow">
              <input
                type="number"
                min="0.01"
                step="0.01"
                autoFocus
                value={item.quantity}
                onChange={(e) => onChange({ quantity: e.target.value })}
                onKeyDown={handleQuantityKeyDown}
                onBlur={() => setIsEditingQuantity(false)}
                placeholder="Cantidad"
                aria-label={`Cantidad requerida de ${ingredient.name}`}
              />
              {ingredient.unitOfMeasure && <span>{ingredient.unitOfMeasure}</span>}
            </span>
          ) : (
            <span className="RecipeIngredientCard-qtyText">{quantityText}</span>
          )}
        </div>
      </div>

      <div className="RecipeIngredientCard-actions">
        <button
          type="button"
          className="RecipeIngredientCard-iconButton"
          title={isEditingQuantity ? 'Listo' : 'Editar cantidad'}
          // Evita que el mousedown le saque el foco al input antes del click: si no,
          // el onBlur del input cierra la edición primero y el toggle la vuelve a abrir.
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleToggleEdit}
        >
          <span className="material-symbols-outlined">{isEditingQuantity ? 'check' : 'edit'}</span>
        </button>
        <button
          type="button"
          className="RecipeIngredientCard-iconButton RecipeIngredientCard-iconButton--danger"
          title={canDelete ? 'Eliminar' : 'La receta debe tener al menos un ingrediente'}
          disabled={!canDelete}
          onClick={onDelete}
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
}

export default RecipeIngredientCard;
