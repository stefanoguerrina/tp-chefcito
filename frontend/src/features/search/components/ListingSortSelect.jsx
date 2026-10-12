// Selector "Ordenar por" de los listados completos de búsqueda (con otro label, sirve
// también para elegir una opción de filtro, ej. la categoría en la galería del perfil).
// Usa el desplegable propio DropdownSelect, no el <select> nativo.
import DropdownSelect from '../../../core/components/DropdownSelect.jsx';
import '../styles/_listing-controls.scss';

// Recibe: id (para asociar el label), options ([{ value, label }]), value, onChange(value)
// y label (opcional, por defecto "Ordenar por:").
function ListingSortSelect({ id, options, value, onChange, label = 'Ordenar por:' }) {
  return (
    <div className="ListingSortSelect">
      <label htmlFor={id}>{label}</label>
      <div className="ListingSortSelect-field">
        <DropdownSelect id={id} value={value} options={options} onChange={onChange} />
      </div>
    </div>
  );
}

export default ListingSortSelect;
