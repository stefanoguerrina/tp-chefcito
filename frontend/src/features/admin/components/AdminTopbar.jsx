// Barra superior del panel: muestra el título de la sección activa. No tiene botón de
// "Actualizar": cada sección ya refleja sus propios cambios (altas, ediciones y bajas) sin
// volver a pedir todo, y se recarga sola cada vez que se entra a ella.
// Recibe: title y subtitle (opcional).
import '../styles/_admin-topbar.scss';

function AdminTopbar({ title, subtitle }) {
  return (
    <header className="AdminTopbar">
      <div className="AdminTopbar-titles">
        <h1 className="AdminTopbar-title">{title}</h1>
        {subtitle && <p className="AdminTopbar-subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}

export default AdminTopbar;
