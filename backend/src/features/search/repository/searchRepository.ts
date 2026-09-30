// Acceso a datos de la búsqueda: única capa de la feature que habla con Prisma.
// No contiene lógica de negocio — eso es responsabilidad de searchService.
// En MySQL, `contains` se traduce a LIKE '%texto%' (con el texto como parámetro, nunca
// concatenado) y la collation de la BD no distingue mayúsculas ni tildes: "PASTA" y
// "pasta" encuentran lo mismo, y "maria" encuentra a "María".
import prisma from '../../../core/prismaClient.js';
import type { Prisma } from '@prisma/client';
import type {
  CategoryListingFilters,
  RecipeListingFilters,
  UserListingFilters,
} from '../models/searchModel.js';

// --- Condiciones de búsqueda (WHERE) ---

// Una categoría coincide si el texto aparece en su nombre.
const categoryWhere = (term: string): Prisma.categoryWhereInput => ({
  name: { contains: term },
});

// Una receta coincide si el texto aparece en su nombre o en el de alguna de sus
// categorías (buscar "pasta" trae también los ñoquis de la categoría "Pastas").
// Las recetas de usuarios dados de baja no se muestran.
const recipeWhere = (term: string): Prisma.recipeWhereInput => ({
  user: { deletedAt: null },
  OR: [
    { name: { contains: term } },
    { recipecategory: { some: { category: { name: { contains: term } } } } },
  ],
});

// Un usuario coincide si CADA palabra buscada aparece en su username, nombre o apellido.
// Se separa por palabras porque nombre y apellido son columnas distintas: así
// "santiago pas" encuentra a "Santiago Pastore". Solo usuarios activos.
const userWhere = (term: string): Prisma.UserWhereInput => ({
  deletedAt: null,
  AND: term.split(/\s+/).map((word) => ({
    OR: [
      { username: { contains: word } },
      { name: { contains: word } },
      { lastName: { contains: word } },
    ],
  })),
});

// Filtros del listado de recetas que se pueden resolver en la base (texto, guardadas,
// autor, categoría, tiempo e ingredientes). La valoración y la despensa necesitan cálculos que se hacen
// después, en searchService. Cada filtro que no vino simplemente no se agrega.
const recipeListingWhere = (filters: RecipeListingFilters): Prisma.recipeWhereInput => {
  const conditions: Prisma.recipeWhereInput[] = [
    filters.term ? recipeWhere(filters.term) : { user: { deletedAt: null } },
  ];
  if (filters.savedByUserId) {
    conditions.push({ userrecipe: { some: { idUser: filters.savedByUserId, isSaved: true } } });
  }
  if (filters.authorId) conditions.push({ idUser: filters.authorId });
  if (filters.categoryId) {
    conditions.push({ recipecategory: { some: { idCategory: filters.categoryId } } });
  }
  if (filters.maxTime) conditions.push({ preparationTime: { lte: filters.maxTime } });
  if (filters.minTime) conditions.push({ preparationTime: { gte: filters.minTime } });
  // Hay que tener TODOS los ingredientes elegidos (una condición por ingrediente).
  filters.ingredientIds.forEach((idIngredient) => {
    conditions.push({ recipeingredient: { some: { idIngredient } } });
  });
  return { AND: conditions };
};

// Filtros de los listados de categorías y usuarios.
const categoryListingWhere = (filters: CategoryListingFilters): Prisma.categoryWhereInput => ({
  AND: [
    filters.term ? categoryWhere(filters.term) : {},
    filters.onlyWithRecipes ? { recipecategory: { some: {} } } : {},
  ],
});

const userListingWhere = (filters: UserListingFilters): Prisma.UserWhereInput => ({
  AND: [
    filters.term ? userWhere(filters.term) : { deletedAt: null },
    filters.onlyWithRecipes ? { recipe: { some: {} } } : {},
  ],
});

// --- Campos a traer (SELECT) ---

// Lo que muestran las cards de receta (panel rápido, página de resultados y listado):
// foto principal, bajada, tiempo, categorías y creador.
const recipeCardSelect = {
  id: true,
  idUser: true,
  name: true,
  description: true,
  preparationTime: true,
  // Solo la foto principal (o la primera, si ninguna está marcada).
  image: {
    select: { imageUrl: true, isMain: true },
    orderBy: [{ isMain: 'desc' }, { id: 'asc' }],
    take: 1,
  },
  recipecategory: { select: { category: { select: { name: true } } } },
  user: { select: { username: true, avatarUrl: true } },
} satisfies Prisma.recipeSelect;

