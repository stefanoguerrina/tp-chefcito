// Middleware para verificar tokens JWT y control de acceso basado en roles.
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extiende el tipo Request de Express para incluir el payload del token decodificado.
export interface AuthRequest extends Request {
  user?: { id: number; username: string; isAdmin: boolean };
}

// Lee el header Authorization, verifica el token JWT y adjunta el payload en req.user.
// Devuelve 401 si el token está ausente o es inválido.
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ message: 'Error de configuración del servidor: JWT_SECRET no está definido.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as { id: number; username: string; isAdmin: boolean };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// Para rutas públicas que muestran algo extra si hay sesión (ej. el detalle de receta:
// si la guardaste). Si viene un token válido, adjunta el payload en req.user igual que
// verifyToken; si no viene, o es inválido o vencido, sigue sin usuario en vez de responder
// 401 (la ruta se puede ver igual sin sesión).
export const readOptionalToken = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const secret = process.env.JWT_SECRET;

  if (authHeader?.startsWith('Bearer ') && secret) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], secret) as { id: number; username: string; isAdmin: boolean };
    } catch {
      req.user = undefined;
    }
  }
  next();
};

// Verifica que el usuario autenticado tenga rol de administrador.
// Debe usarse después de verifyToken. Devuelve 403 si no es admin.
export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.isAdmin) {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    return;
  }
  next();
};

// Arma un middleware que verifica que el usuario autenticado sea el dueño del recurso (el id
// de usuario que viene en req.params[paramName]) o un administrador. Así un usuario solo
// accede a sus propios datos y el admin a todos. Debe usarse después de verifyToken.
// Recibe: el nombre del parámetro de la ruta (ej. 'userId') y el mensaje del 403.
// Devuelve: el middleware (401 sin usuario, 403 si no es el dueño ni admin).
export const verifyOwnerOrAdminOf = (
  paramName: string,
  forbiddenMessage = 'Acceso denegado. Solo podés modificar tu propia cuenta.'
) => (req: AuthRequest, res: Response, next: NextFunction): void => {
  const requestedId = Number(req.params[paramName]);

  if (!req.user) {
    res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    return;
  }

  if (req.user.isAdmin || req.user.id === requestedId) {
    next();
    return;
  }

  res.status(403).json({ message: forbiddenMessage });
};

// El caso más común: rutas de /users/:id.
export const verifyOwnerOrAdmin = verifyOwnerOrAdminOf('id');
