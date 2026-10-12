// Router de database — define /api/database (health check de la conexión a la base).
import { Router } from 'express';
import { handleHealth } from '../controllers/databaseControllers.js';

const databaseRouter = Router();

// GET /api/database/health — estado de la conexión a la base (público)
databaseRouter.get('/health', handleHealth);

export { databaseRouter };