// Panel "Recetas guardadas". Lista las recetas que el usuario autenticado guardó
// (bookmark) y permite quitarlas. Al hacer click en una card abre su detalle.
import { useState, useEffect } from 'react';
import { getSavedRecipesByUser, deleteUserRecipe } from '../services/userRecipeService.js';
import { getCurrentUserId } from '../../../shared/utils/decodeToken.js';
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import '../styles/_saved-recipes-page.scss';

// Recibe: onRecipeClick — handler que recibe el idRecipe para abrir su detalle.
function SavedRecipesPage({ onRecipeClick }) {
  const currentUserId = getCurrentUserId();

  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');

  const loadSavedRecipes = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const data = await getSavedRecipesByUser(currentUserId);
      setSavedRecipes(data);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (idRecipe) => {
    setActionError('');
    try {
      await deleteUserRecipe(idRecipe);
      setSavedRecipes((prev) => prev.filter((item) => item.idRecipe !== idRecipe));
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="SavedRecipesPage">
      <div className="SavedRecipesPage-header">
        <h2>Recetas guardadas</h2>
        <span className="SavedRecipesPage-count">
          {savedRecipes.length} receta{savedRecipes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {actionError && <div className="SavedRecipesPage-alert">⚠ {actionError}</div>}

      {isLoading && <p className="SavedRecipesPage-loading">Cargando recetas guardadas...</p>}
      {fetchError && <p className="SavedRecipesPage-error">⚠ {fetchError}</p>}

      {!isLoading && !fetchError && savedRecipes.length === 0 && (
        <p className="SavedRecipesPage-empty">Todavía no guardaste ninguna receta.</p>
      )}

      {!isLoading && savedRecipes.length > 0 && (
        <div className="SavedRecipesPage-grid">
          {savedRecipes.map((item) => (
            <RecipeCard
              key={item.idRecipe}
              recipe={item.recipe}
              onClick={() => onRecipeClick?.(item.idRecipe)}
              isSaved
              onToggleSave={() => handleRemove(item.idRecipe)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedRecipesPage;
