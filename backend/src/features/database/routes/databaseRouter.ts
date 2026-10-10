// Router for user endpoints.
import { Router } from 'express';
import { handleHealth } from '../controllers/databaseControllers.js';

const databaseRouter = Router();

// GET /api/health — returns database status
databaseRouter.get('/health', handleHealth);

export { databaseRouter };