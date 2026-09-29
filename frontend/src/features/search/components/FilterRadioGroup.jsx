// Grupo de filtros de opción única (radios) del panel de filtros de recetas, ej.
// "Tiempo de preparación: Cualquier tiempo / Hasta 15 min / ...".

// Recibe: title, name (agrupa los radios), options ([{ value, label }]), value (la
// opción elegida) y onChange(value).
function FilterRadioGroup({ title, name, options, value, onChange }) {
  return (
    <fieldset className="FilterGroup">
      <legend className="FilterGroup-title">{title}</legend>
      <div className="FilterGroup-options">
        {options.map((option) => (
          <label key={option.value} className="FilterGroup-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default FilterRadioGroup;
