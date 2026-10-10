// Servicio del asistente: centraliza la llamada HTTP al chat de Chefcito Bot.
// Usa apiFetch (con token JWT) porque el endpoint requiere estar logueado.
import { apiFetch } from '../../../shared/utils/apiFetch.js';
import { chatMessageToApi } from '../models/assistantModel.js';

// Solo se mandan los últimos mensajes: alcanzan para que el bot siga el hilo y el pedido
// no crece sin límite en conversaciones largas.
const MAX_HISTORY_MESSAGES = 10;

// Envía la conversación al backend.
// Recibe: messages (la conversación completa, terminando en el mensaje nuevo del usuario).
// Devuelve: el texto de la respuesta del bot. Lanza ApiError si falla.
export const sendAssistantMessage = async (messages) => {
  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES).map(chatMessageToApi);
  // background: el chat ya muestra "escribiendo..." mientras espera la respuesta.
  const data = await apiFetch('/assistant/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: recentMessages }),
    background: true,
  });
  return data.reply;
};
