// Botón redondo con el listón de "guardar receta" que va sobre la foto de una card. Guardada
// = relleno con el degradé de la marca. Lo usan RecipeCard y las cards de la home. Dónde se
// ubica sobre la foto lo decide quien lo usa (con className).
import './_save-recipe-button.scss';

// Recibe: isSaved, onToggle() (guarda o quita la receta), size ('md' o 'sm', para las
// cards compactas) y className (para posicionarlo).
function SaveRecipeButton({ isSaved, onToggle, size = 'md', className = '' }) {
  // El botón vive dentro de una card clickeable: stopPropagation evita que el click
  // también abra la receta.
  const handleClick = (event) => {
    event.stopPropagation();
    onToggle?.();
  };

  const classes = [
    'SaveRecipeButton',
    size === 'sm' && 'SaveRecipeButton--small',
    isSaved && 'SaveRecipeButton--saved',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      aria-label={isSaved ? 'Quitar receta guardada' : 'Guardar receta'}
      title={isSaved ? 'Quitar de guardadas' : 'Guardar receta'}
      aria-pressed={Boolean(isSaved)}
      onClick={handleClick}
    >
      <span className="material-symbols-outlined" aria-hidden="true">bookmark</span>
    </button>
  );
}

export default SaveRecipeButton;
