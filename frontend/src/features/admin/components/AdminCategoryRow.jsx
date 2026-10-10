// Fila de la tabla de categorías del panel admin (AdminCategoriesTable): nombre con su
// código, descripción, cantidad de elementos asociados y los botones de editar y eliminar.
// Los estilos son los de la tabla (_admin-categories-table.scss).

// Recibe: category (cruda), code (ej. "#CAT-REC-0003"), count (recetas o ingredientes
// asociados), countLabels ({ singular, plural }), isDeleting (deshabilita el botón de borrar
// mientras se elimina), onEdit(category) y onDelete(category).
function AdminCategoryRow({ category, code, count, countLabels, isDeleting, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <div className="AdminCategoriesTable-name">{category.name}</div>
        <div className="AdminCategoriesTable-code">{code}</div>
      </td>
      <td className="AdminCategoriesTable-description">{category.description || '—'}</td>
      <td className="AdminCategoriesTable-cell--center">
        <span className="AdminCategoriesTable-count">{count}</span>{' '}
        <span className="AdminCategoriesTable-countLabel">
          {count === 1 ? countLabels.singular : countLabels.plural}
        </span>
      </td>
      <td className="AdminCategoriesTable-cell--center">
        <div className="AdminCategoriesTable-rowActions">
          <button
            type="button"
            className="AdminCategoriesTable-iconButton"
            onClick={() => onEdit(category)}
            title="Editar categoría"
            aria-label={`Editar categoría ${category.name}`}
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button
            type="button"
            className="AdminCategoriesTable-iconButton AdminCategoriesTable-iconButton--danger"
            onClick={() => onDelete(category)}
            disabled={isDeleting}
            title="Eliminar categoría"
            aria-label={`Eliminar categoría ${category.name}`}
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

export default AdminCategoryRow;
