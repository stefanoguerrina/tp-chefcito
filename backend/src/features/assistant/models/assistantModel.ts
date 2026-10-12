// Tipos de dominio para la feature Assistant (Chefcito Bot).
// Esta capa no tiene lógica: solo describe la forma de los datos del chat.

// Un mensaje de la conversación tal como lo manda el frontend.
// role 'assistant' son las respuestas previas del bot, que se reenvían como historial.
export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

// Un ingrediente del inventario del usuario, con lo justo para armar el contexto del bot.
export interface InventoryContextItem {
  name: string;
  availableQuantity: number | null;
  unitOfMeasure: string | null;
}
