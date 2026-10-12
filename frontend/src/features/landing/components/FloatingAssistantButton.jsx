// Botón flotante del futuro asistente ChatBot IA (ver docs/proposal.md, sección "Otros").
// Todavía no está implementado: por ahora solo abre el modal "necesitás una cuenta".
import '../styles/_floating-assistant-button.scss';

function FloatingAssistantButton({ onClick }) {
  return (
    <button
      type="button"
      aria-label="Asistente IA Chefcito"
      className="FloatingAssistantButton"
      onClick={onClick}
    >
      <span className="material-symbols-outlined">smart_toy</span>
    </button>
  );
}

export default FloatingAssistantButton;
