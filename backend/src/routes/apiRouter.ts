// Central API router — mounts all feature sub-routers.
import { Router } from 'express';
import { authRouter } from '../features/auth/routes/authRouter.js';
import { userRouter } from '../features/user/routes/userRouter.js';
import { categoryRouter } from '../features/category/routes/categoryRouter.js';
import { databaseRouter } from '../features/database/routes/databaseRouter.js'
import { ingredientCategoryRouter } from '../features/ingredientCategory/routes/ingredientCategoryRouter.js';
import { ingredientRouter } from '../features/ingredient/routes/ingredientRouter.js';
import { roleRouter } from '../features/rol/routes/roleRouter.js';
import { recipeRouter } from '../features/recipe/routes/recipeRouter.js';
import { savedRecipesRouter } from '../features/userRecipe/routes/savedRecipesRouter.js';
import { inventoryRouter } from '../features/inventory/routes/inventoryRouter.js';
import { searchRouter } from '../features/search/routes/searchRouter.js';
import { followRouter } from '../features/follow/routes/followRouter.js';
import { feedRouter } from '../features/feed/routes/feedRouter.js';
import { assistantRouter } from '../features/assistant/routes/assistantRouter.js';

const apiRouter = Router();

// Database routes
apiRouter.use('/database', databaseRouter);

// Authentication routes
apiRouter.use('/auth', authRouter);

apiRouter.use('/users', userRouter);

apiRouter.use('/categories', categoryRouter);

apiRouter.use('/roles', roleRouter);

// Ingredient routes (incluye, anidado, el CRUD de valores nutricionales)
apiRouter.use('/ingredient-categories', ingredientCategoryRouter);
apiRouter.use('/ingredients', ingredientRouter);

// Recipe routes
apiRouter.use('/recipes', recipeRouter);

// Saved recipes (userRecipe) listing routes
apiRouter.use('/saved-recipes', savedRecipesRouter);
// Inventory routes (anidado bajo /users/:userId/inventory)
apiRouter.use('/users/:userId/inventory', inventoryRouter);
// Seguir a otro usuario (anidado bajo /users/:userId/follow)
apiRouter.use('/users/:userId/follow', followRouter);

// Búsqueda rápida (buscador de la home): categorías, recetas y usuarios en un solo pedido
apiRouter.use('/search', searchRouter);

// Feed de la home: recetas y reseñas de las personas que sigo, y el top de la semana
apiRouter.use('/feed', feedRouter);
// Chefcito Bot: chat con IA que sugiere recetas a partir del inventario del usuario
apiRouter.use('/assistant', assistantRouter);

export { apiRouter };