export const searchRepository = {

  // --- Búsqueda rápida (panel de la barra y página /buscar) ---

  // Devuelve hasta `limit` categorías que coinciden, con cuántas recetas tiene cada una.
  findCategories: (term: string, limit: number) =>
    prisma.category.findMany({
      where: categoryWhere(term),
      select: { id: true, name: true, _count: { select: { recipecategory: true } } },
      orderBy: { name: 'asc' },
      take: limit,
    }),

  countCategories: (term: string) =>
    prisma.category.count({ where: categoryWhere(term) }),

  // Devuelve hasta `limit` recetas que coinciden (las más nuevas primero).
  findRecipes: (term: string, limit: number) =>
    prisma.recipe.findMany({
      where: recipeWhere(term),
      select: recipeCardSelect,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),

  countRecipes: (term: string) =>
    prisma.recipe.count({ where: recipeWhere(term) }),

  // Devuelve hasta `limit` usuarios que coinciden. Se eligen los campos a mano para que
  // nunca viajen datos privados (password, email, teléfono).
  findUsers: (term: string, limit: number) =>
    prisma.user.findMany({
      where: userWhere(term),
      select: { id: true, username: true, name: true, lastName: true, avatarUrl: true },
      orderBy: { username: 'asc' },
      take: limit,
    }),

  countUsers: (term: string) =>
    prisma.user.count({ where: userWhere(term) }),

  // --- Listado de recetas (/buscar/recetas) ---

  // Devuelve TODAS las recetas que pasan los filtros de la base, pero solo con los datos
  // mínimos para terminar de filtrarlas y ordenarlas (incluidos sus ingredientes, para la
  // despensa). Las cards completas se piden después, solo para la página que se muestra.
  findRecipeCandidates: (filters: RecipeListingFilters) =>
    prisma.recipe.findMany({
      where: recipeListingWhere(filters),
      select: {
        id: true,
        name: true,
        preparationTime: true,
        createdAt: true,
        recipeingredient: {
          select: { idIngredient: true, requiredQuantity: true, ingredient: { select: { name: true } } },
        },
      },
    }),

  // Promedio de valoración y cantidad de reseñas de cada receta de la lista, en una sola
  // consulta agrupada (en vez de pedir las reseñas receta por receta).
  findReviewStats: (recipeIds: number[]) =>
    prisma.review.groupBy({
      by: ['idRecipe'],
      where: { idRecipe: { in: recipeIds } },
      _avg: { rating: true },
      _count: { _all: true },
    }),

  // Cuántos usuarios guardaron cada receta de la lista (para "Más populares").
  findSaveCounts: (recipeIds: number[]) =>
    prisma.userrecipe.groupBy({
      by: ['idRecipe'],
      where: { idRecipe: { in: recipeIds }, isSaved: true },
      _count: { _all: true },
    }),

  // Cuándo guardó el usuario cada una de las recetas indicadas (para ordenar por
  // "Guardadas recientemente").
  findSavedDates: (idUser: number, recipeIds: number[]) =>
    prisma.userrecipe.findMany({
      where: { idUser, idRecipe: { in: recipeIds }, isSaved: true },
      select: { idRecipe: true, savedAt: true },
    }),

  // Ingredientes que el usuario tiene cargados en su inventario ("Mi despensa").
  findInventory: (idUser: number) =>
    prisma.inventory.findMany({
      where: { idUser },
      select: { idIngredient: true, availableQuantity: true },
    }),

  // Porciones e ingredientes (con cantidad y tabla nutricional) de las recetas indicadas,
  // para calcular sus valores por porción. Solo se pide si se filtra por necesidades
  // nutricionales.
  findNutritionData: (recipeIds: number[]) =>
    prisma.recipe.findMany({
      where: { id: { in: recipeIds } },
      select: {
        id: true,
        servings: true,
        recipeingredient: {
          select: {
            requiredQuantity: true,
            ingredient: {
              select: {
                name: true,
                unitOfMeasure: true,
                nutritionalvalue: { select: { name: true, servingAmount: true, servingUnit: true, value: true } },
              },
            },
          },
        },
      },
    }),

  // Datos de card de las recetas indicadas (las de la página actual del listado).
  findRecipeCardsByIds: (recipeIds: number[]) =>
    prisma.recipe.findMany({
      where: { id: { in: recipeIds } },
      select: recipeCardSelect,
    }),

  // --- Listados de categorías y usuarios (/buscar/categorias, /buscar/usuarios) ---

  // Una página de categorías, ordenada por nombre o por cantidad de recetas.
  findCategoryListing: (filters: CategoryListingFilters, skip: number, take: number) =>
    prisma.category.findMany({
      where: categoryListingWhere(filters),
      select: {
        id: true,
        name: true,
        description: true,
        _count: { select: { recipecategory: true } },
      },
      orderBy: filters.sort === 'recipes'
        ? [{ recipecategory: { _count: 'desc' } }, { name: 'asc' }]
        : { name: 'asc' },
      skip,
      take,
    }),

  countCategoryListing: (filters: CategoryListingFilters) =>
    prisma.category.count({ where: categoryListingWhere(filters) }),

  // Una página de usuarios, ordenada por usuario o por cantidad de recetas publicadas.
  findUserListing: (filters: UserListingFilters, skip: number, take: number) =>
    prisma.user.findMany({
      where: userListingWhere(filters),
      select: {
        id: true,
        username: true,
        name: true,
        lastName: true,
        avatarUrl: true,
        _count: { select: { recipe: true } },
      },
      orderBy: filters.sort === 'recipes'
        ? [{ recipe: { _count: 'desc' } }, { username: 'asc' }]
        : { username: 'asc' },
      skip,
      take,
    }),

  countUserListing: (filters: UserListingFilters) =>
    prisma.user.count({ where: userListingWhere(filters) }),

};
