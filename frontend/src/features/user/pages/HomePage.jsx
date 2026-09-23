// Home page — vista principal que se muestra tras un login exitoso de un usuario común.
// Compone el layout autenticado (sidebar fija) y permite alternar entre los paneles
// propios del usuario (Mis recetas, Perfil, Inventario, Recetas guardadas).
// Un admin nunca llega acá: cae directo en AdminPage (ver App.jsx).
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import HomeFeatureCards from '../../recipe/components/HomeFeatureCards.jsx';
import RecipeCarouselSection from '../../recipe/components/RecipeCarouselSection.jsx';
import RecipePage from '../../recipe/pages/RecipePage.jsx';
import RecipeDetailPage from '../../recipe/pages/RecipeDetailPage.jsx';
import ProfilePage from './ProfilePage.jsx';
import InventoryPage from '../../inventory/pages/InventoryPage.jsx';
import SavedRecipesPage from '../../userRecipe/pages/SavedRecipesPage.jsx';
import { getAllRecipes } from '../../recipe/services/recipeService.js';
import { recipeToHomeCardProps } from '../../recipe/models/recipeModel.js';
import {
  getSavedRecipeIds,
  createUserRecipe,
  deleteUserRecipe,
} from '../../userRecipe/services/userRecipeService.js';
import { getCurrentUserId } from '../../../shared/utils/decodeToken.js';
import '../styles/_home-page.scss';

// Paneles disponibles en la sidebar del usuario. 'null' es la home normal.
const USER_PANELS = {
  myRecipes: 'myRecipes',
  profile: 'profile',
  inventory: 'inventory',
  savedRecipes: 'savedRecipes',
};

