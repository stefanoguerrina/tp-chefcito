// Capa que aparece sobre la foto de una card al pasar el mouse. Por defecto muestra "Ver
// receta" y es solo visual (un span, no un botón): el click lo maneja la card entera.
// Con `actions` muestra un botón por acción (ej. "Ver receta" / "Editar receta" en las
// recetas del perfil propio); cada botón hace lo suyo sin disparar el click de la card.
// La usan RecipeCard y la card grande de "Recetas por amigos".
// Quien la use tiene que ponerla dentro de la foto (position: relative) y hacerla visible
// al pasar el mouse por la card: `.MiCard:hover .RecipeHoverOverlay { opacity: 1; }`.
import './_recipe-hover-overlay.scss';

// Recibe: actions (opcional) = [{ label, icon, onClick, variant? }]; variant 'secondary'
// pinta el botón con borde en vez de relleno.
function RecipeHoverOverlay({ actions }) {
  if (!actions?.length) {
    return (
      <div className="RecipeHoverOverlay">
        <span className="RecipeHoverOverlay-action">Ver receta</span>
      </div>
    );
  }

  return (
    <div className="RecipeHoverOverlay">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={`RecipeHoverOverlay-action RecipeHoverOverlay-button${
            action.variant === 'secondary' ? ' RecipeHoverOverlay-button--secondary' : ''
          }`}
          // Sin stopPropagation, el click también le llegaría a la card (que abre el detalle).
          onClick={(event) => {
            event.stopPropagation();
            action.onClick();
          }}
        >
          {action.icon && <span className="material-symbols-outlined" aria-hidden="true">{action.icon}</span>}
          {action.label}
        </button>
      ))}
    </div>
  );
}

export default RecipeHoverOverlay;
