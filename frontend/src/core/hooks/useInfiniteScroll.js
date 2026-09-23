// Hook compartido: hace que un carrusel horizontal se sienta infinito. Se usa junto con
// un track cuyo contenido fue triplicado (ver RecipeCarouselSection): al montar, arranca
// centrado en la copia del medio, y cuando el scroll entra en la copia anterior o
// siguiente, salta sin animación a la posición equivalente de la copia del medio — como
// las tres copias son idénticas, el salto es imperceptible y el usuario puede seguir
// deslizando para siempre en cualquier dirección.
import { useLayoutEffect } from 'react';

const COPIES = 3;

// Recibe: trackRef (el contenedor con overflow-x: auto cuyo contenido está triplicado) y
// enabled (RecipeCarouselSection lo pone en false cuando hay pocas recetas: si el track
// no está triplicado, dividir scrollWidth por 3 daría una posición inicial incorrecta,
// y las 2-3 copias visibles a la vez se verían como recetas "duplicadas").
export const useInfiniteScroll = (trackRef, enabled = true) => {
  // useLayoutEffect (no useEffect) para que el salto a la copia del medio pase antes
  // del primer paint: si no, se alcanza a ver un parpadeo arrancando en la copia 1.
  useLayoutEffect(() => {
    if (!enabled) return undefined;
    const track = trackRef.current;
    if (!track) return undefined;

    // Arranca en la copia del medio para tener margen de sobra hacia ambos lados.
    track.scrollLeft = track.scrollWidth / COPIES;

    const handleScroll = () => {
      const copyWidth = track.scrollWidth / COPIES;
      if (track.scrollLeft < copyWidth) {
        // Entró a la copia anterior: lo reubicamos una copia más adelante.
        track.scrollLeft += copyWidth;
      } else if (track.scrollLeft >= copyWidth * 2) {
        // Entró a la copia siguiente: lo reubicamos una copia más atrás.
        track.scrollLeft -= copyWidth;
      }
    };

    track.addEventListener('scroll', handleScroll);
    return () => track.removeEventListener('scroll', handleScroll);
  }, [trackRef, enabled]);
};
