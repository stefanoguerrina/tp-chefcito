// Router de assistant — define los endpoints de /api/assistant (Chefcito Bot).
// Requiere token: el bot usa el inventario del usuario autenticado y así nadie ajeno a la app
// consume la cuota de la API de IA.
import { Router } from 'express';
import { verifyToken } from '../../../core/middleware/authMiddleware.js';
import { chat } from '../controllers/assistantController.js';
import { validateChat } from '../middleware/assistantValidationMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';

const assistantRouter = Router();

// POST /api/assistant/chat — envía la conversación y devuelve la respuesta del bot
assistantRouter.post('/chat', verifyToken, validateChat, handleValidationErrors, chat);

export { assistantRouter };
