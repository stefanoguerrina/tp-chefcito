// Estado vacío de una sección de la home (ej. "Todavía no seguís a nadie"), con un link
// opcional para salir de ahí (ej. "Buscar perfiles").
import { Link } from 'react-router-dom';
import '../styles/_feed-section.scss';

// Recibe: icon (Material Symbols), title, message y, opcionales, actionLabel + actionTo
// (ruta a la que lleva el botón).
function FeedEmptyState({ icon, title, message, actionLabel, actionTo }) {
  return (
    <div className="FeedEmptyState">
      <span className="FeedEmptyState-icon material-symbols-outlined" aria-hidden="true">{icon}</span>
      <p className="FeedEmptyState-title">{title}</p>
      <p className="FeedEmptyState-message">{message}</p>
      {actionLabel && actionTo && (
        <Link className="FeedEmptyState-action" to={actionTo}>
          {actionLabel}
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </Link>
      )}
    </div>
  );
}

export default FeedEmptyState;
