// Hook compartido para secciones que quedan montadas aunque no se vean (ej. las del panel
// admin): cuando la sección vuelve a mostrarse, actualiza sus datos en segundo plano. Así se
// ve al instante con lo que ya tenía, sin el "Cargando...", y en seguida se pone al día con
// lo que haya cambiado mientras estaba oculta (ej. un ingrediente creado en otra sección).
import { useEffect, useRef } from 'react';

// Recibe: isActive (si la sección se está viendo) y refresh (vuelve a pedir los datos; solo
// debe cambiar el estado en los callbacks de la promesa, sin mostrar "cargando").
export const useRefreshOnReturn = (isActive, refresh) => {
  // Si se veía en el render anterior. Al montarse no hace nada (la sección ya pide sus
  // datos): solo actúa cuando pasa de oculta a visible. Comparar con el valor anterior (y
  // no con "¿es la primera vez?") evita un pedido de más cuando StrictMode, en desarrollo,
  // ejecuta los efectos dos veces.
  const wasActive = useRef(isActive);

  useEffect(() => {
    if (isActive && !wasActive.current) refresh();
    wasActive.current = isActive;
    // Solo importa el cambio de isActive: refresh es una función nueva en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);
};
