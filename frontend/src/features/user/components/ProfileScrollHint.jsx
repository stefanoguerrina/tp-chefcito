// Aviso al pie de una "pantalla" del perfil: sobre un difuminado, el nombre de la sección
// que sigue y una flecha. Queda pegado al borde de abajo de la pantalla y, al tocarlo,
// baja justo hasta esa sección.
import '../styles/_profile-scroll-hint.scss';

// Recibe: label (ej. "Recetas destacadas") y targetId (id de la sección a la que baja).
function ProfileScrollHint({ label, targetId }) {
  const handleClick = () =>
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="ProfileScrollHint">
      <button type="button" className="ProfileScrollHint-button" onClick={handleClick}>
        {label}
        <span className="ProfileScrollHint-arrow material-symbols-outlined" aria-hidden="true">
          keyboard_arrow_down
        </span>
      </button>
    </div>
  );
}

export default ProfileScrollHint;
