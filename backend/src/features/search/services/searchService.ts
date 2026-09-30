// Lógica de negocio de la búsqueda: la búsqueda rápida (categorías, recetas y usuarios en
// una sola respuesta) y los listados completos con filtros, orden y paginación.
import { searchRepository } from '../repository/searchRepository.js';
import { LISTING_PAGE_SIZE, QUICK_SEARCH_LIMITS } from '../models/searchModel.js';
import type {
  CategoryListingFilters,
  CategorySearchResult,
  PantryMatch,
  RecipeListingFilters,
  SearchSection,
  UserListingFilters,
} from '../models/searchModel.js';
import { buildPantryMap, comparePantryMatches, computePantryMatch } from './pantryMatchService.js';

// Recibe: el texto a buscar (ya validado y sin espacios en los bordes).
// Devuelve: { term, categories, recipes, users }, cada sección con { items, total }.
// Una búsqueda sin coincidencias no es un error: vuelve con las secciones vacías.
export async function quickSearch(term: string) {
  // Las 6 consultas son independientes entre sí: se lanzan en paralelo para que la
  // respuesta tarde lo que la más lenta y no la suma de todas (se llama mientras el
  // usuario escribe, así que la velocidad se nota).
  const [categories, categoriesTotal, recipes, recipesTotal, users, usersTotal] = await Promise.all([
    searchRepository.findCategories(term, QUICK_SEARCH_LIMITS.categories),
    searchRepository.countCategories(term),
    searchRepository.findRecipes(term, QUICK_SEARCH_LIMITS.recipes),
    searchRepository.countRecipes(term),
    searchRepository.findUsers(term, QUICK_SEARCH_LIMITS.users),
    searchRepository.countUsers(term),
  ]);

  // _count es un detalle de Prisma: se aplana a recipeCount para que la API sea más clara.
  const categorySection: SearchSection<CategorySearchResult> = {
    items: categories.map((category) => ({
      id: category.id,
      name: category.name,
      recipeCount: category._count.recipecategory,
    })),
    total: categoriesTotal,
  };

  // Valoración de las pocas recetas encontradas, en una sola consulta agrupada: así la
  // sección "Recetas sugeridas" no tiene que pedir las reseñas de cada una por separado.
  const reviewStats = await searchRepository.findReviewStats(recipes.map((recipe) => recipe.id));
  const statsByRecipeId = new Map(reviewStats.map((stat) => [stat.idRecipe, stat]));
  const recipesWithStats = recipes.map((recipe) => {
    const stats = statsByRecipeId.get(recipe.id);
    return {
      ...recipe,
      averageRating: stats?._avg.rating ? Number(stats._avg.rating) : 0,
      reviewCount: stats?._count._all ?? 0,
    };
  });

  return {
    term,
    categories: categorySection,
    recipes: { items: recipesWithStats, total: recipesTotal },
    users: { items: users, total: usersTotal },
  };
}

// --- Listados completos ---

