// Bloque que se suma a cada receta en modo "Inventario": cuántos ingredientes tenés,
// una barra de progreso y qué te falta.
import '../styles/_pantry-match.scss';

// Recibe: match ({ availableCount, totalCount, isComplete, percentage, missingNames,
// notEnoughNames }, ver searchListingModel).
function PantryMatchInfo({ match }) {
  return (
    <div className={`PantryMatchInfo${match.isComplete ? ' PantryMatchInfo--complete' : ''}`}>
      <p className="PantryMatchInfo-title">
        <span className="material-symbols-outlined" aria-hidden="true">
          {match.isComplete ? 'check_circle' : 'kitchen'}
        </span>
        {match.isComplete
          ? '¡Tenés todos los ingredientes!'
          : `Tenés ${match.availableCount} de ${match.totalCount} ingredientes`}
      </p>

      <div
        className="PantryMatchInfo-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={match.percentage}
        aria-label="Ingredientes que tenés"
      >
        {/* El ancho depende de cada receta: es el único estilo que va en línea. */}
        <span style={{ width: `${match.percentage}%` }} />
      </div>

      {match.missingNames.length > 0 && (
        <p className="PantryMatchInfo-detail">Te falta: {match.missingNames.join(', ')}</p>
      )}
      {match.notEnoughNames.length > 0 && (
        <p className="PantryMatchInfo-detail">Te queda poco: {match.notEnoughNames.join(', ')}</p>
      )}
    </div>
  );
}

export default PantryMatchInfo;
