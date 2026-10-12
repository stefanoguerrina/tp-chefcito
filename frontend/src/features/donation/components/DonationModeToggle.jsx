// Selector en forma de píldora de la página "Donaciones": cambia entre lo recibido y lo
// donado. Las tres tarjetas de la página muestran el lado elegido.
import '../styles/_donations-page.scss';

// Recibe: modes ([{ id, label, icon }]), activeId y onChange(id).
function DonationModeToggle({ modes, activeId, onChange }) {
  return (
    <div className="DonationModeToggle" role="tablist" aria-label="Qué donaciones ver">
      {modes.map((mode) => {
        const isActive = mode.id === activeId;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`DonationModeToggle-option${isActive ? ' DonationModeToggle-option--active' : ''}`}
            onClick={() => onChange(mode.id)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">{mode.icon}</span>
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

export default DonationModeToggle;
