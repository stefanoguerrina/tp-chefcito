// Tabla de gestión de ingredientes del dashboard: buscador + nombre, unidad y acciones
// directas (valores nutricionales, editar, eliminar), con el alta de un ingrediente nuevo
// en el mismo lugar (a diferencia de usuarios, acá no hace falta ir a otra sección).
import { useState } from 'react';
import IngredientFormModal from '../../ingredient/components/IngredientFormModal.jsx';
import IngredientCategoriesModal from '../../ingredient/components/IngredientCategoriesModal.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import {
  filterIngredientsByQuery,
  getPrimaryCategory,
  getExtraCategoriesCount,
  getIngredientColorIndex,
  formatIngredientsCount,
  formatIngredientCode,
} from '../models/adminIngredientsModel.js';
import '../styles/_admin-ingredients-table.scss';

const ROWS_PER_PAGE = 6;

function AdminIngredientsTable({
  ingredients,
  categories,
  usageCountByIngredient,
  colorIndexByCategoryId,
  isLoading,
  onCreateIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // null = cerrado, 'create' = alta, o el ingrediente crudo que se está editando.
  const [formTarget, setFormTarget] = useState(null);
  // Ingrediente cuyas categorías se están gestionando, o null si el modal está cerrado.
  const [categoriesTarget, setCategoriesTarget] = useState(null);
  // Ingrediente pendiente de confirmar eliminación, o null si el modal está cerrado.
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  // Ingrediente cuya eliminación falló (con el motivo), o null si no hay ningún aviso
  // para mostrar. Se muestra en un modal aparte en vez de un banner que queda pegado en
  // pantalla.
  const [deleteFailure, setDeleteFailure] = useState(null);

  const filteredIngredients = filterIngredientsByQuery(ingredients, searchQuery);

  // Se calcula sobre la lista ya filtrada: buscar cambia el total de páginas.
  const totalPages = Math.max(Math.ceil(filteredIngredients.length / ROWS_PER_PAGE), 1);
  const pageIngredients = filteredIngredients.slice(
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
      await onCreateIngredient(data);
    } else {
      await onUpdateIngredient(formTarget.id, data);
    }
    setFormTarget(null);
  };

  // Guarda las categorías elegidas en el modal rápido de categorías (reutiliza el mismo
  // PATCH que la edición completa, solo que con categoryIds nada más).
  const handleSubmitCategories = async (categoryIds) => {
    await onUpdateIngredient(categoriesTarget.id, { categoryIds });
    setCategoriesTarget(null);
  };

  const handleConfirmDelete = async () => {
    const target = pendingDelete;
    setDeletingId(target.id);
    try {
      await onDeleteIngredient(target.id);
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
    <section className="AdminIngredientsTable">
      <header className="AdminIngredientsTable-header">
        <h2 className="AdminIngredientsTable-title">Ingredientes</h2>

        <div className="AdminIngredientsTable-actions">
          <div className="AdminIngredientsTable-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar ingrediente..."
            />
          </div>

          <button
            type="button"
            className="AdminIngredientsTable-newButton"
            onClick={() => setFormTarget('create')}
            title="Nuevo ingrediente"
            aria-label="Nuevo ingrediente"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </header>

      {isLoading && <p className="AdminIngredientsTable-status">Cargando ingredientes...</p>}

      {!isLoading && filteredIngredients.length === 0 && (
        <p className="AdminIngredientsTable-status">
          {searchQuery ? 'No hay ingredientes que coincidan con la búsqueda.' : 'No hay ingredientes creados todavía.'}
        </p>
      )}

      {!isLoading && filteredIngredients.length > 0 && (
        <>
          <div className="AdminIngredientsTable-scroll">
            <table className="AdminIngredientsTable-table">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Categoría</th>
                  <th>Unidad</th>
                  <th className="AdminIngredientsTable-cell--center">Recetas asociadas</th>
                  <th className="AdminIngredientsTable-cell--center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageIngredients.map((ingredient) => {
                  const primaryCategory = getPrimaryCategory(ingredient);
                  const extraCategoriesCount = getExtraCategoriesCount(ingredient);
                  const colorIndex = getIngredientColorIndex(colorIndexByCategoryId, ingredient);
                  const recipesCount = usageCountByIngredient.get(ingredient.id) ?? 0;

                  return (
                  <tr key={ingredient.id}>
                    <td>
                      <div className="AdminIngredientsTable-name">{ingredient.name}</div>
                      <div className="AdminIngredientsTable-code">{formatIngredientCode(ingredient.id)}</div>
                    </td>
                    <td>
                      <span className="AdminIngredientsTable-categoryBadge">
                        <span
                          className={`AdminIngredientsTable-categoryDot AdminIngredientsTable-categoryDot--${colorIndex}`}
                        />
                        {primaryCategory?.name ?? 'Sin categoría'}
                      </span>
                      {extraCategoriesCount > 0 && (
                        <span className="AdminIngredientsTable-categoryExtra">+{extraCategoriesCount}</span>
                      )}
                    </td>
                    <td className="AdminIngredientsTable-unit">{ingredient.unitOfMeasure || '—'}</td>
                    <td className="AdminIngredientsTable-cell--center">
                      <span className="AdminIngredientsTable-recipesCount">{recipesCount}</span>{' '}
                      <span className="AdminIngredientsTable-recipesLabel">
                        {recipesCount === 1 ? 'receta' : 'recetas'}
                      </span>
                    </td>
                    <td className="AdminIngredientsTable-cell--center">
                      <div className="AdminIngredientsTable-rowActions">
                        <button
                          type="button"
                          className="AdminIngredientsTable-iconButton"
                          onClick={() => setCategoriesTarget(ingredient)}
                          title="Categorías"
                        >
                          <span className="material-symbols-outlined">category</span>
                        </button>
                        <button
                          type="button"
                          className="AdminIngredientsTable-iconButton"
                          onClick={() => setFormTarget(ingredient)}
                          title="Editar ingrediente"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          className="AdminIngredientsTable-iconButton AdminIngredientsTable-iconButton--danger"
                          onClick={() => setPendingDelete(ingredient)}
                          disabled={deletingId === ingredient.id}
                          title="Eliminar ingrediente"
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

          <footer className="AdminIngredientsTable-footer">
            <span>
              Mostrando {pageIngredients.length} de {formatIngredientsCount(filteredIngredients.length)}
            </span>

            <div className="AdminIngredientsTable-pagination">
              <button
                type="button"
                className="AdminIngredientsTable-pageButton"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                title="Página anterior"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="AdminIngredientsTable-pageIndicator">
                Página {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                className="AdminIngredientsTable-pageButton"
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
        <IngredientFormModal
          initialData={formTarget === 'create' ? null : formTarget}
          categories={categories}
          onSubmit={handleSubmitForm}
          onCancel={() => setFormTarget(null)}
        />
      )}

      {categoriesTarget && (
        <IngredientCategoriesModal
          ingredient={categoriesTarget}
          categories={categories}
          onSubmit={handleSubmitCategories}
          onCancel={() => setCategoriesTarget(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title={`Eliminar ingrediente "${pendingDelete.name}"`}
          message="Esta acción no se puede deshacer y va a fallar si el ingrediente está en uso en inventarios, recetas o tiene valores nutricionales cargados."
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

export default AdminIngredientsTable;
