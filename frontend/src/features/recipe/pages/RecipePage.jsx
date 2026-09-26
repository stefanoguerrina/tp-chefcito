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
import '../styles/_recipe-page.scss';

function RecipePage() {
  const navigate = useNavigate();
  const { userId: currentUserId } = useAuthContext();

  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  // Receta que se está por borrar (null = no hay ningún modal de confirmación abierto).
  const [recipePendingDelete, setRecipePendingDelete] = useState(null);

  const [actionError, setActionError] = useState('');
  // Texto de búsqueda sobre las recetas propias ya cargadas (mismo patrón que InventoryPage).
  const [searchQuery, setSearchQuery] = useState('');

  // Carga las recetas propias (un 404 = todavía no creó ninguna).
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

  const handleConfirmDelete = async () => {
    const recipe = recipePendingDelete;
    setRecipePendingDelete(null);
    try {
      await deleteRecipe(recipe.id);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="RecipePage">
      <header className="RecipePage-header">
        <div className="RecipePage-titleGroup">
          <span className="RecipePage-badge">
            <span className="material-symbols-outlined">menu_book</span>
            Mis recetas
          </span>
          <h1 className="RecipePage-title">Recetas creadas por vos</h1>
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

      {actionError && (
        <AlertModal
          title="No se pudo eliminar la receta"
          message={actionError}
          onClose={() => setActionError('')}
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

      {isLoading && <p className="RecipePage-loading">Cargando recetas...</p>}
      {fetchError && <ErrorState message={fetchError} onRetry={handleRetry} />}

      {!isLoading && !fetchError && (
        <>
          {/* Sin resultados de búsqueda */}
          {searchQuery && filteredRecipes.length === 0 && (
            <div className="RecipeEmpty">
              <div className="RecipeEmpty-icon">
                <span className="material-symbols-outlined">search_off</span>
              </div>
              <h3 className="RecipeEmpty-title">No encontramos recetas</h3>
              <p className="RecipeEmpty-text">Probá buscando con otro nombre.</p>
            </div>
          )}

          {/* Sin recetas creadas todavía */}
          {!searchQuery && recipes.length === 0 && (
            <div className="RecipeEmpty">
              <div className="RecipeEmpty-icon">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <h3 className="RecipeEmpty-title">No tenés recetas creadas</h3>
              <p className="RecipeEmpty-text">
                Usá el botón "Nueva receta" para publicar tu primera receta.
              </p>
            </div>
          )}

          {/* Grilla de cards, igual que antes */}
          {filteredRecipes.length > 0 && (
            <div className="RecipePage-grid">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipeToCardProps(recipe)}
                  showSaveButton={false}
                  onClick={() => navigate(`/recetas/${recipe.id}`)}
                  onEdit={() => navigate(`/mis-recetas/${recipe.id}/editar`)}
                  onDelete={() => setRecipePendingDelete(recipe)}
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
          onConfirm={handleConfirmDelete}
          onCancel={() => setRecipePendingDelete(null)}
        />
      )}
    </div>
  );
}

export default RecipePage;
