// Controller de Assistant — maneja las rutas de /api/assistant.
// Solo lee la request y arma la response HTTP; delega toda la lógica al assistantService.
import { Response } from 'express';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';
import * as assistantService from '../services/assistantService.js';
import type { ChatMessage } from '../models/assistantModel.js';

// Recibe la conversación y devuelve la respuesta de Chefcito Bot: { reply }.
// POST /api/assistant/chat
export const handleChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idUser = req.user!.id;
    const messages: ChatMessage[] = req.body.messages.map((message: ChatMessage) => ({
      role: message.role,
      text: message.text,
    }));

    const result = await assistantService.chat(idUser, messages);

    if (!result.ok) {
      switch (result.reason) {
        case 'not_configured':
          res.status(503).json({ message: 'El asistente no está disponible en este momento (falta configurar la API de IA).' });
          return;
        case 'quota_exceeded':
          res.status(429).json({ message: 'Se agotaron las consultas disponibles de Chefcito Bot. Probá de nuevo más tarde.' });
          return;
        case 'empty_reply':
          res.status(502).json({ message: 'Chefcito Bot no pudo responder esa consulta. Probá escribirla de otra forma.' });
          return;
        case 'ai_unavailable':
          res.status(503).json({ message: 'Chefcito Bot no está disponible en este momento. Intentá de nuevo en unos minutos.' });
          return;
      }
    }

    res.status(200).json({ reply: result.reply });
  } catch (error) {
    console.error('[assistant.chat] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
