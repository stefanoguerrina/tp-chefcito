// Botones de modo de un listado, de los que hay uno solo activo a la vez (ej. "Todo" /
// "Con mi despensa" en recetas, o "Todas" / "Con recetas" en categorías).
import '../styles/_listing-controls.scss';

// Recibe: options ([{ value, label, icon?, count? }]; count se muestra como globito, solo
// en la opción activa), value (la opción activa), onChange(value) y label (describe el
// grupo para lectores de pantalla).
function ListingModeToggle({ options, value, onChange, label }) {
  return (
    <div className="ListingModeToggle" role="group" aria-label={label}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            className={`ListingModeToggle-button${isActive ? ' ListingModeToggle-button--active' : ''}`}
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
          >
            {option.icon && <span className="material-symbols-outlined" aria-hidden="true">{option.icon}</span>}
            {option.label}
            {isActive && option.count !== undefined && <span className="ListingModeToggle-count">{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default ListingModeToggle;
