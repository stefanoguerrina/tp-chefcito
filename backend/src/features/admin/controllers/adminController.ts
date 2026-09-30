// Controller de la feature admin — maneja las rutas de /api/admin.
// Lee la request, llama al adminService y arma la respuesta HTTP.
import { Request, Response } from 'express';
import * as adminService from '../services/adminService.js';
import type { AdminUserStatus } from '../models/adminModel.js';

// Cifras del dashboard (usuarios, recetas, catálogos, gráfico semanal y ranking).
// GET /api/admin/summary
export const getDashboardSummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json(await adminService.getDashboardSummary());
  } catch (error) {
    console.error('[getDashboardSummary] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Una página de la tabla de usuarios del panel. Una lista vacía no es un error: responde
// 200 con users: [] (ej. una búsqueda sin resultados).
// GET /api/admin/users?status=all|active|inactive&q=texto&page=N
export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.listUsers({
      status: (req.query.status as AdminUserStatus | undefined) ?? 'all',
      term: typeof req.query.q === 'string' ? req.query.q.trim() : '',
      page: req.query.page ? Number(req.query.page) : 1,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('[listUsers] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
