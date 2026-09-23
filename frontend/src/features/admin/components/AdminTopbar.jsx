// Barra superior del panel: muestra el título de la sección activa y, si la sección lo
// necesita, un botón para recargar sus datos.
// Recibe: title, subtitle, onRefresh (opcional: si no viene, no se muestra el botón) e
//         isRefreshing (deshabilita el botón mientras carga).
import '../styles/_admin-topbar.scss';

function AdminTopbar({ title, subtitle, onRefresh, isRefreshing }) {
  return (
    <header className="AdminTopbar">
      <div className="AdminTopbar-titles">
        <h1 className="AdminTopbar-title">{title}</h1>
        {subtitle && <p className="AdminTopbar-subtitle">{subtitle}</p>}
      </div>

      {onRefresh && (
        <button
          type="button"
          className="AdminTopbar-refresh"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <span className="material-symbols-outlined">refresh</span>
          {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      )}
    </header>
  );
}

export default AdminTopbar;
