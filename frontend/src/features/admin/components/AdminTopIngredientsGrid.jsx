// Top 3 de ingredientes más usados en recetas, en fila horizontal (1, 2, 3 lado a lado):
// puesto en una insignia de color + nombre, y debajo la cantidad de recetas.
// Recibe: items ([{ label, value }], hasta 3, ya ordenados de mayor a menor), unitLabel
// (plural), unitLabelSingular (para cuando value es 1) y emptyMessage (si no hay datos).
import '../styles/_admin-top-ingredients-grid.scss';

function AdminTopIngredientsGrid({ items, unitLabel, unitLabelSingular, emptyMessage }) {
  if (items.length === 0) {
    return <p className="AdminTopIngredientsGrid-empty">{emptyMessage}</p>;
  }

  return (
    <div className="AdminTopIngredientsGrid">
      {items.map((item, index) => {
        const rank = index + 1;
        return (
          <div className="AdminTopIngredientsGrid-item" key={item.label}>
            <div className="AdminTopIngredientsGrid-head">
              <span className={`AdminTopIngredientsGrid-rank AdminTopIngredientsGrid-rank--${rank}`}>
                {rank}
              </span>
              <span className="AdminTopIngredientsGrid-name" title={item.label}>
                {item.label}
              </span>
            </div>
            <span className="AdminTopIngredientsGrid-value">
              {item.value} {item.value === 1 && unitLabelSingular ? unitLabelSingular : unitLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default AdminTopIngredientsGrid;
