// Loader global (core/components): un cartelito flotante con el spinner que aparece cuando
// un pedido al backend tarda, así el usuario sabe que algo se está ejecutando (guardar,
// borrar, cambiar de página en un listado, etc.). Va una sola vez, en App.jsx.
// No aparece si la pantalla ya muestra su propio spinner (LoadingState) ni en los pedidos
// marcados como background en apiFetch.
import { useEffect, useRef, useState } from 'react';
import SwirlingLoader from './SwirlingLoader.jsx';
import { needsGlobalLoader, subscribeToRequests } from '../../shared/utils/requestTracker.js';
import './_request-indicator.scss';

// Cuánto tiene que tardar un pedido para mostrar el loader: los que responden antes no lo
// hacen parpadear.
const SHOW_DELAY_MS = 400;

function RequestIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const showTimerRef = useRef(null);

  useEffect(() => {
    // Se ejecuta cada vez que empieza o termina un pedido, o aparece/desaparece un LoadingState.
    const handleChange = () => {
      if (!needsGlobalLoader()) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
        setIsVisible(false);
        return;
      }
      // Hay que mostrarlo: se espera SHOW_DELAY_MS por si el pedido termina rápido.
      if (!showTimerRef.current) {
        showTimerRef.current = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
      }
    };

    const unsubscribe = subscribeToRequests(handleChange);
    return () => {
      unsubscribe();
      clearTimeout(showTimerRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="RequestIndicator" role="status" aria-live="polite">
      <SwirlingLoader className="RequestIndicator-spinner" />
      <span>Cargando…</span>
    </div>
  );
}

export default RequestIndicator;
