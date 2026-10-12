// Hook del chat con Chefcito Bot: guarda la conversación y maneja el envío de mensajes.
// La conversación vive solo mientras el componente está montado (no se guarda en la base).
import { useState } from 'react';
import { sendAssistantMessage } from '../services/assistantService.js';
import { createChatMessage } from '../models/assistantModel.js';

// Devuelve: messages, isSending, error, sendMessage(text) y clearError().
export function useAssistantChat() {
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  // Recibe: el texto escrito por el usuario.
  // Devuelve: true si el bot respondió, false si falló (para que el componente restaure el texto).
  const sendMessage = async (text) => {
    const userMessage = createChatMessage('user', text);
    const conversation = [...messages, userMessage];

    // El mensaje se muestra enseguida, sin esperar la respuesta del bot.
    setMessages(conversation);
    setIsSending(true);
    setError('');

    try {
      const reply = await sendAssistantMessage(conversation);
      setMessages((prev) => [...prev, createChatMessage('assistant', reply)]);
      return true;
    } catch (err) {
      // Si falló, se saca el mensaje de la conversación: el usuario lo recupera en el input
      // y lo puede reenviar, en vez de quedar una pregunta sin respuesta en el historial.
      setMessages((prev) => prev.filter((message) => message.id !== userMessage.id));
      setError(err.message);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const clearError = () => setError('');

  return { messages, isSending, error, sendMessage, clearError };
}
