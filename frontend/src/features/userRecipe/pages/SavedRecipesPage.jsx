// Panel "Recetas guardadas". Lista las recetas que el usuario autenticado guardó
// (bookmark) y permite quitarlas. Al hacer click en una card abre su detalle.
// A diferencia de "Mis recetas", acá no hay botón de agregar: una receta guardada
// se guarda desde su card en otro lado (feed de la home, detalle), no desde este panel.
import { useState, useEffect, useMemo } from 'react';
import { getSavedRecipesByUser, deleteUserRecipe } from '../services/userRecipeService.js';
import { getCurrentUserId } from '../../../shared/utils/decodeToken.js';
import RecipeCard from '../../../core/components/RecipeCard.jsx';
import '../styles/_saved-recipes-page.scss';

// Recibe: onRecipeClick — handler que recibe el idRecipe para abrir su detalle.
// onExploreClick — handler del CTA del estado vacío, vuelve a la home para explorar recetas.
function SavedRecipesPage({ onRecipeClick, onExploreClick }) {
  const currentUserId = getCurrentUserId();

  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionError, setActionError] = useState('');
  // Texto de búsqueda sobre las recetas ya guardadas (mismo patrón que Mis recetas/Inventario).
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filtra las recetas guardadas ya cargadas según el texto buscado.
  const filteredSavedRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return savedRecipes;
    return savedRecipes.filter((item) => item.recipe.title.toLowerCase().includes(q));
  }, [savedRecipes, searchQuery]);

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
      <header className="SavedRecipesPage-header">
        <div className="SavedRecipesPage-titleGroup">
          <span className="SavedRecipesPage-badge">
            <span className="material-symbols-outlined">bookmark</span>
            Recetas guardadas
          </span>
          <h1 className="SavedRecipesPage-title">Tu selección de recetas</h1>
        </div>

        <div className="SavedRecipesPage-counter">
          <div className="SavedRecipesPage-counterIcon">
            <span className="material-symbols-outlined">bookmark</span>
          </div>
          <div className="SavedRecipesPage-counterText">
            <span className="SavedRecipesPage-counterLabel">Total guardadas:</span>
            <span className="SavedRecipesPage-counterValue">
              {isLoading ? '…' : savedRecipes.length}{' '}
              <span>{savedRecipes.length === 1 ? 'receta' : 'recetas'}</span>
            </span>
          </div>
        </div>
      </header>

      {actionError && <div className="SavedRecipesPage-alert">⚠ {actionError}</div>}

      {savedRecipes.length > 0 && (
        <div className="SavedRecipesSearch">
          <div className="SavedRecipesSearch-icon">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            id="saved-recipes-search-input"
            type="text"
            className="SavedRecipesSearch-input"
            placeholder="Buscar en tus recetas guardadas por nombre…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar en recetas guardadas"
          />
          {searchQuery && (
            <button
              type="button"
              className="SavedRecipesSearch-clear"
              onClick={() => setSearchQuery('')}
            >
              Limpiar
            </button>
          )}
        </div>
      )}

      {isLoading && <p className="SavedRecipesPage-loading">Cargando recetas guardadas...</p>}
      {fetchError && <p className="SavedRecipesPage-error">⚠ {fetchError}</p>}

      {!isLoading && !fetchError && (
        <>
          {/* Sin resultados de búsqueda */}
          {searchQuery && filteredSavedRecipes.length === 0 && (
            <div className="SavedRecipesEmpty">
              <div className="SavedRecipesEmpty-icon">
                <span className="material-symbols-outlined">search_off</span>
              </div>
              <h3 className="SavedRecipesEmpty-title">No encontramos recetas</h3>
              <p className="SavedRecipesEmpty-text">Probá buscando con otro nombre.</p>
            </div>
          )}

          {/* Sin recetas guardadas todavía: acá sí va un CTA, no hay botón de agregar en el header */}
          {!searchQuery && savedRecipes.length === 0 && (
            <div className="SavedRecipesEmpty">
              <div className="SavedRecipesEmpty-icon">
                <span className="material-symbols-outlined">bookmark_border</span>
              </div>
              <h3 className="SavedRecipesEmpty-title">No tenés recetas guardadas</h3>
              <p className="SavedRecipesEmpty-text">
                Guardá las recetas que te gusten desde su card para encontrarlas acá.
              </p>
              {onExploreClick && (
                <button type="button" className="SavedRecipesEmpty-cta" onClick={onExploreClick}>
                  <span className="material-symbols-outlined">explore</span>
                  Explorar recetas
                </button>
              )}
            </div>
          )}

          {/* Grilla de cards, igual que antes */}
          {filteredSavedRecipes.length > 0 && (
            <div className="SavedRecipesPage-grid">
              {filteredSavedRecipes.map((item) => (
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
        </>
      )}
    </div>
  );
}

export default SavedRecipesPage;