// Recibe: total de resultados y la página pedida. Devuelve la página real (si piden una
// página que ya no existe, por ejemplo después de filtrar, se muestra la última), el
// total de páginas y desde qué posición cortar.
const paginate = (total: number, requestedPage: number) => {
  const totalPages = Math.max(1, Math.ceil(total / LISTING_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  return { page, totalPages, skip: (page - 1) * LISTING_PAGE_SIZE };
};

// Saca tildes y pasa a minúsculas, para comparar textos igual que MySQL.
const normalizeText = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// Datos de cada receta que se usan para filtrar y ordenar el listado.
interface RecipeRankingRow {
  id: number;
  name: string;
  preparationTime: number | null;
  createdAt: Date | null;
  averageRating: number;
  reviewCount: number;
  saveCount: number;
  // Cuándo la guardó el usuario (solo en "Recetas guardadas"; si no, null).
  savedAt: Date | null;
  pantryMatch: PantryMatch | null;
}

// Arma la función de comparación para Array.sort según el orden elegido.
// "Más relevantes" pone primero las recetas cuyo NOMBRE contiene lo buscado (las que
// solo coinciden por categoría van después) y desempata por valoración y novedad.
// En "Con mi despensa" manda la coincidencia con la despensa; el orden elegido desempata.
const buildRecipeComparator = (filters: RecipeListingFilters) => {
  const term = filters.term ? normalizeText(filters.term) : null;
  const newest = (a: RecipeRankingRow, b: RecipeRankingRow) =>
    (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
  const bestRated = (a: RecipeRankingRow, b: RecipeRankingRow) =>
    b.averageRating - a.averageRating || b.reviewCount - a.reviewCount;

  const bySort = (a: RecipeRankingRow, b: RecipeRankingRow): number => {
    switch (filters.sort) {
      case 'popular':
        return b.saveCount - a.saveCount || b.reviewCount - a.reviewCount || newest(a, b);
      case 'rating':
        return bestRated(a, b) || newest(a, b);
      case 'time':
        // Las recetas sin tiempo cargado van al final.
        return (a.preparationTime ?? Infinity) - (b.preparationTime ?? Infinity) || newest(a, b);
      case 'recent':
        return newest(a, b);
      case 'saved':
        return (b.savedAt?.getTime() ?? 0) - (a.savedAt?.getTime() ?? 0) || newest(a, b);
      default: {
        const nameMatchA = term && normalizeText(a.name).includes(term) ? 1 : 0;
        const nameMatchB = term && normalizeText(b.name).includes(term) ? 1 : 0;
        return nameMatchB - nameMatchA || bestRated(a, b) || newest(a, b);
      }
    }
  };

  if (!filters.pantry) return bySort;
  return (a: RecipeRankingRow, b: RecipeRankingRow) =>
    comparePantryMatches(a.pantryMatch!, b.pantryMatch!) || bySort(a, b);
};

// Listado de recetas con filtros, orden y paginación (GET /api/search/recipes).
// Recibe: los filtros ya validados y el id del usuario autenticado (para su despensa y,
// en "Recetas guardadas", para saber cuándo guardó cada receta).
// Devuelve: una página { items, total, page, pageSize, totalPages } de recetas (con su
// valoración y, en modo despensa, su coincidencia) + pantry: { inventoryCount,
// completeCount } en modo despensa, o null.
// Se hace en dos pasos: primero se filtra y ordena TODO con datos mínimos (la valoración
// promedio y la despensa no se pueden calcular en el WHERE de Prisma) y después se piden
// las cards completas solo de las recetas de la página que se va a mostrar.
export async function listRecipes(filters: RecipeListingFilters, idUser: number) {
  const candidates = await searchRepository.findRecipeCandidates(filters);
  const recipeIds = candidates.map((recipe) => recipe.id);

  const [reviewStats, saveCounts, inventory, savedDates] = await Promise.all([
    searchRepository.findReviewStats(recipeIds),
    searchRepository.findSaveCounts(recipeIds),
    filters.pantry ? searchRepository.findInventory(idUser) : Promise.resolve([]),
    filters.savedByUserId ? searchRepository.findSavedDates(idUser, recipeIds) : Promise.resolve([]),
  ]);

  const statsById = new Map(reviewStats.map((stat) => [stat.idRecipe, stat]));
  const savesById = new Map(saveCounts.map((save) => [save.idRecipe, save._count._all]));
  const savedAtById = new Map(savedDates.map((saved) => [saved.idRecipe, saved.savedAt]));
  const pantry = buildPantryMap(inventory);

  let rows: RecipeRankingRow[] = candidates.map((recipe) => {
    const stats = statsById.get(recipe.id);
    return {
      id: recipe.id,
      name: recipe.name,
      preparationTime: recipe.preparationTime,
      createdAt: recipe.createdAt,
      averageRating: stats?._avg.rating ? Number(stats._avg.rating) : 0,
      reviewCount: stats?._count._all ?? 0,
      saveCount: savesById.get(recipe.id) ?? 0,
      savedAt: savedAtById.get(recipe.id) ?? null,
      pantryMatch: filters.pantry ? computePantryMatch(recipe.recipeingredient, pantry) : null,
    };
  });

  if (filters.minRating) {
    const minRating = filters.minRating;
    rows = rows.filter((row) => row.reviewCount > 0 && row.averageRating >= minRating);
  }
  // En modo despensa solo tiene sentido mostrar recetas con al menos un ingrediente que
  // el usuario tenga: primero las que puede hacer completas, después las más cercanas.
  if (filters.pantry) {
    rows = rows.filter((row) => row.pantryMatch!.availableCount > 0);
  }
  rows.sort(buildRecipeComparator(filters));

  const { page, totalPages, skip } = paginate(rows.length, filters.page);
  const pageRows = rows.slice(skip, skip + LISTING_PAGE_SIZE);
  const cards = pageRows.length > 0
    ? await searchRepository.findRecipeCardsByIds(pageRows.map((row) => row.id))
    : [];
  const cardsById = new Map(cards.map((card) => [card.id, card]));

  // Se recorre pageRows (no cards) para respetar el orden calculado arriba.
  const items = pageRows
    .filter((row) => cardsById.has(row.id))
    .map((row) => ({
      ...cardsById.get(row.id)!,
      averageRating: row.averageRating,
      reviewCount: row.reviewCount,
      pantryMatch: row.pantryMatch,
    }));

  return {
    items,
    total: rows.length,
    page,
    pageSize: LISTING_PAGE_SIZE,
    totalPages,
    pantry: filters.pantry
      ? {
        inventoryCount: inventory.length,
        completeCount: rows.filter((row) => row.pantryMatch!.isComplete).length,
      }
      : null,
  };
}

// Listado de categorías de receta con filtros, orden y paginación (GET /api/search/categories).
// Devuelve: una página de { id, name, description, recipeCount }.
export async function listCategories(filters: CategoryListingFilters) {
  const total = await searchRepository.countCategoryListing(filters);
  const { page, totalPages, skip } = paginate(total, filters.page);
  const categories = await searchRepository.findCategoryListing(filters, skip, LISTING_PAGE_SIZE);

  return {
    items: categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      recipeCount: category._count.recipecategory,
    })),
    total,
    page,
    pageSize: LISTING_PAGE_SIZE,
    totalPages,
  };
}

// Listado de usuarios con filtros, orden y paginación (GET /api/search/users).
// Devuelve: una página de { id, username, name, lastName, avatarUrl, recipeCount }.
export async function listUsers(filters: UserListingFilters) {
  const total = await searchRepository.countUserListing(filters);
  const { page, totalPages, skip } = paginate(total, filters.page);
  const users = await searchRepository.findUserListing(filters, skip, LISTING_PAGE_SIZE);

  return {
    items: users.map(({ _count, ...user }) => ({ ...user, recipeCount: _count.recipe })),
    total,
    page,
    pageSize: LISTING_PAGE_SIZE,
    totalPages,
  };
}
