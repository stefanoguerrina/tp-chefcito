// Página "Mis recetas" (ruta /mis-recetas). Lista las recetas propias del usuario y
// lleva al wizard (RecipeEditorPage, rutas /mis-recetas/nueva y /mis-recetas/:id/editar)
// para crear o editar una. Cada usuario solo ve y gestiona las recetas que él creó (el
// backend además valida la propiedad en cada operación de escritura).
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRecipes, deleteRecipe } from '../services/recipeService.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import { recipeToCardProps } from '../models/recipeModel.js';
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import LoadingState from '../../../core/components/LoadingState.jsx';
import EmptyState from '../../../core/components/EmptyState.jsx';
import { useDeleteConfirmation } from '../../../core/hooks/useDeleteConfirmation.js';
import '../styles/_recipe-page.scss';

function RecipePage() {
  const navigate = useNavigate();
  const { userId: currentUserId } = useAuthContext();

  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  // Texto de búsqueda sobre las recetas propias ya cargadas (mismo patrón que InventoryPage).
  const [searchQuery, setSearchQuery] = useState('');

  // Al confirmar el borrado, se elimina la receta y se la saca de la lista local (sin volver
  // a pedirla). Si falla, el hook deja el motivo para el modal de aviso.
  const deletion = useDeleteConfirmation(async (recipe) => {
    await deleteRecipe(recipe.id);
    setRecipes((prev) => prev.filter((item) => item.id !== recipe.id));
  });
  const { pendingDelete: recipePendingDelete, deleteFailure } = deletion;

  // Carga las recetas propias (lista vacía = todavía no creó ninguna).
  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede
  // llamar desde el useEffect sin renders en cascada.
  const loadData = () =>
    fetchListOrEmpty(() => getAllRecipes(currentUserId))
      .then((recipesData) => {
        setRecipes(recipesData);
        setFetchError('');
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setIsLoading(false));

  // Reintento manual después de un error de carga.
  const handleRetry = () => {
    setIsLoading(true);
    loadData();
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtra las recetas propias ya cargadas según el texto buscado.
  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter((recipe) => recipe.name.toLowerCase().includes(q));
  }, [recipes, searchQuery]);

  return (
    <div className="RecipePage">
      <header className="RecipePage-header">
        <div className="RecipePage-titleGroup">
          <h1 className="RecipePage-title">Mis recetas</h1>
        </div>

        <div className="RecipePage-headerActions">
          <div className="RecipePage-counter">
            <div className="RecipePage-counterIcon">
              <span className="material-symbols-outlined">restaurant_menu</span>
            </div>
            <div className="RecipePage-counterText">
              <span className="RecipePage-counterLabel">Total creadas:</span>
              <span className="RecipePage-counterValue">
                {isLoading ? '…' : recipes.length}{' '}
                <span>{recipes.length === 1 ? 'receta' : 'recetas'}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="RecipePage-addBtn"
            onClick={() => navigate('/mis-recetas/nueva')}
          >
            <span className="material-symbols-outlined">add</span>
            Nueva receta
          </button>
        </div>
      </header>

      {deleteFailure && (
        <AlertModal
          title={`No se pudo eliminar "${deleteFailure.name}"`}
          message={deleteFailure.message}
          onClose={deletion.clearDeleteFailure}
        />
      )}

      <div className="RecipeSearch">
        <div className="RecipeSearch-icon">
          <span className="material-symbols-outlined">search</span>
        </div>
        <input
          id="recipe-search-input"
          type="text"
          className="RecipeSearch-input"
          placeholder="Buscar en tus recetas por nombre…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Buscar en mis recetas"
        />
        {searchQuery && (
          <button
            type="button"
            className="RecipeSearch-clear"
            onClick={() => setSearchQuery('')}
          >
            Limpiar
          </button>
        )}
      </div>

      {isLoading && <LoadingState message="Cargando recetas..." />}
      {fetchError && <ErrorState message={fetchError} onRetry={handleRetry} />}

      {!isLoading && !fetchError && (
        <>
          {/* Sin resultados de búsqueda */}
          {searchQuery && filteredRecipes.length === 0 && (
            <EmptyState icon="search_off" title="No encontramos recetas" message="Probá buscando con otro nombre." />
          )}

          {/* Sin recetas creadas todavía */}
          {!searchQuery && recipes.length === 0 && (
            <EmptyState
              icon="menu_book"
              title="No tenés recetas creadas"
              message={'Usá el botón "Nueva receta" para publicar tu primera receta.'}
            />
          )}

          {/* Grilla de cards */}
          {filteredRecipes.length > 0 && (
            <div className="RecipePage-grid">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipeToCardProps(recipe)}
                  showSaveButton={false}
                  showAuthor={false}
                  showTime={false}
                  // Las reseñas se ven al abrir la receta (RecipeDetailPage), no en esta
                  // grilla de gestión: acá arriba de "Editar"/"Eliminar" no aportan nada.
                  showRating={false}
                  onClick={() => navigate(`/recetas/${recipe.id}`)}
                  onEdit={() => navigate(`/mis-recetas/${recipe.id}/editar`)}
                  onDelete={() => deletion.requestDelete(recipe)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {recipePendingDelete && (
        <ConfirmModal
          title="Eliminar receta"
          message={`¿Eliminar la receta "${recipePendingDelete.name}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={deletion.handleConfirmDelete}
          onCancel={deletion.cancelDelete}
        />
      )}
    </div>
  );
}

export default RecipePage;
