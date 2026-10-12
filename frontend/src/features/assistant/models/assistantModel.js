// Modelo de Assistant: factory functions para los mensajes del chat con Chefcito Bot.

// Recibe: role ('user' o 'assistant') y text.
// Devuelve: un mensaje con id propio, que React usa como key al listar la conversación.
export const createChatMessage = (role, text) => ({
  id: crypto.randomUUID(),
  role,
  text,
});

// Recibe: un mensaje del chat. Devuelve: solo los campos que espera el backend (sin el id).
export const chatMessageToApi = (message) => ({
  role: message.role,
  text: message.text,
});
