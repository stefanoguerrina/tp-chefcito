// Carrusel horizontal de recetas (usado en la home para "Recetas de la comunidad").
// Se desplaza arrastrando las cards: con el dedo (scroll nativo del navegador) o con el
// mouse (lógica de arrastre de abajo). Sin flechas, sin clonar tarjetas ni scroll infinito.
import { useRef, useState } from 'react';
import HomeRecipeCard from './HomeRecipeCard.jsx';
import '../styles/_recipe-carousel-section.scss';

// Cuántos píxeles hay que mover el mouse para que cuente como arrastre y no como click.
const DRAG_THRESHOLD = 5;

// Recibe: title, recipes (ver recipeToCardProps + isSaved/rating/reviewsCount),
// onRecipeClick y onToggleSave (handlers opcionales que se pasan tal cual a cada card).
function RecipeCarouselSection({ title, recipes, onRecipeClick, onToggleSave }) {
  const trackRef = useRef(null);
  // Datos del arrastre en curso. Va en un ref (no en estado) porque cambia en cada
  // movimiento del mouse y no necesita re-renderizar nada.
  const dragRef = useRef({ isPressed: false, hasMoved: false, startX: 0, startScrollLeft: 0 });
  // Solo para la clase CSS (cursor "agarrando" y sin scroll-snap mientras se arrastra).
  const [isDragging, setIsDragging] = useState(false);

  // Al apretar el mouse se anota desde dónde arranca. El touch no pasa por acá: en
  // celular el navegador ya desplaza el carrusel solo, con su propio scroll nativo.
  const handlePointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragRef.current = {
      isPressed: true,
      hasMoved: false,
      startX: event.clientX,
      startScrollLeft: trackRef.current.scrollLeft,
    };
  };

  // Mientras el botón sigue apretado, el carrusel sigue al mouse (hacia el lado contrario
  // del movimiento, como cuando se arrastra una hoja con la mano).
  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag.isPressed) return;
    // Se soltó el botón fuera del carrusel antes de empezar a arrastrar: ya no hay arrastre.
    if (event.buttons === 0) {
      handlePointerUp();
      return;
    }

    const distance = event.clientX - drag.startX;
    if (!drag.hasMoved && Math.abs(distance) > DRAG_THRESHOLD) {
      drag.hasMoved = true;
      setIsDragging(true);
      // Sigue recibiendo el movimiento aunque el mouse salga del carrusel.
      trackRef.current.setPointerCapture(event.pointerId);
    }
    if (drag.hasMoved) {
      trackRef.current.scrollLeft = drag.startScrollLeft - distance;
    }
  };

  const handlePointerUp = () => {
    dragRef.current.isPressed = false;
    setIsDragging(false);
  };

  // Si hubo arrastre, el click que dispara el navegador al soltar no tiene que abrir la
  // receta ni tocar "guardar": se frena acá, en la fase de captura, antes de que llegue a
  // la card.
  const handleClickCapture = (event) => {
    if (!dragRef.current.hasMoved) return;
    event.stopPropagation();
    event.preventDefault();
    dragRef.current.hasMoved = false;
  };

  return (
    <section className="RecipeCarouselSection">
      <h2 className="RecipeCarouselSection-heading">{title}</h2>

      <div className="RecipeCarouselSection-viewport">
        {/* onDragStart evita que el navegador arrastre la foto como archivo en vez de
            desplazar el carrusel. */}
        <div
          className={`RecipeCarouselSection-track${isDragging ? ' RecipeCarouselSection-track--dragging' : ''}`}
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClickCapture={handleClickCapture}
          onDragStart={(event) => event.preventDefault()}
        >
          {recipes.map((recipe) => (
            <div className="RecipeCarouselSection-item" key={recipe.id}>
              <HomeRecipeCard
                recipe={recipe}
                onClick={onRecipeClick ? () => onRecipeClick(recipe.id) : undefined}
                onToggleSave={onToggleSave}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RecipeCarouselSection;
