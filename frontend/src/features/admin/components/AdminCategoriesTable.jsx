// Tabla de gestión de categorías del dashboard: buscador + nombre, descripción, cantidad
// de elementos asociados y acciones directas (editar, eliminar), con el alta de una
// categoría nueva en el mismo lugar. La comparten las categorías de receta y las de
// ingrediente: lo que cambia (títulos, textos, código) llega por props. Cada fila es un
// AdminCategoryRow.
import { useState } from 'react';
import CategoryFormModal from '../../../core/components/CategoryFormModal.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import { useDeleteConfirmation } from '../../../core/hooks/useDeleteConfirmation.js';
import AdminTablePagination from './AdminTablePagination.jsx';
import AdminCategoryRow from './AdminCategoryRow.jsx';
import { filterCategoriesByQuery } from '../models/adminCategoriesModel.js';
import { formatCategoriesCount } from '../models/adminIngredientsModel.js';
import '../styles/_admin-categories-table.scss';

const ROWS_PER_PAGE = 6;

// Recibe:
//   title — título de la tabla (ej. "Categorías de Recetas")
//   categories — categorías crudas; countByCategory — Map idCategory -> cantidad asociada
//   countLabels — { header, singular, plural } (ej. "Recetas asociadas", "receta", "recetas")
//   formatCode — arma el código legible a partir del id (ej. #CAT-REC-0003)
//   deleteMessage — qué pasa al borrar una categoría (texto del modal de confirmación)
//   formTexts — { idPrefix, namePlaceholder, descriptionPlaceholder } del modal de alta/edición
//   isLoading, onCreateCategory(data), onUpdateCategory(id, data), onDeleteCategory(id)
function AdminCategoriesTable({
  title,
  categories,
  countByCategory,
  countLabels,
  formatCode,
  deleteMessage,
  formTexts,
  isLoading,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // null = cerrado, 'create' = alta, o la categoría cruda que se está editando.
  const [formTarget, setFormTarget] = useState(null);
  const deletion = useDeleteConfirmation((category) => onDeleteCategory(category.id));
  const { pendingDelete, deletingId, deleteFailure } = deletion;

  const filteredCategories = filterCategoriesByQuery(categories, searchQuery);

  // Se calcula sobre la lista ya filtrada: buscar cambia el total de páginas. Si al borrar
  // la última fila de la última página esa página deja de existir, se muestra la anterior.
  const totalPages = Math.max(Math.ceil(filteredCategories.length / ROWS_PER_PAGE), 1);
  const page = Math.min(currentPage, totalPages);
  const pageCategories = filteredCategories.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // Al buscar se vuelve a la primera página: si no, se podía quedar en una página que ya
  // no existe para el nuevo conjunto de resultados.
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  // Crea o edita según qué haya en formTarget.
  const handleSubmitForm = async (data) => {
    if (formTarget === 'create') {
      await onCreateCategory(data);
    } else {
      await onUpdateCategory(formTarget.id, data);
    }
    setFormTarget(null);
  };

  return (
    <section className="AdminCategoriesTable">
      <header className="AdminCategoriesTable-header">
        <h2 className="AdminCategoriesTable-title">{title}</h2>

        <div className="AdminCategoriesTable-actions">
          <div className="AdminCategoriesTable-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar categoría..."
              aria-label="Buscar categoría por nombre"
            />
          </div>

          <button
            type="button"
            className="AdminCategoriesTable-newButton"
            onClick={() => setFormTarget('create')}
            title="Nueva categoría"
            aria-label="Nueva categoría"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      {isLoading && <LoadingState message="Cargando categorías..." />}

      {!isLoading && filteredCategories.length === 0 && (
        <p className="AdminCategoriesTable-status">
          {searchQuery ? 'No hay categorías que coincidan con la búsqueda.' : 'No hay categorías creadas todavía.'}
        </p>
      )}

      {!isLoading && filteredCategories.length > 0 && (
        <>
          <div className="AdminCategoriesTable-scroll">
            <table className="AdminCategoriesTable-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th className="AdminCategoriesTable-cell--center">{countLabels.header}</th>
                  <th className="AdminCategoriesTable-cell--center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageCategories.map((category) => (
                  <AdminCategoryRow
                    key={category.id}
                    category={category}
                    code={formatCode(category.id)}
                    count={countByCategory.get(category.id) ?? 0}
                    countLabels={countLabels}
                    isDeleting={deletingId === category.id}
                    onEdit={setFormTarget}
                    onDelete={deletion.requestDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <AdminTablePagination
            summary={`Mostrando ${pageCategories.length} de ${formatCategoriesCount(filteredCategories.length)}`}
            page={page}
            totalPages={totalPages}
            onChangePage={setCurrentPage}
          />
        </>
      )}

      {formTarget !== null && (
        <CategoryFormModal
          initialData={formTarget === 'create' ? null : formTarget}
          idPrefix={formTexts.idPrefix}
          namePlaceholder={formTexts.namePlaceholder}
          descriptionPlaceholder={formTexts.descriptionPlaceholder}
          onSubmit={handleSubmitForm}
          onCancel={() => setFormTarget(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title={`Eliminar categoría "${pendingDelete.name}"`}
          message={deleteMessage}
          confirmLabel={deletingId === pendingDelete.id ? 'Eliminando...' : 'Eliminar'}
          danger
          onConfirm={deletion.handleConfirmDelete}
          onCancel={deletion.cancelDelete}
        />
      )}

      {deleteFailure && (
        <AlertModal
          title={`No se pudo eliminar "${deleteFailure.name}"`}
          message={deleteFailure.message}
          onClose={deletion.clearDeleteFailure}
        />
      )}
    </section>
  );
}

export default AdminCategoriesTable;
