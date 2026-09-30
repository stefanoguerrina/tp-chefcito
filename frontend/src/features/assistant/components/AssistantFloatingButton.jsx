// Botón flotante de Chefcito Bot, abajo a la derecha en todas las secciones del usuario
// (lo monta UserLayout). Es un círculo con el ícono del bot que, al pasar el mouse, se
// estira y muestra "Chefcito Bot". Al tocarlo abre el chat (AssistantChatModal).
import { useState } from 'react';
import AssistantChatModal from './AssistantChatModal.jsx';
import '../styles/_assistant-floating-button.scss';

function AssistantFloatingButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Mientras el chat está abierto el botón se oculta: el chat ocupa ese lugar. */}
      {!isChatOpen && (
        <button
          type="button"
          className="AssistantFloatingButton"
          onClick={() => setIsChatOpen(true)}
          aria-label="Abrir Chefcito Bot"
        >
          <span className="material-symbols-outlined" aria-hidden="true">smart_toy</span>
          <span className="AssistantFloatingButton-label" aria-hidden="true">Chefcito Bot</span>
        </button>
      )}

      {isChatOpen && <AssistantChatModal onClose={() => setIsChatOpen(false)} />}
    </>
  );
}

export default AssistantFloatingButton;
