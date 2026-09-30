// Acceso a datos de la feature admin: única capa de la feature que habla con Prisma.
// Todo lo que muestra el resumen del panel se cuenta en la base (count / groupBy), sin
// traer las filas: así el dashboard no necesita pedir todos los usuarios ni todas las recetas.
import prisma from '../../../core/prismaClient.js';
import type { Prisma } from '@prisma/client';
import type { AdminUserFilters } from '../models/adminModel.js';

// Las recetas de un usuario dado de baja no se muestran ni se cuentan (mismo criterio que
// recipe, search y feed).
const visibleRecipe = { user: { deletedAt: null } } as const;

// Condición del listado de usuarios según el filtro de estado y el texto buscado. El texto
// se separa por palabras y CADA una tiene que aparecer en el usuario, nombre, apellido o
// email (así "santiago pas" encuentra a "Santiago Pastore", como en search).
const userListWhere = ({ status, term }: AdminUserFilters): Prisma.UserWhereInput => ({
  ...(status === 'active' ? { deletedAt: null } : {}),
  ...(status === 'inactive' ? { deletedAt: { not: null } } : {}),
  ...(term
    ? {
        AND: term.split(/\s+/).map((word) => ({
          OR: [
            { username: { contains: word } },
            { name: { contains: word } },
            { lastName: { contains: word } },
            { email: { contains: word } },
          ],
        })),
      }
    : {}),
});

export const adminRepository = {

  // --- Resumen del dashboard ---

  countActiveUsers: () => prisma.user.count({ where: { deletedAt: null } }),

  countInactiveUsers: () => prisma.user.count({ where: { deletedAt: { not: null } } }),

  countVisibleRecipes: () => prisma.recipe.count({ where: visibleRecipe }),

  countIngredients: () => prisma.ingredient.count(),

  countIngredientCategories: () => prisma.ingredientcategory.count(),

  countRecipeCategories: () => prisma.category.count(),

  countRoles: () => prisma.role.count(),

  // Fecha de creación de las recetas publicadas desde `since` (para el gráfico semanal):
  // solo la fecha, no la receta entera.
  findRecipeDatesSince: (since: Date) =>
    prisma.recipe.findMany({
      where: { ...visibleRecipe, createdAt: { gte: since } },
      select: { createdAt: true },
    }),

  // Usuarios con más recetas publicadas, contados en la base (GROUP BY idUser).
  findTopCreators: (limit: number) =>
    prisma.recipe.groupBy({
      by: ['idUser'],
      where: visibleRecipe,
      _count: { _all: true },
      orderBy: { _count: { idUser: 'desc' } },
      take: limit,
    }),

  // Username de cada id (para ponerle nombre al ranking de creadores).
  findUsernames: (ids: number[]) =>
    prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, username: true } }),

  // --- Listado paginado de usuarios ---

  // Una página de usuarios: primero los activos (deletedAt null va primero en orden
  // ascendente) y, dentro de cada grupo, los más nuevos arriba. Trae también cuántas
  // recetas tiene cada uno y sus roles, en la misma consulta.
  findUsersPage: (filters: AdminUserFilters, skip: number, take: number) =>
    prisma.user.findMany({
      where: userListWhere(filters),
      orderBy: [{ deletedAt: 'asc' }, { id: 'desc' }],
      skip,
      take,
      include: {
        _count: { select: { recipe: true } },
        userRoles: { select: { role: { select: { id: true, name: true } } } },
      },
    }),

  countUsers: (filters: AdminUserFilters) => prisma.user.count({ where: userListWhere(filters) }),

  // Promedio y cantidad de reseñas que recibieron las recetas (visibles) de un usuario.
  // Se llama solo para los usuarios de la página actual (6 como mucho).
  findReviewStatsByAuthor: (idUser: number) =>
    prisma.review.aggregate({
      where: { userrecipe: { recipe: { idUser, ...visibleRecipe } } },
      _avg: { rating: true },
      _count: { _all: true },
    }),

};
