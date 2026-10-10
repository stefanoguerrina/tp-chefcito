// Controller de la búsqueda — maneja GET /api/search y los listados /api/search/*.
// Delega la búsqueda al searchService; solo lee la request y arma la response HTTP.
import { Request, Response } from 'express';
import * as searchService from '../services/searchService.js';
import type { AuthRequest } from '../../../core/middleware/authMiddleware.js';
import type { NameOrRecipesSort, NutritionGoal, RecipeSort } from '../models/searchModel.js';

// Los query params llegan como string (o no llegan). Ya vienen validados por el
// middleware, así que acá solo se convierten al tipo que espera el service.
const optionalText = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);
const optionalNumber = (value: unknown) => (value === undefined || value === '' ? undefined : Number(value));
const pageNumber = (value: unknown) => optionalNumber(value) ?? 1;

// Busca el texto de ?q= en categorías de receta, recetas y usuarios.
// Responde 200 con { term, categories, recipes, users } (secciones vacías si no hay
// coincidencias: una búsqueda sin resultados no es un 404). El texto ya viene validado
// por validateQuickSearch.
// GET /api/search?q=texto
export const handleQuickSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const term = String(req.query.q).trim();
    const results = await searchService.quickSearch(term);
    res.status(200).json(results);
  } catch (error) {
    console.error('[handleQuickSearch] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Listado de recetas con filtros. Todos los query params son opcionales:
// q, categoryId, maxTime, minTime, minRating, ingredientIds (ej. "3,8"), nutrition
// (necesidades nutricionales, ej. "high-protein,low-carb"), pantry
// ("true" = solo recetas que se pueden hacer con la despensa del usuario del token),
// savedOnly ("true" = solo las que guardó el usuario del token), authorId (solo las que
// publicó ese usuario, para la galería del perfil), sort (relevance |
// popular | rating | time | recent | saved) y page.
// Responde 200 con una página de resultados (vacía si no hay coincidencias).
// GET /api/search/recipes
export const handleListRecipes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, categoryId, authorId, maxTime, minTime, minRating, ingredientIds, nutrition, pantry, savedOnly, sort, page } = req.query;
    const results = await searchService.listRecipes(
      {
        term: optionalText(q),
        // Las guardadas (igual que la despensa) son siempre las del usuario del token.
        savedByUserId: savedOnly === 'true' ? req.user!.id : undefined,
        authorId: optionalNumber(authorId),
        categoryId: optionalNumber(categoryId),
        maxTime: optionalNumber(maxTime),
        minTime: optionalNumber(minTime),
        minRating: optionalNumber(minRating),
        ingredientIds: typeof ingredientIds === 'string' ? ingredientIds.split(',').map(Number) : [],
        // Set: si alguien repite una necesidad en la URL, se evalúa una sola vez.
        nutritionGoals: typeof nutrition === 'string' ? [...new Set(nutrition.split(',') as NutritionGoal[])] : [],
        pantry: pantry === 'true',
        sort: (sort as RecipeSort | undefined) ?? 'relevance',
        page: pageNumber(page),
      },
      // La despensa es siempre la del usuario autenticado: el id sale del token, no de la URL.
      req.user!.id
    );
    res.status(200).json(results);
  } catch (error) {
    console.error('[handleListRecipes] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Lee los filtros comunes de los listados de categorías y usuarios.
const readNameOrRecipesFilters = (req: Request) => ({
  term: optionalText(req.query.q),
  onlyWithRecipes: req.query.onlyWithRecipes === 'true',
  sort: (req.query.sort as NameOrRecipesSort | undefined) ?? 'name',
  page: pageNumber(req.query.page),
});

// Listado de categorías de receta. Query params opcionales: q, onlyWithRecipes
// ("true" = solo las que tienen recetas), sort (name | recipes) y page.
// GET /api/search/categories
export const handleListCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await searchService.listCategories(readNameOrRecipesFilters(req));
    res.status(200).json(results);
  } catch (error) {
    console.error('[handleListCategories] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Listado de usuarios activos. Query params opcionales: q, onlyWithRecipes ("true" =
// solo los que publicaron recetas), sort (name | recipes) y page.
// GET /api/search/users
export const handleListUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await searchService.listUsers(readNameOrRecipesFilters(req));
    res.status(200).json(results);
  } catch (error) {
    console.error('[handleListUsers] Error inesperado:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
