// Estado vacío de una sección (core/components): ícono, título y un texto que explica qué
// hacer. Es la contraparte de LoadingState y ErrorState para cuando la carga salió bien
// pero no hay nada para mostrar (ej. "Tu inventario está vacío", "No encontramos recetas").
import './_empty-state.scss';

// Recibe: icon (nombre de Material Symbols), title y message.
function EmptyState({ icon, title, message }) {
  return (
    <div className="EmptyState">
      <div className="EmptyState-icon">
        <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
      </div>
      <h3 className="EmptyState-title">{title}</h3>
      <p className="EmptyState-text">{message}</p>
    </div>
  );
}

export default EmptyState;
