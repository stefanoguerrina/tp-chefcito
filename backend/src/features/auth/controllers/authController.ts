// Controller de autenticación — maneja registro y login de usuarios.
// La validación de formato la hace el middleware; acá se manejan reglas de negocio y respuestas HTTP.
import { Request, Response } from 'express';
import * as authService from '../services/authService.js';

// Registra un nuevo usuario.
// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, password, name, lastName, email, phone, birthDate } = req.body;

  try {
    const result = await authService.register({ username, password, name, lastName, email, phone, birthDate });

    if (!result.ok) {
      // Mensajes específicos según la razón del fallo. Van también en `errors` (mismo
      // formato que los 422 de validación) para que el frontend los muestre debajo del
      // campo que corresponde.
      if (result.reason === 'username_taken') {
        const mensaje = 'El nombre de usuario ya está en uso.';
        res.status(409).json({ message: mensaje, errors: [{ campo: 'username', mensaje }] });
        return;
      }
      if (result.reason === 'email_taken') {
        const mensaje = 'El email ingresado ya está registrado.';
        res.status(409).json({ message: mensaje, errors: [{ campo: 'email', mensaje }] });
        return;
      }
    }

    res.status(201).json(result.ok ? result.user : {});
  } catch (error: any) {
    // P2002 es el código de Prisma para violación de unique constraint.
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'El nombre de usuario o email ya están en uso.' });
      return;
    }
    console.error('[register] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Autentica a un usuario con email o username y contraseña.
// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, username, password } = req.body;
  // Acepta tanto email como username como identificador.
  const identifier = (email || username || '').trim();

  if (!identifier) {
    res.status(400).json({ message: 'Debés ingresar tu email o nombre de usuario.' });
    return;
  }

  try {
    const result = await authService.login(identifier, password);

    if (!result.ok) {
      if (result.reason === 'no_jwt_secret') {
        res.status(500).json({ message: 'Error de configuración del servidor.' });
        return;
      }
      // Mensaje genérico intencional: no revelar si el usuario existe o no (seguridad).
      res.status(401).json({ message: 'Email, usuario o contraseña incorrectos.' });
      return;
    }

    res.status(200).json({ token: result.token, isAdmin: result.isAdmin });
  } catch (error) {
    console.error('[login] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
