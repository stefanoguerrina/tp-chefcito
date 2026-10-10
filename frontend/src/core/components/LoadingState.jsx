// Estado de carga de una sección (core/components): el spinner con un texto, mientras llegan
// los datos de una pantalla o panel. Es la contraparte de ErrorState (falla al cargar).
// Mientras está en pantalla, el loader global (RequestIndicator) no aparece: ya hay uno.
import { useEffect } from 'react';
import SwirlingLoader from './SwirlingLoader.jsx';
import { sectionLoaderShown, sectionLoaderHidden } from '../../shared/utils/requestTracker.js';
import './_loading-state.scss';

// Recibe: message (ej. "Cargando recetas..."), className (opcional, para ubicarlo en la pantalla).
function LoadingState({ message = 'Cargando...', className = '' }) {
  // Avisa que esta sección ya está mostrando que algo carga (ver requestTracker).
  useEffect(() => {
    sectionLoaderShown();
    return sectionLoaderHidden;
  }, []);

  return (
    <div className={`LoadingState ${className}`.trim()} role="status" aria-live="polite">
      <SwirlingLoader className="LoadingState-spinner" />
      <p className="LoadingState-message">{message}</p>
    </div>
  );
}

export default LoadingState;
