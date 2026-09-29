// Aviso arriba del listado en modo "Con mi despensa": cuenta para cuántas recetas tenés
// todo, o explica que se muestran las que más se acercan (o que la despensa está vacía).
import { Link } from 'react-router-dom';
import '../styles/_pantry-match.scss';

// Recibe: pantry ({ inventoryCount, completeCount }, del backend) y total (recetas que
// tienen al menos un ingrediente de la despensa).
function PantryNotice({ pantry, total }) {
  if (pantry.inventoryCount === 0) {
    return (
      <div className="PantryNotice PantryNotice--empty">
        <span className="material-symbols-outlined" aria-hidden="true">kitchen</span>
        <p>
          Tu despensa está vacía. Cargá los ingredientes que tenés en casa y te mostramos qué
          recetas podés preparar.
        </p>
        <Link to="/inventario" className="PantryNotice-link">Cargar ingredientes</Link>
      </div>
    );
  }

  const { completeCount } = pantry;
  let message;
  if (total === 0) {
    message = 'Ninguna receta usa los ingredientes que tenés cargados todavía.';
  } else if (completeCount > 0) {
    message = `Tenés todo lo necesario para ${completeCount} ${completeCount === 1 ? 'receta' : 'recetas'}. Después te mostramos las que están cerca.`;
  } else {
    message = 'Todavía no te alcanza para ninguna receta completa. Estas son las que más se acercan a lo que tenés.';
  }

  return (
    <div className={`PantryNotice${completeCount > 0 ? ' PantryNotice--success' : ''}`}>
      <span className="material-symbols-outlined" aria-hidden="true">
        {completeCount > 0 ? 'check_circle' : 'kitchen'}
      </span>
      <p>{message}</p>
      <Link to="/inventario" className="PantryNotice-link">Ver mi inventario</Link>
    </div>
  );
}

export default PantryNotice;
