// Envoltorio que hace aparecer su contenido (fundido + subida corta) cada vez que entra en
// pantalla al scrollear: si se sale y se vuelve, la animación se repite. Es solo
// animación: no sabe qué contenido recibe.
import { useEffect, useRef, useState } from 'react';
import './_scroll-reveal.scss';

// Recibe: children, className e id (opcionales, se pasan al contenedor; el id sirve para
// llevar la pantalla hasta esa sección, ej. "Ver recetas" en el perfil).
function ScrollReveal({ children, className = '', id }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // IntersectionObserver avisa cuando el borde de arriba del bloque pasa el 90% de la
  // pantalla, sin escuchar el scroll a mano. Se mide por el borde (rootMargin) y no por un
  // porcentaje del bloque: uno muy alto (ej. la galería en mobile) nunca llegaría a verse
  // al 15% entero. Al salir de pantalla vuelve a ocultarse, así la próxima vez que entre
  // se anima de nuevo.
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      id={id}
      className={`ScrollReveal${isVisible ? ' ScrollReveal--visible' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;
