// Panel "Mis recetas". Permite a cualquier usuario autenticado listar sus propias
// recetas y abrir el wizard (RecipeEditorPage) para crear o editar una. A diferencia
// de IngredientPage (catálogo global, solo admin), acá cada usuario solo ve y
// gestiona las recetas que él creó (el backend además valida la propiedad en
// cada operación de escritura).
import { useState, useEffect, useMemo } from 'react';
import { getAllRecipes, deleteRecipe } from '../services/recipeService.js';
import { getAllCategories } from '../../category/services/categoryService.js';
import { getAllIngredients } from '../../ingredient/services/ingredientService.js';
import { getCurrentUserId } from '../../../shared/utils/decodeToken.js';
import { recipeToCardProps } from '../models/recipeModel.js';
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import RecipeEditorPage from './RecipeEditorPage.jsx';
import '../styles/_recipe-page.scss';

// Recibe: initialEditorTarget opcional ('create', un id de receta, o null) para abrir
// el wizard directo al montar — usado cuando se llega desde el panel de Perfil — y
// onEditorExit opcional, que avisa cuando se cierra el wizard (tanto al guardar como
// al cancelar) para que quien lo abrió pueda devolver al usuario a su vista.
function RecipePage({ initialEditorTarget = null, onEditorExit }) {
  const currentUserId = getCurrentUserId();

  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredientsCatalog, setIngredientsCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // null = viendo la lista; 'create' = wizard en modo alta; un id = wizard editando esa receta.
  const [editorTarget, setEditorTarget] = useState(initialEditorTarget);
  // Receta que se está por borrar (null = no hay ningún modal de confirmación abierto).
  const [recipePendingDelete, setRecipePendingDelete] = useState(null);

  const [actionError, setActionError] = useState('');
  // Texto de búsqueda sobre las recetas propias ya cargadas (mismo patrón que InventoryPage).
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      // Carga en paralelo las recetas propias, las categorías y el catálogo de
      // ingredientes disponibles para los selectores del wizard.
      const [recipesData, categoriesData, ingredientsData] = await Promise.all([
        getAllRecipes(currentUserId).catch((err) => {
          // El backend devuelve 404 cuando el usuario todavía no tiene recetas.
          if (err.message.includes('No se encontraron')) return [];
          throw err;
        }),
        getAllCategories().catch((err) => {
          if (err.message.includes('No se encontraron')) return [];
          throw err;
        }),
        getAllIngredients().catch((err) => {
          if (err.message.includes('No se encontraron')) return [];
          throw err;
        }),
      ]);
      setRecipes(recipesData);
      setCategories(categoriesData);
      setIngredientsCatalog(ingredientsData);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
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

  const handleEditorDone = async () => {
    setEditorTarget(null);
    // Si el wizard lo abrió otra vista (ej. Perfil), es esa la que decide a dónde
    // volver: recargar la lista de acá sería al pedo porque no se va a mostrar.
    if (onEditorExit) {
      onEditorExit();
      return;
    }
    await loadData();
  };

  const handleEditorCancel = () => {
    setEditorTarget(null);
    if (onEditorExit) onEditorExit();
  };

  const handleConfirmDelete = async () => {
    const recipe = recipePendingDelete;
    setRecipePendingDelete(null);
    setActionError('');
    try {
      await deleteRecipe(recipe.id);
      await loadData();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (editorTarget !== null) {
    return (
      <RecipeEditorPage
        recipeId={editorTarget === 'create' ? null : editorTarget}
        categories={categories}
        ingredientsCatalog={ingredientsCatalog}
        onDone={handleEditorDone}
        onCancel={handleEditorCancel}
      />
    );
  }

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
            onClick={() => { setEditorTarget('create'); setActionError(''); }}
          >
            <span className="material-symbols-outlined">add</span>
            Nueva receta
          </button>
        </div>
      </header>

      {actionError && (
        <div className="RecipePage-alert">⚠ {actionError}</div>
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
      {fetchError && <p className="RecipePage-error">⚠ {fetchError}</p>}

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
                  onEdit={() => setEditorTarget(recipe.id)}
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
