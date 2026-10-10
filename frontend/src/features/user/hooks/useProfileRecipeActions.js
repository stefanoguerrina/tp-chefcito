// Hook con lo que pasa al tocar una receta del perfil: abrir su detalle y, en el perfil
// propio, los botones "Ver receta" / "Editar receta" que aparecen al pasar el mouse.
import { useNavigate } from 'react-router-dom';

// Recibe: isOwnProfile. Devuelve: { handleRecipeClick(recipeId), getRecipeHoverActions }
// (getRecipeHoverActions es undefined en un perfil ajeno: la card usa su "Ver receta").
export const useProfileRecipeActions = (isOwnProfile) => {
  const navigate = useNavigate();

  // Tocar una receta abre su detalle (el mismo que ven los demás).
  const handleRecipeClick = (recipeId) => navigate(`/recetas/${recipeId}`);

  // En el perfil propio, al pasar el mouse por una receta aparecen dos botones: "Ver
  // receta" (el detalle) y "Editar receta" (el editor, que al terminar vuelve acá).
  // Recibe: el id de la receta. Devuelve: las acciones para RecipeCard (hoverActions).
  const getRecipeHoverActions = isOwnProfile
    ? (recipeId) => [
      { label: 'Ver receta', icon: 'visibility', onClick: () => handleRecipeClick(recipeId) },
      {
        label: 'Editar receta',
        icon: 'edit',
        variant: 'secondary',
        onClick: () => navigate(`/mis-recetas/${recipeId}/editar`, { state: { from: '/perfil' } }),
      },
    ]
    : undefined;

  return { handleRecipeClick, getRecipeHoverActions };
};
