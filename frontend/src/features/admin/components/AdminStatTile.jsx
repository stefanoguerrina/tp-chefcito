// Tarjeta chica de cifra del dashboard (ej: "12 ingredientes"). Al tocarla lleva a la
// sección del panel que gestiona esa entidad.
// Recibe: icon (nombre del Material Symbol), label, value y onClick.
import '../styles/_admin-stat-tile.scss';

function AdminStatTile({ icon, label, value, onClick }) {
  return (
    <button type="button" className="AdminStatTile" onClick={onClick}>
      <span className="AdminStatTile-icon material-symbols-outlined">{icon}</span>
      <span className="AdminStatTile-text">
        <span className="AdminStatTile-value">{value}</span>
        <span className="AdminStatTile-label">{label}</span>
      </span>
      <span className="AdminStatTile-arrow material-symbols-outlined">chevron_right</span>
    </button>
  );
}

export default AdminStatTile;
