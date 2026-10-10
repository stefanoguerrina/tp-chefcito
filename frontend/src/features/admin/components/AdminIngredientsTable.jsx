// Tabla de gestión de ingredientes del panel: buscador + foto, nombre, categoría, unidad y
// acciones directas (categorías, editar con sus valores nutricionales, eliminar), con el
// alta de un ingrediente nuevo en el mismo lugar. Cada fila es un AdminIngredientRow.
import { useState } from 'react';
import IngredientFormModal from '../../ingredient/components/IngredientFormModal.jsx';
import IngredientCategoriesModal from '../../ingredient/components/IngredientCategoriesModal.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import AdminIngredientRow from './AdminIngredientRow.jsx';
import {
  filterIngredientsByQuery,
  getIngredientColorIndex,
  formatIngredientsCount,
} from '../models/adminIngredientsModel.js';
import LoadingState from '../../../core/components/LoadingState.jsx';
import { useDeleteConfirmation } from '../../../core/hooks/useDeleteConfirmation.js';
import AdminTablePagination from './AdminTablePagination.jsx';
import '../styles/_admin-ingredients-table.scss';

const ROWS_PER_PAGE = 6;

function AdminIngredientsTable({
  ingredients,
  categories,
  usageCountByIngredient,
  colorIndexByCategoryId,
  isLoading,
  onSaveIngredient,
  onUpdateIngredientCategories,
  onDeleteIngredient,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // null = cerrado, 'create' = alta, o el ingrediente crudo que se está editando.
  const [formTarget, setFormTarget] = useState(null);
  // Ingrediente cuyas categorías se están gestionando, o null si el modal está cerrado.
  const [categoriesTarget, setCategoriesTarget] = useState(null);
  const deletion = useDeleteConfirmation((ingredient) => onDeleteIngredient(ingredient.id));
  const { pendingDelete, deletingId, deleteFailure } = deletion;
  // Ingrediente que se guardó pero cuya foto no se pudo subir (con el motivo), o null.
  const [imageFailure, setImageFailure] = useState(null);

  const filteredIngredients = filterIngredientsByQuery(ingredients, searchQuery);

  // Se calcula sobre la lista ya filtrada: buscar cambia el total de páginas. Si al borrar
  // la última fila de la última página esa página deja de existir, se muestra la anterior.
  const totalPages = Math.max(Math.ceil(filteredIngredients.length / ROWS_PER_PAGE), 1);
  const page = Math.min(currentPage, totalPages);
  const pageIngredients = filteredIngredients.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  // Al buscar se vuelve a la primera página: si no, se podía quedar en una página que ya
  // no existe para el nuevo conjunto de resultados.
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  // Crea o edita según qué haya en formTarget. Si falla el guardado de los datos, el
  // error lo muestra el formulario (no se cierra); si solo falló la foto, el ingrediente
  // ya quedó guardado: se cierra y se avisa en un modal.
  const handleSubmitForm = async (formResult) => {
    const { imageError } = await onSaveIngredient(formTarget === 'create' ? null : formTarget.id, formResult);
    if (imageError) setImageFailure({ name: formResult.data.name, message: imageError });
    setFormTarget(null);
  };

  // Guarda las categorías elegidas en el modal rápido de categorías (reutiliza el mismo
  // PATCH que la edición completa, solo que con categoryIds nada más).
  const handleSubmitCategories = async (categoryIds) => {
    await onUpdateIngredientCategories(categoriesTarget.id, categoryIds);
    setCategoriesTarget(null);
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

      {isLoading && <LoadingState message="Cargando ingredientes..." />}

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
                  <th className="AdminIngredientsTable-cell--center">Valores nutricionales</th>
                  <th className="AdminIngredientsTable-cell--center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageIngredients.map((ingredient) => (
                  <AdminIngredientRow
                    key={ingredient.id}
                    ingredient={ingredient}
                    colorIndex={getIngredientColorIndex(colorIndexByCategoryId, ingredient)}
                    recipesCount={usageCountByIngredient.get(ingredient.id) ?? 0}
                    isDeleting={deletingId === ingredient.id}
                    onEditCategories={setCategoriesTarget}
                    onEdit={setFormTarget}
                    onDelete={deletion.requestDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <AdminTablePagination
            summary={`Mostrando ${pageIngredients.length} de ${formatIngredientsCount(filteredIngredients.length)}`}
            page={page}
            totalPages={totalPages}
            onChangePage={setCurrentPage}
          />
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
          message="Esta acción no se puede deshacer (también se borran su foto y sus valores nutricionales) y va a fallar si el ingrediente se usa en alguna receta o inventario."
          confirmLabel={deletingId === pendingDelete.id ? 'Eliminando...' : 'Eliminar'}
          danger
          onConfirm={deletion.handleConfirmDelete}
          onCancel={deletion.cancelDelete}
        />
      )}

      {imageFailure && (
        <AlertModal
          title={`"${imageFailure.name}" se guardó sin la foto`}
          message={`${imageFailure.message} Podés volver a subirla desde "Editar ingrediente".`}
          onClose={() => setImageFailure(null)}
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

export default AdminIngredientsTable;