function HomePage({ onLogout }) {
  const currentUserId = getCurrentUserId();

  // Panel activo: null = home normal, o una clave de USER_PANELS.
  const [activePanel, setActivePanel] = useState(null);
  // Id de la receta cuyo detalle se está mostrando (null = sin detalle abierto).
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  // Id del usuario cuyo perfil (de solo lectura) se está mostrando, al tocar el
  // nombre del creador desde el detalle de una receta (null = no hay ninguno abierto).
  const [viewedProfileUserId, setViewedProfileUserId] = useState(null);

  // Recetas reales cargadas por los usuarios (ya no hay datos de muestra acá).
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [recipesError, setRecipesError] = useState('');

  // Con qué debe abrirse el wizard de "Mis recetas" la próxima vez que se muestre:
  // null (lista normal), 'create' o el id de una receta a editar. Se usa cuando se
  // llega desde el botón "+ Nueva receta" o "Editar" del panel de Perfil.
  const [myRecipesInitialTarget, setMyRecipesInitialTarget] = useState(null);

  // Ids de las recetas que el usuario autenticado ya guardó, para pintar el
  // listón de cada card sin tener que entrar al detalle de la receta.
  const [savedRecipeIds, setSavedRecipeIds] = useState(new Set());
  const [saveError, setSaveError] = useState('');

  // Se recarga cada vez que se vuelve a la vista normal (activePanel a null), no solo
  // al montar: si no, después de crear/editar una receta desde "Mis recetas" y volver
  // a Inicio, la lista quedaba con los datos viejos.
  useEffect(() => {
    if (activePanel !== null) return;
    (async () => {
      setIsLoadingRecipes(true);
      setRecipesError('');
      try {
        const recipes = await getAllRecipes();
        // "Recetas de la comunidad" es para descubrir lo que publicaron otros, no
        // las propias (esas ya se gestionan desde "Mis recetas").
        const othersRecipes = recipes.filter((recipe) => recipe.idUser !== currentUserId);
        setCommunityRecipes(othersRecipes.map(recipeToHomeCardProps));
      } catch (err) {
        // El backend devuelve 404 cuando todavía no hay ninguna receta cargada.
        if (err.message.includes('No se encontraron')) {
          setCommunityRecipes([]);
        } else {
          setRecipesError(err.message);
        }
      } finally {
        setIsLoadingRecipes(false);
      }
    })();

    (async () => {
      try {
        const ids = await getSavedRecipeIds(currentUserId);
        setSavedRecipeIds(new Set(ids));
      } catch {
        // Si falla, las cards simplemente arrancan sin marcar como guardadas.
      }
    })();
  }, [activePanel, currentUserId]);

  // Guarda o quita el guardado de una receta desde su card, sin entrar al detalle.
  // Actualiza el listón de forma optimista y revierte si el backend falla.
  const handleToggleSaveRecipe = async (idRecipe) => {
    const wasSaved = savedRecipeIds.has(idRecipe);
    setSaveError('');
    setSavedRecipeIds((prev) => {
      const next = new Set(prev);
      wasSaved ? next.delete(idRecipe) : next.add(idRecipe);
      return next;
    });
    try {
      if (wasSaved) {
        await deleteUserRecipe(idRecipe);
      } else {
        await createUserRecipe(idRecipe);
      }
    } catch (err) {
      setSaveError(err.message);
      // Revierte el cambio optimista.
      setSavedRecipeIds((prev) => {
        const next = new Set(prev);
        wasSaved ? next.add(idRecipe) : next.delete(idRecipe);
        return next;
      });
      // Re-lanza para que quien llamó (ej. RecipeDetailPage) pueda mostrar
      // su propio mensaje de error junto al botón, además del de la home.
      throw err;
    }
  };

  // Alterna un panel: si ya está activo lo cierra, si no lo abre.
  const handleTogglePanel = (panel) => {
    // Cualquier navegación manual por la sidebar descarta un target pendiente
    // para el wizard de "Mis recetas" (ver handleOpenRecipeEditor).
    setMyRecipesInitialTarget(null);
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  // Abre "Mis recetas" directo en el wizard de alta ('create') o edición (id de
  // receta), usado al tocar una receta desde el panel de Perfil.
  const handleOpenRecipeEditor = (target) => {
    setMyRecipesInitialTarget(target);
    setActivePanel(USER_PANELS.myRecipes);
  };

  // Al cerrar el wizard que se abrió desde Perfil hay que volver a Perfil: si no,
  // el usuario quedaba en la lista de "Mis recetas", que no es de donde salió.
  const handleRecipeEditorExit = () => {
    setMyRecipesInitialTarget(null);
    setActivePanel(USER_PANELS.profile);
  };

  // Abre el detalle de una receta desde "Recetas guardadas": cierra ese panel
  // para que se muestre RecipeDetailPage (solo se renderiza con activePanel null).
  const handleOpenRecipeFromSaved = (idRecipe) => {
    setActivePanel(null);
    setSelectedRecipeId(idRecipe);
  };

  // Abre el perfil de solo lectura de otro usuario, al tocar su nombre desde el
  // detalle de una receta.
  const handleViewUserProfile = (userId) => {
    setSelectedRecipeId(null);
    setViewedProfileUserId(userId);
  };

  const handleBackFromProfile = () => setViewedProfileUserId(null);

  // Desde el perfil de otro usuario, ver el detalle de una de sus recetas: sale
  // de la vista de perfil y muestra RecipeDetailPage como de costumbre.
  const handleOpenRecipeFromProfile = (idRecipe) => {
    setViewedProfileUserId(null);
    setSelectedRecipeId(idRecipe);
  };

  return (
    <div className="HomePage">
      <Sidebar activePanel={activePanel} onTogglePanel={handleTogglePanel} onLogout={onLogout} />

      <div className="HomePage-content">
        <main className="HomePage-main">
          {viewedProfileUserId !== null ? (
            // Perfil de solo lectura de otro usuario (se llega tocando su nombre
            // desde el detalle de una receta): tiene prioridad sobre cualquier panel.
            <ProfilePage
              userId={viewedProfileUserId}
              onBack={handleBackFromProfile}
              onRecipeClick={handleOpenRecipeFromProfile}
            />
          ) : (
            <>
              {activePanel === USER_PANELS.myRecipes && (
                <RecipePage
                  initialEditorTarget={myRecipesInitialTarget}
                  // Solo hay a dónde volver si el wizard se abrió desde Perfil; si el
                  // usuario entró por la sidebar, al cerrarlo se queda en "Mis recetas".
                  onEditorExit={myRecipesInitialTarget !== null ? handleRecipeEditorExit : undefined}
                />
              )}

              {activePanel === USER_PANELS.profile && (
                <ProfilePage
                  userId={currentUserId}
                  onEditRecipe={(recipeId) => handleOpenRecipeEditor(recipeId)}
                />
              )}

              {activePanel === USER_PANELS.inventory && (
                <InventoryPage />
              )}

              {activePanel === USER_PANELS.savedRecipes && (
                <SavedRecipesPage
                  onRecipeClick={handleOpenRecipeFromSaved}
                  onExploreClick={() => handleTogglePanel(null)}
                />
              )}

              {/* Detalle de receta individual — se abre al clickear una card del carrusel */}
              {selectedRecipeId !== null && activePanel === null && (
                <RecipeDetailPage
                  recipeId={selectedRecipeId}
                  onBack={() => setSelectedRecipeId(null)}
                  onAuthorClick={handleViewUserProfile}
                  isLoggedIn
                  isSaved={savedRecipeIds.has(selectedRecipeId)}
                  onToggleSave={handleToggleSaveRecipe}
                />
              )}

              {/* Vista normal de la home cuando no hay panel activo y no se está viendo
                  el detalle de una receta */}
              {activePanel === null && selectedRecipeId === null && (
                <>
                  <HomeFeatureCards />

                  <hr className="HomePage-divider" />

                  {isLoadingRecipes && <p className="HomePage-recipesStatus">Cargando recetas...</p>}
                  {recipesError && <p className="HomePage-recipesStatus">⚠ {recipesError}</p>}
                  {saveError && <p className="HomePage-recipesStatus">⚠ {saveError}</p>}
                  {!isLoadingRecipes && !recipesError && communityRecipes.length === 0 && (
                    <p className="HomePage-recipesStatus">
                      Todavía no hay recetas cargadas. ¡Sé el primero en publicar una desde "Mis recetas"!
                    </p>
                  )}
                  {!isLoadingRecipes && !recipesError && communityRecipes.length > 0 && (
                    <RecipeCarouselSection
                      title="Recetas de la comunidad"
                      recipes={communityRecipes.map((recipe) => ({
                        ...recipe,
                        isSaved: savedRecipeIds.has(recipe.id),
                      }))}
                      onRecipeClick={setSelectedRecipeId}
                      onToggleSave={handleToggleSaveRecipe}
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default HomePage;
