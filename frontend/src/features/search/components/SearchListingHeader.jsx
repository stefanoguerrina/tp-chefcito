// Encabezado de un listado completo de búsqueda: título ("Recetas de «pasta»"), cantidad
// de resultados y, a la derecha, los controles propios de cada listado (children).
import '../styles/_listing-controls.scss';

// Recibe: title (ej. "Recetas de"), highlight (opcional, lo buscado, va entre comillas y
// resaltado), summary (ej. "16 recetas encontradas") y children (controles).
function SearchListingHeader({ title, highlight, summary, children }) {
  return (
    <header className="SearchListingHeader">
      <div className="SearchListingHeader-text">
        <h1 className="SearchListingHeader-title">
          {title}
          {highlight && (
            <>
              {' '}
              <span>«{highlight}»</span>
            </>
          )}
        </h1>
        <p className="SearchListingHeader-summary">{summary}</p>
      </div>
      {children && <div className="SearchListingHeader-controls">{children}</div>}
    </header>
  );
}

export default SearchListingHeader;
