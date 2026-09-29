// Encabezado de una sección de la home: título en mayúsculas con el degradé de la marca
// (como "Recetas destacadas" del perfil), una bajada y, a la derecha, acciones opcionales
// (ej. las flechas del carrusel o un link).
import '../styles/_feed-section.scss';

// Recibe: title, subtitle (opcional), titleId (id del <h2>, para que la sección lo use de
// nombre accesible con aria-labelledby) y children (las acciones, opcionales).
function FeedSectionHeader({ title, subtitle, titleId, children }) {
  return (
    <header className="FeedSectionHeader">
      <div className="FeedSectionHeader-text">
        <h2 className="FeedSectionHeader-title" id={titleId}>{title}</h2>
        {subtitle && <p className="FeedSectionHeader-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="FeedSectionHeader-actions">{children}</div>}
    </header>
  );
}

export default FeedSectionHeader;
