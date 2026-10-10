// Ventana de chat con Chefcito Bot: muestra la conversación, sugerencias para arrancar y el
// campo para escribir. Las respuestas del bot usan el inventario del usuario (lo arma el backend).
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AlertModal from '../../../core/components/AlertModal.jsx';
import { useOverlayClose } from '../../../core/hooks/useOverlayClose.js';
import { useAssistantChat } from '../hooks/useAssistantChat.js';
import '../styles/_assistant-chat-modal.scss';

const MAX_MESSAGE_LENGTH = 1000;

const SUGGESTED_PROMPTS = [
  '¿Qué puedo cocinar con lo que tengo?',
  'Una cena rápida en menos de 30 minutos',
  'Una idea de almuerzo liviano',
];

// Recibe: onClose (cierra la ventana; la conversación se pierde al desmontar).
function AssistantChatModal({ onClose }) {
  const { messages, isSending, error, sendMessage, clearError } = useAssistantChat();
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const overlayCloseProps = useOverlayClose(onClose);

  // Baja hasta el último mensaje cada vez que llega uno nuevo o aparece "escribiendo...".
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, isSending]);

  // Al cerrar el aviso de error, el input vuelve a habilitarse pero pierde el foco: se lo
  // devolvemos para que el usuario pueda reintentar sin hacer clic.
  useEffect(() => {
    if (!error) inputRef.current?.focus();
  }, [error]);

  // Escape cierra la ventana, como cualquier diálogo. Si hay un aviso de error abierto,
  // cierra solo el aviso (que está encima) y deja el chat.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (error) clearError();
      else onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, error, clearError]);

  // Recibe: el texto a enviar. Si el envío falla, lo devuelve al input para reintentar.
  const handleSend = async (text) => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending || error) return;
    setDraft('');
    const wasSent = await sendMessage(trimmedText);
    if (!wasSent) setDraft(trimmedText);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSend(draft);
  };

  // Se monta en <body> con un portal: quien abre el chat puede estar dentro de un contenedor
  // con transform u overflow (ej. ScrollReveal), que haría que el overlay no cubra la pantalla.
  return createPortal(
    <>
      <div className="AssistantChat-overlay" {...overlayCloseProps}>
        <div
          className="AssistantChat-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-chat-title"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="AssistantChat-header">
            <span className="AssistantChat-avatar material-symbols-outlined" aria-hidden="true">smart_toy</span>
            <div className="AssistantChat-headerText">
              <h2 className="AssistantChat-title" id="assistant-chat-title">Chefcito Bot</h2>
              <p className="AssistantChat-subtitle">Ideas con los ingredientes de tu inventario</p>
            </div>
            <button type="button" className="AssistantChat-close" onClick={onClose} aria-label="Cerrar chat">
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
          </header>

          <div className="AssistantChat-messages" aria-live="polite">
            {messages.length === 0 && (
              <div className="AssistantChat-welcome">
                <p className="AssistantChat-bubble AssistantChat-bubble--assistant">
                  ¡Hola! Soy Chefcito Bot. Contame qué tenés ganas de comer y te sugiero recetas con lo que
                  cargaste en tu inventario.
                </p>
                <div className="AssistantChat-suggestions">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button key={prompt} type="button" className="AssistantChat-suggestion" onClick={() => handleSend(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <p key={message.id} className={`AssistantChat-bubble AssistantChat-bubble--${message.role}`}>
                {message.text}
              </p>
            ))}

            {isSending && (
              <p className="AssistantChat-bubble AssistantChat-bubble--assistant AssistantChat-typing">
                Chefcito Bot está escribiendo
                <span className="AssistantChat-dots" aria-hidden="true"><span /><span /><span /></span>
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="AssistantChat-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="AssistantChat-input"
              placeholder="Escribí tu consulta..."
              value={draft}
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(event) => setDraft(event.target.value)}
              // Mientras se ve el aviso de error se deshabilita: si no, el foco queda acá y un Enter
              // (para cerrar el aviso) reenviaba el mensaje y el aviso volvía a aparecer.
              disabled={Boolean(error)}
              aria-label="Mensaje para Chefcito Bot"
              autoFocus
            />
            <button type="submit" className="AssistantChat-send" disabled={!draft.trim() || isSending} aria-label="Enviar mensaje">
              <span className="material-symbols-outlined" aria-hidden="true">send</span>
            </button>
          </form>
        </div>
      </div>

      {error && <AlertModal title="No se pudo enviar el mensaje" message={error} onClose={clearError} />}
    </>,
    document.body,
  );
}

export default AssistantChatModal;
