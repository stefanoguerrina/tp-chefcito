// Selector "Ordenar por" de los listados completos de búsqueda (con otro label, sirve
// también para elegir una opción de filtro, ej. la categoría en la galería del perfil).
import '../styles/_listing-controls.scss';

// Recibe: id (para asociar el label), options ([{ value, label }]), value, onChange(value)
// y label (opcional, por defecto "Ordenar por:").
function ListingSortSelect({ id, options, value, onChange, label = 'Ordenar por:' }) {
  return (
    <div className="ListingSortSelect">
      <label htmlFor={id}>{label}</label>
      <div className="ListingSortSelect-field">
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
      </div>
    </div>
  );
}

export default ListingSortSelect;
