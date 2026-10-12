// Banner al pie de "Mi inventario": acceso directo al listado de recetas con el filtro
// "Inventario" activado (las que se pueden hacer con lo cargado, primero las completas).
// Los estilos están en _inventory-page.scss.
import { Link } from 'react-router-dom';

function InventorySuggestionBanner() {
  return (
    <div className="InventoryBanner">
      <div className="InventoryBanner-body">
        <div className="InventoryBanner-icon">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <div className="InventoryBanner-text">
          <h4>¿Qué podés cocinar hoy con estos ingredientes?</h4>
          <p>Chefcito cruza tu inventario con las recetas publicadas y te muestra primero las que podés hacer.</p>
        </div>
      </div>
      <Link to="/buscar/recetas?inventario=1" className="InventoryBanner-btn">
        Ver recetas posibles
        <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </Link>
    </div>
  );
}

export default InventorySuggestionBanner;
