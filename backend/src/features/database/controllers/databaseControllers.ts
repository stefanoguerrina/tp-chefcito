// Controller handling database initialization and seeding logic.
import { Request, Response } from 'express';
import pool from '../../../database.js';


// Health check endpoint — also tests the database connection
export const handleHealth = async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'connected' });
  } catch (error: any) {
    res.status(500).json({ status: 'ERROR', database: 'disconnected', detail: error.message });
  }
};
