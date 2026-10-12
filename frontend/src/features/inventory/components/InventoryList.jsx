// Lista de ingredientes del inventario: renderiza una IngredientCard por ítem.
// Recibe: items (filtrados), onEdit, onRemove.
// onUpdate ya no se pasa a la card (el stepper está en el modal de edición).
import IngredientCard from './IngredientCard.jsx';

function InventoryList({ items, onEdit, onRemove }) {
  if (items.length === 0) return null;

  return (
    <div className="InventoryList">
      {items.map((item) => (
        <IngredientCard
          key={item.idIngredient}
          item={item}
          onEdit={onEdit}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default InventoryList;
