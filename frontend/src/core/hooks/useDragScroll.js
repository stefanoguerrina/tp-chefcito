// Hook compartido para las filas horizontales que se desplazan (carruseles): con el dedo
// (scroll nativo del navegador), arrastrando con el mouse o con flechas "anterior /
// siguiente". Es la lógica de arrastre que tenía el carrusel de la vieja home, más las flechas.
import { useEffect, useRef, useState } from 'react';

// Cuántos píxeles hay que mover el mouse para que cuente como arrastre y no como click.
const DRAG_THRESHOLD = 5;

// Margen para dar por llegado a un extremo (el scroll puede quedar en 0.5px por redondeo).
const EDGE_TOLERANCE = 4;

// Recibe: el estado anterior de las flechas y el elemento que scrollea. Devuelve si quedó
// contenido escondido a cada lado. Si no cambió nada devuelve el mismo objeto: así React
// no vuelve a renderizar en cada evento de scroll.
const nextEdges = (prev, track) => {
  const canScrollPrev = track.scrollLeft > EDGE_TOLERANCE;
  const canScrollNext = track.scrollLeft + track.clientWidth < track.scrollWidth - EDGE_TOLERANCE;
  if (prev.canScrollPrev === canScrollPrev && prev.canScrollNext === canScrollNext) return prev;
  return { canScrollPrev, canScrollNext };
};

// Devuelve:
//   trackRef: va en el elemento que scrollea (overflow-x: auto).
//   trackHandlers: van en ese mismo elemento ({...trackHandlers}).
//   isDragging: true mientras se arrastra con el mouse (para la clase CSS).
//   canScrollPrev / canScrollNext: si hay más contenido hacia cada lado (flechas activas).
//   scrollByPage(direction): -1 = anterior, 1 = siguiente; desplaza casi un ancho visible.
export const useDragScroll = () => {
  const trackRef = useRef(null);
  // Datos del arrastre en curso. Va en un ref (no en estado) porque cambia en cada
  // movimiento del mouse y no necesita re-renderizar nada.
  const dragRef = useRef({ isPressed: false, hasMoved: false, startX: 0, startScrollLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [edges, setEdges] = useState({ canScrollPrev: false, canScrollNext: false });

  // ResizeObserver avisa apenas empieza a observar y cada vez que cambia el ancho (ej. al
  // girar el celular o abrir la sidebar): así las flechas arrancan en el estado correcto.
  useEffect(() => {
    const track = trackRef.current;
    const observer = new ResizeObserver(() => setEdges((prev) => nextEdges(prev, track)));
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // Al apretar el mouse se anota desde dónde arranca. El touch no pasa por acá: en
  // celular el navegador ya desplaza la fila solo, con su propio scroll nativo.
  const handlePointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragRef.current = {
      isPressed: true,
      hasMoved: false,
      startX: event.clientX,
      startScrollLeft: trackRef.current.scrollLeft,
    };
  };

  const handlePointerUp = () => {
    dragRef.current.isPressed = false;
    setIsDragging(false);
  };

  // Mientras el botón sigue apretado, la fila sigue al mouse (hacia el lado contrario
  // del movimiento, como cuando se arrastra una hoja con la mano).
  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag.isPressed) return;
    // Se soltó el botón fuera de la fila antes de empezar a arrastrar: ya no hay arrastre.
    if (event.buttons === 0) {
      handlePointerUp();
      return;
    }

    const distance = event.clientX - drag.startX;
    if (!drag.hasMoved && Math.abs(distance) > DRAG_THRESHOLD) {
      drag.hasMoved = true;
      setIsDragging(true);
      // Sigue recibiendo el movimiento aunque el mouse salga de la fila.
      trackRef.current.setPointerCapture(event.pointerId);
    }
    if (drag.hasMoved) {
      trackRef.current.scrollLeft = drag.startScrollLeft - distance;
    }
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

  // Desplaza el 85% de lo visible: la última card que se veía queda asomada del otro lado,
  // así no se pierde la referencia de dónde se estaba.
  const scrollByPage = (direction) => {
    const track = trackRef.current;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' });
  };

  return {
    trackRef,
    trackHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onClickCapture: handleClickCapture,
      onScroll: () => setEdges((prev) => nextEdges(prev, trackRef.current)),
      // Evita que el navegador arrastre la foto como archivo en vez de desplazar la fila.
      onDragStart: (event) => event.preventDefault(),
    },
    isDragging,
    ...edges,
    scrollByPage,
  };
};
