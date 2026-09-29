// Interruptor de vista del listado de recetas: cuadrícula o lista.
import '../styles/_listing-controls.scss';

const VIEW_MODES = [
  { value: 'grid', icon: 'grid_view', label: 'Vista en cuadrícula' },
  { value: 'list', icon: 'view_list', label: 'Vista en lista' },
];

// Recibe: value ('grid' | 'list') y onChange(value).
function ViewModeSwitch({ value, onChange }) {
  return (
    <div className="ViewModeSwitch" role="group" aria-label="Vista de resultados">
      {VIEW_MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          className={`ViewModeSwitch-button${value === mode.value ? ' ViewModeSwitch-button--active' : ''}`}
          aria-pressed={value === mode.value}
          aria-label={mode.label}
          title={mode.label}
          onClick={() => onChange(mode.value)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">{mode.icon}</span>
        </button>
      ))}
    </div>
  );
}

export default ViewModeSwitch;
