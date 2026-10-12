// Estado de error de una sección (core/components): se muestra cuando falla la carga de
// datos de una pantalla o panel, con un botón "Reintentar" para volver a pedirlos.
// Criterio de la app: fallas al CARGAR → ErrorState; fallas de una ACCIÓN (guardar,
// borrar) → AlertModal; errores de un campo de formulario → texto debajo del campo.
import './_error-state.scss';

// Recibe: message (texto del error), onRetry (opcional; si no viene, no hay botón),
// title (opcional).
function ErrorState({ message, onRetry, title = 'No pudimos cargar esta sección' }) {
  return (
    <div className="ErrorState" role="alert">
      <span className="material-symbols-outlined ErrorState-icon" aria-hidden="true">
        cloud_off
      </span>
      <p className="ErrorState-title">{title}</p>
      <p className="ErrorState-message">{message}</p>
      {onRetry && (
        <button type="button" className="ErrorState-retry" onClick={onRetry}>
          <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
          Reintentar
        </button>
      )}
    </div>
  );
}

export default ErrorState;
