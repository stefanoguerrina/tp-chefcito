// Sección de la home con un carrusel horizontal de recetas: título + flechas de scroll +
// lista de cards, arrastrable con el mouse (useDragScroll) o desplazable con los botones.
// El carrusel es "infinito": el contenido se triplica y useInfiniteScroll reubica el
// scroll sin que se note al llegar a un extremo, así siempre se puede seguir deslizando.
import { useRef } from 'react';
import { useDragScroll } from '../../../core/hooks/useDragScroll.js';
import { useInfiniteScroll } from '../../../core/hooks/useInfiniteScroll.js';
import HomeRecipeCard from './HomeRecipeCard.jsx';
import '../styles/_recipe-carousel-section.scss';

// Cuánto se desplaza el carrusel por cada click en una flecha (ancho de card + gap).
const SCROLL_STEP = 336;

// Recibe: title (encabezado de la sección), recipes (array, ver recipeToHomeCardProps),
// onRecipeClick (función que recibe el id de la receta al hacer click en una card),
// onToggleSave (función opcional que recibe el id de la receta al tocar el listón).
function RecipeCarouselSection({ title, recipes, onRecipeClick, onToggleSave }) {
  // Un mismo ref compartido por los dos hooks: ambos necesitan operar sobre el mismo
  // contenedor (uno escucha el drag del mouse, el otro el scroll para el loop infinito).
  const trackRef = useRef(null);
  useDragScroll(trackRef);
  useInfiniteScroll(trackRef);

  const scrollByStep = (amount) => {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="RecipeCarouselSection">
      <h2 className="RecipeCarouselSection-heading">{title}</h2>

      <div className="RecipeCarouselSection-viewport">
        <button
          type="button"
          className="RecipeCarouselSection-navButton RecipeCarouselSection-navButton--left"
          aria-label="Ver recetas anteriores"
          onClick={() => scrollByStep(-SCROLL_STEP)}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        <div className="RecipeCarouselSection-track" ref={trackRef}>
          {/* Triplicamos la lista (misma clave "copyIndex-id") para que siempre haya
              contenido antes y después de lo que se ve, y el salto del loop sea invisible. */}
          {[0, 1, 2].map((copyIndex) =>
            recipes.map((recipe) => (
              <HomeRecipeCard
                key={`${copyIndex}-${recipe.id}`}
                recipe={recipe}
                onClick={onRecipeClick ? () => onRecipeClick(recipe.id) : undefined}
                onToggleSave={onToggleSave}
              />
            ))
          )}
        </div>

        <button
          type="button"
          className="RecipeCarouselSection-navButton RecipeCarouselSection-navButton--right"
          aria-label="Ver más recetas"
          onClick={() => scrollByStep(SCROLL_STEP)}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </section>
  );
}

export default RecipeCarouselSection;
