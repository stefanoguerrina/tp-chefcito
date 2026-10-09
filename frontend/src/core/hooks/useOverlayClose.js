// Hook compartido: cierra un modal al tocar el fondo oscuro (overlay), pero SOLO si el
// click empezó y terminó en el fondo. Con un onClick={onClose} simple, apretar el mouse
// dentro del modal (ej. seleccionando texto de un input, o eligiendo una sugerencia del
// autocompletado del navegador) y soltarlo afuera cuenta como click en el fondo y cierra
// el modal, perdiendo todo lo que se había escrito.
import { useRef } from 'react';

// Recibe: onClose (o undefined para que el fondo no cierre, ej. mientras se guarda).
// Devuelve: { onMouseDown, onClick }, para esparcir en el div del overlay.
export const useOverlayClose = (onClose) => {
  // Si el último mousedown fue sobre el fondo mismo (no sobre algo de adentro del modal).
  const pressStartedOnOverlay = useRef(false);

  const handleMouseDown = (event) => {
    pressStartedOnOverlay.current = event.target === event.currentTarget;
  };

  const handleClick = (event) => {
    const isOverlayClick = pressStartedOnOverlay.current && event.target === event.currentTarget;
    pressStartedOnOverlay.current = false;
    if (isOverlayClick) onClose?.();
  };

  return { onMouseDown: handleMouseDown, onClick: handleClick };
};
