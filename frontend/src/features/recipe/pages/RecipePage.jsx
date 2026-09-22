// Panel "Mis recetas". Permite a cualquier usuario autenticado listar sus propias
// recetas y abrir el wizard (RecipeEditorPage) para crear o editar una. A diferencia
// de IngredientPage (catálogo global, solo admin), acá cada usuario solo ve y
// gestiona las recetas que él creó (el backend además valida la propiedad en
// cada operación de escritura).
import { useState, useEffect } from 'react';
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
      <div className="RecipePage-header">
        <h2>Mis recetas</h2>
        <span className="RecipePage-count">
          {recipes.length} receta{recipes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <button
        type="button"
        className="btn btn--primary"
        onClick={() => { setEditorTarget('create'); setActionError(''); }}
      >
        + Nueva receta
      </button>

      {actionError && (
        <div className="RecipePage-alert">⚠ {actionError}</div>
      )}

      {isLoading && <p className="RecipePage-loading">Cargando recetas...</p>}
      {fetchError && <p className="RecipePage-error">⚠ {fetchError}</p>}

      {!isLoading && !fetchError && recipes.length === 0 && (
        <p className="RecipePage-empty">Todavía no creaste ninguna receta.</p>
      )}

      {!isLoading && recipes.length > 0 && (
        <div className="RecipePage-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipeToCardProps(recipe)}
              onEdit={() => setEditorTarget(recipe.id)}
              onDelete={() => setRecipePendingDelete(recipe)}
            />
          ))}
        </div>
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
