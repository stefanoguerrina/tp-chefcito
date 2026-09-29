// Banner de "Chefcito Bot" al final de los resultados de búsqueda: su botón abre el chat con
// el asistente IA (features/assistant).
import { useState } from 'react';
import AssistantChatModal from '../../assistant/components/AssistantChatModal.jsx';
import '../styles/_assistant-banner.scss';

// Recibe: title (pregunta del banner) y description (texto de apoyo).
function AssistantBanner({ title, description }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <section className="AssistantBanner" aria-label="Asistente IA">
      <div className="AssistantBanner-content">
        <span className="AssistantBanner-icon material-symbols-outlined" aria-hidden="true">smart_toy</span>
        <div>
          <h3 className="AssistantBanner-title">{title}</h3>
          <p className="AssistantBanner-description">{description}</p>
        </div>
      </div>
      <button type="button" className="AssistantBanner-button" onClick={() => setIsChatOpen(true)}>
        <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
        Consultar al Asistente IA
      </button>

      {isChatOpen && <AssistantChatModal onClose={() => setIsChatOpen(false)} />}
    </section>
  );
}

export default AssistantBanner;
