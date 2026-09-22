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
import { inventoryRouter } from '../features/inventory/routes/inventoryRouter.js';

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

// Inventory routes (anidado bajo /users/:userId/inventory)
apiRouter.use('/users/:userId/inventory', inventoryRouter);

export { apiRouter };
