// Controller del health check: indica si la API puede conectarse a la base de datos.
import { Request, Response } from 'express';
import { databaseRepository } from '../repository/databaseRepository.js';

// Responde 200 si la base responde, o 503 si no. El detalle del error solo se loguea en
// el servidor: no se le muestra al cliente (puede incluir datos de la conexión).
// GET /api/database/health
export const handleHealth = async (_req: Request, res: Response): Promise<void> => {
  try {
    await databaseRepository.ping();
    res.status(200).json({ status: 'OK', database: 'connected' });
  } catch (error) {
    console.error('[handleHealth] No se pudo conectar con la base de datos:', error);
    res.status(503).json({ status: 'ERROR', database: 'disconnected' });
  }
};
