// Router de autenticación — define los endpoints de /api/auth con validación de entrada.
import { Router } from 'express';
import { handleRegister, handleLogin } from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from '../middleware/authValidationMiddleware.js';

const authRouter = Router();

// POST /api/auth/register — crea una nueva cuenta de usuario
authRouter.post('/register', validateRegister, handleValidationErrors, handleRegister);

// POST /api/auth/login — autentica y devuelve un JWT
authRouter.post('/login', validateLogin, handleValidationErrors, handleLogin);

export { authRouter };
