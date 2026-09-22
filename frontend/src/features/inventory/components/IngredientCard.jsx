// Card individual de un ingrediente en el inventario.
// Muestra imagen/placeholder, nombre, unidad y cantidad. Los controles de edición
// (+/-, unidad) están en el modal que se abre al tocar el lápiz.
import '../styles/_ingredient-card.scss';

// Recibe:
//   item: objeto mapeado por inventoryItemFromApi.
//   onEdit(item): abre el modal de edición completa.
//   onRemove(ingredientId): elimina del inventario.
function IngredientCard({ item, onEdit, onRemove }) {
  const unit = item.unitOfMeasure ?? item.ingredientBaseUnit ?? '';

  const renderThumb = () => {
    if (item.ingredientImagePath) {
      return <img src={item.ingredientImagePath} alt={item.ingredientName} loading="lazy" />;
    }
    return (
      <span className="IngredientCard-thumbIcon material-symbols-outlined">grocery</span>
    );
  };

  // Determina si está "en stock" o no para el badge
  const inStock = item.availableQuantity !== null && item.availableQuantity > 0;

  return (
    <article className="IngredientCard">
      {/* Thumbnail */}
      <div className="IngredientCard-thumb">
        {renderThumb()}
      </div>

      {/* Info */}
      <div className="IngredientCard-info">
        <div className="IngredientCard-titleRow">
          <span className="IngredientCard-name">{item.ingredientName}</span>
          <span className={`IngredientCard-badge ${inStock ? 'IngredientCard-badge--in' : 'IngredientCard-badge--out'}`}>
            {inStock ? 'En stock' : 'Sin stock'}
          </span>
        </div>

        <p className="IngredientCard-meta IngredientCard-meta--qty">
          Disponible:{' '}
          <strong>{item.availableQuantity ?? '—'}{unit ? ` ${unit}` : ''}</strong>
        </p>
      </div>

      {/* Acciones */}
      <div className="IngredientCard-actions">
        <button
          type="button"
          className="IngredientCard-iconBtn IngredientCard-iconBtn--edit"
          aria-label={`Editar ${item.ingredientName}`}
          title="Editar cantidad"
          onClick={() => onEdit(item)}
        >
          <span className="material-symbols-outlined">edit</span>
        </button>

        <button
          type="button"
          className="IngredientCard-iconBtn IngredientCard-iconBtn--delete"
          aria-label={`Eliminar ${item.ingredientName} del inventario`}
          title="Eliminar de mi despensa"
          onClick={() => onRemove(item.idIngredient)}
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </article>
  );
}

export default IngredientCard;
