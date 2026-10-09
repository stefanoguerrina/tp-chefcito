// Middlewares de cierre de la app: hacen que toda respuesta de la API sea JSON, incluso cuando la
// ruta no existe o algo falla sin que un controller lo atrape (sin esto Express responde HTML).
import { Request, Response, NextFunction } from 'express';

// Mensajes para los errores que Express arma antes de llegar a las rutas (al leer el body).
const CLIENT_ERROR_MESSAGES: Record<string, string> = {
  'entity.parse.failed': 'El cuerpo de la petición no es un JSON válido.',
  'entity.too.large': 'El cuerpo de la petición es demasiado grande.',
};

// Va después de todas las rutas: si la request llegó hasta acá, ninguna la atendió.
// Responde 404 { message }.
export const handleNotFound = (req: Request, res: Response): void => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
};

// Manejador de errores de Express (se reconoce por recibir 4 parámetros); va último.
// Recibe el error que llegó sin atrapar y responde { message } con su código: si es un error del
// cliente (4xx, ej. JSON mal formado) lo respeta; si no, 500 sin mostrar el detalle interno.
export const handleUnexpectedError = (
  err: { status?: number; statusCode?: number; type?: string },
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Si la respuesta ya se empezó a mandar no se puede cambiar: Express la cierra.
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = err.status ?? err.statusCode ?? 500;
  if (status >= 400 && status < 500) {
    res.status(status).json({
      message: CLIENT_ERROR_MESSAGES[err.type ?? ''] ?? 'La petición no es válida.',
    });
    return;
  }

  console.error('[app] Error inesperado:', err);
  res.status(500).json({ message: 'Error interno del servidor.' });
};
