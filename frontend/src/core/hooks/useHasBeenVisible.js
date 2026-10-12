// Hook compartido: avisa cuando un elemento entra en pantalla por primera vez. Sirve para
// cargar los datos de una "pantalla" (ej. las secciones de más abajo de la home o del
// perfil) recién cuando el usuario llega a ella, y no todas juntas al abrir la página.
import { useEffect, useState } from 'react';

// Recibe: nada. Devuelve: { ref, hasBeenVisible }. El ref va en el elemento a observar;
// hasBeenVisible pasa a true cuando su borde de arriba entra en el 90% superior de la
// pantalla (mismo criterio que ScrollReveal) y ya no vuelve a false: una vez cargada, la
// sección se queda montada aunque se scrollee hacia otro lado.
export const useHasBeenVisible = () => {
  // El elemento se guarda en el estado (React llama a setElement con el nodo al montarlo)
  // en vez de en un useRef: así el efecto arranca también cuando el elemento aparece
  // después del primer render (ej. el perfil muestra primero "Cargando perfil...").
  const [element, setElement] = useState(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      // Margen negativo abajo: una pantalla que arranca justo en el borde inferior de la
      // ventana no cuenta como visible hasta que el usuario empieza a scrollear hacia ella.
      { rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return { ref: setElement, hasBeenVisible };
};
