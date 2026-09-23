// Tabla de gestión de categorías de receta del dashboard: buscador + nombre, descripción,
// cantidad de recetas asociadas y acciones directas (editar, eliminar), con el alta de
// una categoría nueva en el mismo lugar.
import { useState } from 'react';
import CategoryFormModal from '../../category/components/CategoryFormModal.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import {
  filterCategoriesByQuery,
  formatCategoryCode,
} from '../models/adminRecipeCategoriesModel.js';
import { formatCategoriesCount } from '../models/adminIngredientsModel.js';
import '../styles/_admin-recipe-categories-table.scss';

const ROWS_PER_PAGE = 6;

function AdminRecipeCategoriesTable({
  categories,
  recipeCountByCategory,
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
    <section className="AdminRecipeCategoriesTable">
      <header className="AdminRecipeCategoriesTable-header">
        <h2 className="AdminRecipeCategoriesTable-title">Categorías de Recetas</h2>

        <div className="AdminRecipeCategoriesTable-actions">
          <div className="AdminRecipeCategoriesTable-search">
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
            className="AdminRecipeCategoriesTable-newButton"
            onClick={() => setFormTarget('create')}
            title="Nueva categoría"
            aria-label="Nueva categoría"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      {isLoading && <p className="AdminRecipeCategoriesTable-status">Cargando categorías...</p>}

      {!isLoading && filteredCategories.length === 0 && (
        <p className="AdminRecipeCategoriesTable-status">
          {searchQuery ? 'No hay categorías que coincidan con la búsqueda.' : 'No hay categorías creadas todavía.'}
        </p>
      )}

      {!isLoading && filteredCategories.length > 0 && (
        <>
          <div className="AdminRecipeCategoriesTable-scroll">
            <table className="AdminRecipeCategoriesTable-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th className="AdminRecipeCategoriesTable-cell--center">Recetas asociadas</th>
                  <th className="AdminRecipeCategoriesTable-cell--center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageCategories.map((category) => {
                  const recipesCount = recipeCountByCategory.get(category.id) ?? 0;

                  return (
                    <tr key={category.id}>
                      <td>
                        <div className="AdminRecipeCategoriesTable-name">{category.name}</div>
                        <div className="AdminRecipeCategoriesTable-code">{formatCategoryCode(category.id)}</div>
                      </td>
                      <td className="AdminRecipeCategoriesTable-description">
                        {category.description || '—'}
                      </td>
                      <td className="AdminRecipeCategoriesTable-cell--center">
                        <span className="AdminRecipeCategoriesTable-recipesCount">{recipesCount}</span>{' '}
                        <span className="AdminRecipeCategoriesTable-recipesLabel">
                          {recipesCount === 1 ? 'receta' : 'recetas'}
                        </span>
                      </td>
                      <td className="AdminRecipeCategoriesTable-cell--center">
                        <div className="AdminRecipeCategoriesTable-rowActions">
                          <button
                            type="button"
                            className="AdminRecipeCategoriesTable-iconButton"
                            onClick={() => setFormTarget(category)}
                            title="Editar categoría"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            type="button"
                            className="AdminRecipeCategoriesTable-iconButton AdminRecipeCategoriesTable-iconButton--danger"
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

          <footer className="AdminRecipeCategoriesTable-footer">
            <span>
              Mostrando {pageCategories.length} de {formatCategoriesCount(filteredCategories.length)}
            </span>

            <div className="AdminRecipeCategoriesTable-pagination">
              <button
                type="button"
                className="AdminRecipeCategoriesTable-pageButton"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                title="Página anterior"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="AdminRecipeCategoriesTable-pageIndicator">
                Página {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                className="AdminRecipeCategoriesTable-pageButton"
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
          message="Esta acción no se puede deshacer. Las recetas que tengan asignada esta categoría van a perderla, pero no se eliminan."
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

export default AdminRecipeCategoriesTable;
