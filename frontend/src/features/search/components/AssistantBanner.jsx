// Banner de "Chefcito Bot" al final de los resultados de búsqueda. El asistente IA todavía
// no existe: el botón se muestra (así queda el diseño armado) pero no hace nada por ahora.
import '../styles/_assistant-banner.scss';

// Recibe: title (pregunta del banner) y description (texto de apoyo).
function AssistantBanner({ title, description }) {
  return (
    <section className="AssistantBanner" aria-label="Asistente IA">
      <div className="AssistantBanner-content">
        <span className="AssistantBanner-icon material-symbols-outlined" aria-hidden="true">smart_toy</span>
        <div>
          <h3 className="AssistantBanner-title">{title}</h3>
          <p className="AssistantBanner-description">{description}</p>
        </div>
      </div>
      {/* TODO: conectar con el chat de Chefcito Bot cuando exista (Fase 5 de tasks-division). */}
      <button type="button" className="AssistantBanner-button" aria-disabled="true" title="Próximamente">
        <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
        Consultar al Asistente IA
      </button>
    </section>
  );
}

export default AssistantBanner;
