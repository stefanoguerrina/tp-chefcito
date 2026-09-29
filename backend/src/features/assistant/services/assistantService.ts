// Lógica de negocio de la feature Assistant (Chefcito Bot).
// Arma el contexto del usuario (su inventario), consulta a la API de Gemini y devuelve la
// respuesta. Retorna discriminated unions { ok, reason } para que el controller mapee los HTTP codes.
import { assistantRepository } from '../repository/assistantRepository.js';
import type { ChatMessage, InventoryContextItem } from '../models/assistantModel.js';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
// Se puede cambiar desde el .env (GEMINI_MODEL) sin tocar código, por si Google retira este modelo.
const DEFAULT_MODEL = 'gemini-3.8-flash';
// Solo se reenvían los últimos mensajes: alcanza para mantener el hilo y limita el costo por pedido.
const MAX_HISTORY_MESSAGES = 10;
const REQUEST_TIMEOUT_MS = 30000;

type ChatResult =
  | { ok: true; reply: string }
  | { ok: false; reason: 'not_configured' | 'quota_exceeded' | 'ai_unavailable' | 'empty_reply' };

// Error HTTP de Gemini con su código, para poder distinguir casos (ej. 429 = cuota agotada).
class GeminiHttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Recibe el id del usuario autenticado y la conversación. Devuelve la respuesta del bot.
export async function chat(idUser: number, messages: ChatMessage[]): Promise<ChatResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, reason: 'not_configured' };

  const inventory = await getInventoryContext(idUser);
  const systemPrompt = buildSystemPrompt(inventory);
  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
  // Al recortar, el historial puede quedar empezando con una respuesta del bot; Gemini espera
  // que la conversación arranque con el usuario. (El último siempre es del usuario: lo valida el middleware.)
  while (recentMessages[0]?.role === 'assistant') recentMessages.shift();

  try {
    const reply = await askGemini(apiKey, systemPrompt, recentMessages);
    if (!reply) return { ok: false, reason: 'empty_reply' };
    return { ok: true, reply };
  } catch (error) {
    console.error('[assistantService.chat] Falló el pedido a Gemini:', error);
    // 429: se agotaron las consultas de la API key (en el plan gratis, un límite diario por modelo).
    if (error instanceof GeminiHttpError && error.status === 429) return { ok: false, reason: 'quota_exceeded' };
    return { ok: false, reason: 'ai_unavailable' };
  }
}

// Recibe el id del usuario. Devuelve su inventario en un formato simple para el prompt.
// Si el ítem no tiene unidad propia, se usa la unidad base del ingrediente.
async function getInventoryContext(idUser: number): Promise<InventoryContextItem[]> {
  const rows = await assistantRepository.findInventoryByUser(idUser);
  return rows.map((row) => ({
    name: row.ingredient.name,
    availableQuantity: row.availableQuantity !== null ? Number(row.availableQuantity) : null,
    unitOfMeasure: row.unitOfMeasure ?? row.ingredient.unitOfMeasure ?? null,
  }));
}

// Recibe el inventario. Devuelve las instrucciones fijas del bot con el inventario incluido,
// que es lo que hace que las sugerencias sean personalizadas y no un chat genérico.
function buildSystemPrompt(inventory: InventoryContextItem[]): string {
  const inventoryText = inventory.length > 0
    ? inventory
      .map((item) => {
        const quantity = item.availableQuantity !== null
          ? `: ${item.availableQuantity}${item.unitOfMeasure ? ` ${item.unitOfMeasure}` : ''}`
          : '';
        return `- ${item.name}${quantity}`;
      })
      .join('\n')
    : 'El usuario todavía no cargó ingredientes en su inventario.';

  return [
    'Sos Chefcito Bot, el asistente de cocina de la app Chefcito. Ayudás a planificar comidas y a elegir recetas.',
    'Reglas:',
    '- Respondé siempre en español rioplatense, de forma breve y clara (hasta 150 palabras, salvo que te pidan una receta completa).',
    '- Escribí en texto plano, sin Markdown: nada de asteriscos ni numerales. Para listas usá guiones.',
    '- Priorizá los ingredientes del inventario del usuario. Si a una receta le falta algo, aclaralo.',
    '- Si te preguntan algo que no tiene que ver con cocina, alimentación o nutrición, decí amablemente que solo podés ayudar con eso.',
    '- No des consejos médicos: ante dudas de salud o dietas especiales, recomendá consultar a un profesional.',
    '',
    'Inventario actual del usuario:',
    inventoryText,
  ].join('\n');
}

// Recibe la API key, las instrucciones del bot y la conversación. Devuelve el texto de la
// respuesta ('' si Gemini no generó nada, por ejemplo si bloqueó el pedido). Lanza si falla la red
// o si Gemini responde con un error HTTP.
async function askGemini(apiKey: string, systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const response = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      // Gemini llama 'model' a los mensajes del asistente.
      contents: messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.text }],
      })),
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new GeminiHttpError(response.status, `Gemini respondió ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  // La respuesta puede venir partida en varias partes; se descartan las de razonamiento interno.
  const parts: { text?: string; thought?: boolean }[] = data?.candidates?.[0]?.content?.parts ?? [];
  return parts
    .filter((part) => typeof part.text === 'string' && !part.thought)
    .map((part) => part.text)
    .join('')
    .trim();
}
