// Home page — vista principal que se muestra tras un login exitoso.
// Compone el layout autenticado (sidebar fija) y, solo para un admin, permite alternar
// entre el contenido normal de la home y los paneles de administración.
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import HomeFeatureCards from '../../recipe/components/HomeFeatureCards.jsx';
import RecipeCarouselSection from '../../recipe/components/RecipeCarouselSection.jsx';
import SearchUsersForm from '../components/SearchUsersForm.jsx';
import RolePage from '../../role/pages/RolePage.jsx';
import IngredientCategoryPage from '../../ingredientCategory/pages/IngredientCategoryPage.jsx';
import IngredientPage from '../../ingredient/pages/IngredientPage.jsx';
import RecipePage from '../../recipe/pages/RecipePage.jsx';
import RecipeDetailPage from '../../recipe/pages/RecipeDetailPage.jsx';
import { getAllRecipes } from '../../recipe/services/recipeService.js';
import { recipeToHomeCardProps } from '../../recipe/models/recipeModel.js';
import '../styles/_home-page.scss';

// Paneles de admin disponibles. 'null' es la home normal.
const ADMIN_PANELS = {
  users: 'users',
  roles: 'roles',
  ingredientCategories: 'ingredientCategories',
  ingredients: 'ingredients',
};

// Paneles disponibles para cualquier usuario autenticado (no requieren rol admin).
const USER_PANELS = {
  myRecipes: 'myRecipes',
};

// Recibe: isAdmin (habilita los paneles de administración en la sidebar).
function HomePage({ isAdmin }) {
  // Panel admin activo: null = home normal, o una clave de ADMIN_PANELS.
  const [activeAdminPanel, setActiveAdminPanel] = useState(null);
  // Id de la receta cuyo detalle se está mostrando (null = sin detalle abierto).
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // Recetas reales cargadas por los usuarios (ya no hay datos de muestra acá).
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [recipesError, setRecipesError] = useState('');

  // Se recarga cada vez que se vuelve a la vista normal (activeAdminPanel a
  // null), no solo al montar: si no, después de crear/editar una receta desde
  // "Mis recetas" y volver a Inicio, la lista quedaba con los datos viejos.
  useEffect(() => {
    if (activeAdminPanel !== null) return;
    (async () => {
      setIsLoadingRecipes(true);
      setRecipesError('');
      try {
        const recipes = await getAllRecipes();
        setCommunityRecipes(recipes.map(recipeToHomeCardProps));
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
  }, [activeAdminPanel]);

  // Alterna un panel: si ya está activo lo cierra, si no lo abre.
  const handleTogglePanel = (panel) => {
    setActiveAdminPanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="HomePage">
      <Sidebar
        isAdmin={isAdmin}
        activeAdminPanel={activeAdminPanel}
        onTogglePanel={handleTogglePanel}
      />

      <div className="HomePage-content">
        <main className="HomePage-main">
          {isAdmin && activeAdminPanel === ADMIN_PANELS.users && (
            <SearchUsersForm />
          )}

          {isAdmin && activeAdminPanel === ADMIN_PANELS.roles && (
            <RolePage />
          )}

          {isAdmin && activeAdminPanel === ADMIN_PANELS.ingredientCategories && (
            <IngredientCategoryPage />
          )}

          {isAdmin && activeAdminPanel === ADMIN_PANELS.ingredients && (
            <IngredientPage />
          )}

          {activeAdminPanel === USER_PANELS.myRecipes && (
            <RecipePage />
          )}

          {/* Detalle de receta individual — se abre al clickear una card del carrusel */}
          {selectedRecipeId !== null && activeAdminPanel === null && (
            <RecipeDetailPage
              recipeId={selectedRecipeId}
              onBack={() => setSelectedRecipeId(null)}
              isLoggedIn
            />
          )}

          {/* Vista normal de la home cuando no hay panel admin ni de usuario activo y
              no se está viendo el detalle de una receta */}
          {activeAdminPanel === null && selectedRecipeId === null && (
            <>
              <HomeFeatureCards />

              <p className="HomePage-subtitle">Descubrí nuevas ideas para tu cocina hoy</p>
              <hr className="HomePage-divider" />

              {isLoadingRecipes && <p className="HomePage-recipesStatus">Cargando recetas...</p>}
              {recipesError && <p className="HomePage-recipesStatus">⚠ {recipesError}</p>}
              {!isLoadingRecipes && !recipesError && communityRecipes.length === 0 && (
                <p className="HomePage-recipesStatus">
                  Todavía no hay recetas cargadas. ¡Sé el primero en publicar una desde "Mis recetas"!
                </p>
              )}
              {!isLoadingRecipes && !recipesError && communityRecipes.length > 0 && (
                <RecipeCarouselSection
                  title="Recetas de la comunidad"
                  recipes={communityRecipes}
                  onRecipeClick={setSelectedRecipeId}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default HomePage;
