// Controller del feed de la home — maneja las rutas de /api/feed.
// Delega la lógica al feedService; solo lee la request y arma la response HTTP.
// Las secciones de "amigos" son siempre las del usuario del token (nunca de la URL).
// Una sección sin contenido responde 200 con items vacío: no es un error.
import { Response } from 'express';
import * as feedService from '../services/feedService.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';
import {
  FRIENDS_RECIPES_DEFAULT_LIMIT,
  FRIENDS_REVIEWS_DEFAULT_LIMIT,
  TOP_RECIPES_DEFAULT_DAYS,
  TOP_RECIPES_DEFAULT_LIMIT,
} from '../models/feedModel.js';

// Los query params llegan como string (o no llegan); ya vienen validados por el middleware.
const numberOrDefault = (value: unknown, fallback: number) =>
  value === undefined || value === '' ? fallback : Number(value);

// Últimas recetas de las personas que sigue el usuario. Query opcional: limit.
// GET /api/feed/friends/recipes
export const getFriendsRecipes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = numberOrDefault(req.query.limit, FRIENDS_RECIPES_DEFAULT_LIMIT);
    res.status(200).json(await feedService.getFriendsRecipes(req.user!.id, limit));
  } catch (error) {
    console.error('[getFriendsRecipes] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Últimas reseñas de las personas que sigue el usuario. Query opcional: limit.
// GET /api/feed/friends/reviews
export const getFriendsReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = numberOrDefault(req.query.limit, FRIENDS_REVIEWS_DEFAULT_LIMIT);
    res.status(200).json(await feedService.getFriendsReviews(req.user!.id, limit));
  } catch (error) {
    console.error('[getFriendsReviews] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Recetas mejor valoradas en los últimos `days` días. Query opcional: days y limit.
// GET /api/feed/top-recipes
export const getTopRecipes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = numberOrDefault(req.query.days, TOP_RECIPES_DEFAULT_DAYS);
    const limit = numberOrDefault(req.query.limit, TOP_RECIPES_DEFAULT_LIMIT);
    res.status(200).json(await feedService.getTopRecipes(days, limit));
  } catch (error) {
    console.error('[getTopRecipes] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
