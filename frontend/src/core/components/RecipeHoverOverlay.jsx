// Capa "Ver receta" que aparece sobre la foto de una card al pasar el mouse. Es solo visual
// (un span, no un botón): el click lo maneja la card entera. Texto genérico porque el
// destino varía según quién la use (ver detalle, ir al editor...): lo decide el onClick de
// la card. La usan RecipeCard y la card grande de "Recetas por amigos".
// Quien la use tiene que ponerla dentro de la foto (position: relative) y hacerla visible
// al pasar el mouse por la card: `.MiCard:hover .RecipeHoverOverlay { opacity: 1; }`.
import './_recipe-hover-overlay.scss';

function RecipeHoverOverlay() {
  return (
    <div className="RecipeHoverOverlay">
      <span className="RecipeHoverOverlay-action">Ver receta</span>
    </div>
  );
}

export default RecipeHoverOverlay;
