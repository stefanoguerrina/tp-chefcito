// Router de la feature admin — endpoints propios del panel de administración, pensados
// para que cada pantalla pida solo lo que muestra (cifras ya contadas en la base y la
// página de usuarios que se ve), en vez de listas completas. Solo admin.
import { Router } from 'express';
import { handleGetDashboardSummary, handleListUsers } from '../controllers/adminController.js';
import { validateListUsers } from '../middleware/adminValidationMiddleware.js';
import { verifyToken, verifyAdmin } from '../../../core/middleware/authMiddleware.js';
import { handleValidationErrors } from '../../../core/middleware/validationMiddleware.js';

const adminRouter = Router();

// GET /api/admin/summary — cifras de las tarjetas del dashboard
adminRouter.get('/summary', verifyToken, verifyAdmin, handleGetDashboardSummary);

// GET /api/admin/users — una página de la tabla de usuarios (con filtro y búsqueda)
adminRouter.get('/users', verifyToken, verifyAdmin, validateListUsers, handleValidationErrors, handleListUsers);

export { adminRouter };
