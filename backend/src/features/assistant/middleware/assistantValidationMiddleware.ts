// Middlewares de validación para las rutas del asistente, usando express-validator.
// Además de rechazar datos inválidos, los límites de cantidad y largo acotan el costo de cada
// pedido a la API de IA.
import { body } from 'express-validator';

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 1000;

// Reglas de validación para enviar un mensaje al chat (POST /chat).
export const validateChat = [
  body('messages')
    .isArray({ min: 1, max: MAX_MESSAGES })
    .withMessage(`La conversación debe tener entre 1 y ${MAX_MESSAGES} mensajes.`),
  body('messages.*.role')
    .isIn(['user', 'assistant'])
    .withMessage('Cada mensaje debe tener un rol válido (user o assistant).'),
  body('messages.*.text')
    .isString()
    .withMessage('El texto de cada mensaje es requerido.')
    .trim()
    .notEmpty()
    .withMessage('Los mensajes no pueden estar vacíos.')
    .isLength({ max: MAX_MESSAGE_LENGTH })
    .withMessage(`Cada mensaje puede tener hasta ${MAX_MESSAGE_LENGTH} caracteres.`),
  // El bot siempre responde a un mensaje del usuario, así que tiene que ser el último.
  body('messages').custom((messages) => {
    if (Array.isArray(messages) && messages.length > 0 && messages[messages.length - 1]?.role !== 'user') {
      throw new Error('El último mensaje de la conversación debe ser del usuario.');
    }
    return true;
  }),
];
