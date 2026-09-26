// Home page (ruta "/") — inicio de un usuario común: accesos rápidos y el carrusel de
// recetas de la comunidad. La sidebar la pone UserLayout; las demás secciones (Mis
// recetas, Perfil, Inventario, etc.) son rutas propias (ver App.jsx).
// Un admin nunca llega acá: ProtectedRoute lo manda a /admin.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeFeatureCards from '../../recipe/components/HomeFeatureCards.jsx';
import RecipeCarouselSection from '../../recipe/components/RecipeCarouselSection.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import { getAllRecipes } from '../../recipe/services/recipeService.js';
import { recipeToHomeCardProps } from '../../recipe/models/recipeModel.js';
import { useSavedRecipes } from '../../userRecipe/hooks/useSavedRecipes.js';
import { useAuthContext } from '../../../app/AuthContext.jsx';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';

function HomePage() {
  const navigate = useNavigate();
  const { userId } = useAuthContext();
  const { savedRecipeIds, handleToggleSave, saveError, clearSaveError } = useSavedRecipes();

  // Recetas publicadas por otros usuarios (un 404 = todavía no hay ninguna).
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [recipesError, setRecipesError] = useState('');

  // "Recetas de la comunidad" es para descubrir lo que publicaron otros, no las propias
  // (esas ya se gestionan desde "Mis recetas").
  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede
  // llamar desde el useEffect sin renders en cascada.
  const loadRecipes = () =>
    fetchListOrEmpty(() => getAllRecipes())
      .then((recipes) => {
        const othersRecipes = recipes.filter((recipe) => recipe.idUser !== userId);
        setCommunityRecipes(othersRecipes.map(recipeToHomeCardProps));
        setRecipesError('');
      })
      .catch((err) => setRecipesError(err.message))
      .finally(() => setIsLoadingRecipes(false));

  // Reintento manual después de un error de carga.
  const handleRetry = () => {
    setIsLoadingRecipes(true);
    loadRecipes();
  };

  useEffect(() => {
    loadRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleRecipeClick = (idRecipe) => navigate(`/recetas/${idRecipe}`);

  return (
    <>
      <HomeFeatureCards />

      <hr className="HomePage-divider" />

      {isLoadingRecipes && <p className="HomePage-recipesStatus">Cargando recetas...</p>}
      {recipesError && <ErrorState message={recipesError} onRetry={handleRetry} />}
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
          onRecipeClick={handleRecipeClick}
          onToggleSave={handleToggleSave}
        />
      )}

      {saveError && (
        <AlertModal title="No se pudo guardar la receta" message={saveError} onClose={clearSaveError} />
      )}
    </>
  );
}

export default HomePage;
