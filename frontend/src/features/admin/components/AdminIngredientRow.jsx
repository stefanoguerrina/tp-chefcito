// Fila de la tabla de ingredientes del panel (AdminIngredientsTable): foto, nombre y código,
// categoría principal, unidad, en cuántas recetas se usa, cuántos valores nutricionales
// tiene y los botones de acción.
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';
import {
  getPrimaryCategory,
  getExtraCategoriesCount,
  formatIngredientCode,
} from '../models/adminIngredientsModel.js';

// Recibe: ingredient (crudo, con sus categorías y nutritionalvalue[]), colorIndex (color de
// su categoría, ver getIngredientColorIndex), recipesCount, isDeleting y los callbacks
// onEditCategories, onEdit y onDelete (reciben el ingrediente).
function AdminIngredientRow({ ingredient, colorIndex, recipesCount, isDeleting, onEditCategories, onEdit, onDelete }) {
  const primaryCategory = getPrimaryCategory(ingredient);
  const extraCategoriesCount = getExtraCategoriesCount(ingredient);
  // Vienen embebidos en cada ingrediente (GET /ingredients los incluye).
  const nutritionalValuesCount = ingredient.nutritionalvalue?.length ?? 0;

  return (
    <tr>
      <td>
        <div className="AdminIngredientsTable-ingredient">
          <span className="AdminIngredientsTable-thumb">
            {ingredient.imagePath ? (
              <img src={resolveImageUrl(ingredient.imagePath)} alt="" loading="lazy" />
            ) : (
              <span className="material-symbols-outlined" aria-hidden="true">grocery</span>
            )}
          </span>
          <span>
            <span className="AdminIngredientsTable-name">{ingredient.name}</span>
            <span className="AdminIngredientsTable-code">{formatIngredientCode(ingredient.id)}</span>
          </span>
        </div>
      </td>
      <td>
        <span className="AdminIngredientsTable-categoryBadge">
          <span className={`AdminIngredientsTable-categoryDot AdminIngredientsTable-categoryDot--${colorIndex}`} />
          {primaryCategory?.name ?? 'Sin categoría'}
        </span>
        {extraCategoriesCount > 0 && (
          <span className="AdminIngredientsTable-categoryExtra">+{extraCategoriesCount}</span>
        )}
      </td>
      <td className="AdminIngredientsTable-unit">{ingredient.unitOfMeasure || '—'}</td>
      <td className="AdminIngredientsTable-cell--center">
        <span className="AdminIngredientsTable-count">{recipesCount}</span>{' '}
        <span className="AdminIngredientsTable-countLabel">{recipesCount === 1 ? 'receta' : 'recetas'}</span>
      </td>
      <td className="AdminIngredientsTable-cell--center">
        <span className="AdminIngredientsTable-count">{nutritionalValuesCount}</span>{' '}
        <span className="AdminIngredientsTable-countLabel">{nutritionalValuesCount === 1 ? 'valor' : 'valores'}</span>
      </td>
      <td className="AdminIngredientsTable-cell--center">
        <div className="AdminIngredientsTable-rowActions">
          <button
            type="button"
            className="AdminIngredientsTable-iconButton"
            onClick={() => onEditCategories(ingredient)}
            title="Categorías"
          >
            <span className="material-symbols-outlined">category</span>
          </button>
          <button
            type="button"
            className="AdminIngredientsTable-iconButton"
            onClick={() => onEdit(ingredient)}
            title="Editar ingrediente y valores nutricionales"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button
            type="button"
            className="AdminIngredientsTable-iconButton AdminIngredientsTable-iconButton--danger"
            onClick={() => onDelete(ingredient)}
            disabled={isDeleting}
            title="Eliminar ingrediente"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default AdminIngredientRow;
