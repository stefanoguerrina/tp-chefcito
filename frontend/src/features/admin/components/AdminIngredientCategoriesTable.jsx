// Tabla de gestión de categorías de ingrediente del dashboard: buscador + nombre,
// descripción, cantidad de ingredientes asociados y acciones directas (editar, eliminar),
// con el alta de una categoría nueva en el mismo lugar.
import { useState } from 'react';
import CategoryFormModal from '../../ingredientCategory/components/CategoryFormModal.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import {
  filterCategoriesByQuery,
  formatCategoryCode,
} from '../models/adminIngredientCategoriesModel.js';
import { formatCategoriesCount } from '../models/adminIngredientsModel.js';
import '../styles/_admin-ingredient-categories-table.scss';

const ROWS_PER_PAGE = 6;

function AdminIngredientCategoriesTable({
  categories,
  ingredientCountByCategory,
  isLoading,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // null = cerrado, 'create' = alta, o la categoría cruda que se está editando.
  const [formTarget, setFormTarget] = useState(null);
  // Categoría pendiente de confirmar eliminación, o null si el modal está cerrado.
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  // Categoría cuya eliminación falló (con el motivo), o null si no hay ningún aviso para
  // mostrar. Se muestra en un modal aparte en vez de un banner que queda pegado en pantalla.
  const [deleteFailure, setDeleteFailure] = useState(null);

  const filteredCategories = filterCategoriesByQuery(categories, searchQuery);

  // Se calcula sobre la lista ya filtrada: buscar cambia el total de páginas.
  const totalPages = Math.max(Math.ceil(filteredCategories.length / ROWS_PER_PAGE), 1);
  const pageCategories = filteredCategories.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  // Al buscar se vuelve a la primera página: si no, se podía quedar en una página que ya
  // no existe para el nuevo conjunto de resultados.
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => setCurrentPage((page) => Math.max(page - 1, 1));
  const handleNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));

  // Crea o edita según qué haya en formTarget.
  const handleSubmitForm = async (data) => {
    if (formTarget === 'create') {
      await onCreateCategory(data);
    } else {
      await onUpdateCategory(formTarget.id, data);
    }
    setFormTarget(null);
  };

  const handleConfirmDelete = async () => {
    const target = pendingDelete;
    setDeletingId(target.id);
    try {
      await onDeleteCategory(target.id);
      setPendingDelete(null);
    } catch (err) {
      // Se cierra el modal de confirmación y se muestra el motivo en un modal de aviso
      // aparte, en vez de dejar un banner pegado arriba de la tabla.
      setPendingDelete(null);
      setDeleteFailure({ name: target.name, message: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="AdminIngredientCategoriesTable">
      <header className="AdminIngredientCategoriesTable-header">
        <h2 className="AdminIngredientCategoriesTable-title">Categorías de Ingredientes</h2>

        <div className="AdminIngredientCategoriesTable-actions">
          <div className="AdminIngredientCategoriesTable-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar categoría..."
            />
          </div>

          <button
            type="button"
            className="AdminIngredientCategoriesTable-newButton"
            onClick={() => setFormTarget('create')}
            title="Nueva categoría"
            aria-label="Nueva categoría"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      {isLoading && <p className="AdminIngredientCategoriesTable-status">Cargando categorías...</p>}

      {!isLoading && filteredCategories.length === 0 && (
        <p className="AdminIngredientCategoriesTable-status">
          {searchQuery ? 'No hay categorías que coincidan con la búsqueda.' : 'No hay categorías creadas todavía.'}
        </p>
      )}

      {!isLoading && filteredCategories.length > 0 && (
        <>
          <div className="AdminIngredientCategoriesTable-scroll">
            <table className="AdminIngredientCategoriesTable-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th className="AdminIngredientCategoriesTable-cell--center">Ingredientes asociados</th>
                  <th className="AdminIngredientCategoriesTable-cell--center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageCategories.map((category) => {
                  const ingredientsCount = ingredientCountByCategory.get(category.id) ?? 0;

                  return (
                    <tr key={category.id}>
                      <td>
                        <div className="AdminIngredientCategoriesTable-name">{category.name}</div>
                        <div className="AdminIngredientCategoriesTable-code">{formatCategoryCode(category.id)}</div>
                      </td>
                      <td className="AdminIngredientCategoriesTable-description">
                        {category.description || '—'}
                      </td>
                      <td className="AdminIngredientCategoriesTable-cell--center">
                        <span className="AdminIngredientCategoriesTable-ingredientsCount">{ingredientsCount}</span>{' '}
                        <span className="AdminIngredientCategoriesTable-ingredientsLabel">
                          {ingredientsCount === 1 ? 'ingrediente' : 'ingredientes'}
                        </span>
                      </td>
                      <td className="AdminIngredientCategoriesTable-cell--center">
                        <div className="AdminIngredientCategoriesTable-rowActions">
                          <button
                            type="button"
                            className="AdminIngredientCategoriesTable-iconButton"
                            onClick={() => setFormTarget(category)}
                            title="Editar categoría"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            type="button"
                            className="AdminIngredientCategoriesTable-iconButton AdminIngredientCategoriesTable-iconButton--danger"
                            onClick={() => setPendingDelete(category)}
                            disabled={deletingId === category.id}
                            title="Eliminar categoría"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <footer className="AdminIngredientCategoriesTable-footer">
            <span>
              Mostrando {pageCategories.length} de {formatCategoriesCount(filteredCategories.length)}
            </span>

            <div className="AdminIngredientCategoriesTable-pagination">
              <button
                type="button"
                className="AdminIngredientCategoriesTable-pageButton"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                title="Página anterior"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="AdminIngredientCategoriesTable-pageIndicator">
                Página {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                className="AdminIngredientCategoriesTable-pageButton"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                title="Página siguiente"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </footer>
        </>
      )}

      {formTarget !== null && (
        <CategoryFormModal
          initialData={formTarget === 'create' ? null : formTarget}
          onSubmit={handleSubmitForm}
          onCancel={() => setFormTarget(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title={`Eliminar categoría "${pendingDelete.name}"`}
          message="Esta acción no se puede deshacer y va a fallar si la categoría todavía tiene ingredientes asociados."
          confirmLabel={deletingId === pendingDelete.id ? 'Eliminando...' : 'Eliminar'}
          danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {deleteFailure && (
        <AlertModal
          title={`No se pudo eliminar "${deleteFailure.name}"`}
          message={deleteFailure.message}
          onClose={() => setDeleteFailure(null)}
        />
      )}
    </section>
  );
}

export default AdminIngredientCategoriesTable;
