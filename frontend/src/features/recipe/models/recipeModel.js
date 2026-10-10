// Modelo de dominio de la feature Recipe: mapea la forma cruda que devuelve el
// backend a la forma que usa el editor (RecipeEditorPage), y viceversa.
// Sin clases ni interfaces de TS: solo factory functions simples, como el resto
// del frontend.
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Ícono (Material Symbols) con el que se muestra la dificultad en el detalle de receta.
export const RECIPE_DIFFICULTY_ICON = 'signal_cellular_alt';

// Límites reales de columnas del backend (recipe.name VarChar(150), recipe.description
// Text con tope de 2000 en la validación): el editor los usa tal cual, sin inventar
// otros más cortos.
export const RECIPE_NAME_MAX_LENGTH = 150;
export const RECIPE_DESCRIPTION_MAX_LENGTH = 2000;

// Porciones que acepta el backend (RECIPE_SERVINGS_MIN/MAX en recipeModel.ts).
const RECIPE_SERVINGS_MIN = 1;
export const RECIPE_SERVINGS_MAX = 50;

// Imagen de reemplazo para recetas sin foto de portada todavía.
export const RECIPE_PLACEHOLDER_IMAGE = 'https://placehold.co/480x360/f9f3eb/8d7169?text=Sin+foto';

// Recibe: timeMinutes (número, string o null). Devuelve el texto del tiempo de preparación
// ("25 min" o "Sin definir"), mismo formato que muestra RecipeCard.
export const formatPreparationTime = (timeMinutes) =>
  timeMinutes === null || timeMinutes === undefined || timeMinutes === '' ? 'Sin definir' : `${timeMinutes} min`;

// Recibe: una cantidad de un nutriente (número) y su unidad. Devuelve el texto para mostrar
// con coma decimal y sin decimales de más: "38,7 gr", "467 kcal".
export const formatNutrientAmount = (amount, unit) =>
  `${amount.toLocaleString('es-AR', { maximumFractionDigits: 1 })}${unit ? ` ${unit}` : ''}`;

// Recibe: servings (número o null). Devuelve el texto de las porciones ("4 porciones",
// "1 porción") o null si la receta no lo indica.
export const formatServings = (servings) =>
  servings ? `${servings} ${servings === 1 ? 'porción' : 'porciones'}` : null;

// Devuelve la imagen principal de una receta cruda (la marcada isMain o, si no hay, la
// primera), o null si todavía no tiene ninguna.
export const getMainImage = (recipe) =>
  recipe.image?.find((img) => img.isMain) ?? recipe.image?.[0] ?? null;

// Devuelve la URL lista para <img src> de la foto principal, o el placeholder si no tiene.
export const getRecipeImageUrl = (recipe) =>
  resolveImageUrl(getMainImage(recipe)?.imageUrl) ?? RECIPE_PLACEHOLDER_IMAGE;

// Convierte una receta cruda del backend a las props que espera RecipeCard
// (core/components). Es la única forma de card de receta de la app: la usan "Mis
// recetas", la home, el perfil, "Recetas guardadas" y la vista previa del wizard.
// rating/reviewsCount salen de averageRating/reviewCount, que el backend ya calcula en
// los listados (GET /api/recipes, búsqueda, feed); si la receta no los trae (ej. la
// vista previa del wizard), la card muestra "Sin reseñas".
export const recipeToCardProps = (recipe) => ({
  id: recipe.id,
  title: recipe.name,
  description: recipe.description ?? null,
  image: getRecipeImageUrl(recipe),
  author: recipe.user?.username ?? '',
  // El avatar puede ser una foto subida ("/uploads/users/..."): se completa con el origen del backend.
  authorAvatar: resolveImageUrl(recipe.user?.avatarUrl),
  categories: (recipe.recipecategory ?? [])
    .map((link) => link.category?.name)
    .filter(Boolean),
  timeMinutes: recipe.preparationTime ?? null,
  rating: recipe.averageRating,
  reviewsCount: recipe.reviewCount,
});

// Arma el estado inicial en blanco del formulario para crear una receta nueva. Las
// fotos NO viven acá: las administra su propio hook (useRecipePhotos), igual que
// ingredientes y pasos tienen su propio array en RecipeEditorPage.
// preparationTime y difficulty tampoco viven acá: el tiempo se calcula solo a partir de
// los pasos (ver computePreparationTimeFromSteps) y la dificultad ya no se carga desde
// el editor (sigue existiendo en el modelo para las recetas viejas que ya la tenían).
export const createEmptyRecipeDraft = () => ({
  name: '',
  description: '',
  // Una receta puede tener varias categorías (recipecategory es N a N): array de ids
  // en string, para que el picker los compare igual que <option value>.
  categoryIds: [],
  // Porciones que rinde, como texto del input ('' = sin indicar).
  servings: '',
});

// Convierte una receta cruda del backend al estado que espera el formulario de edición.
export const recipeToDraft = (recipe) => ({
  name: recipe.name ?? '',
  description: recipe.description ?? '',
  categoryIds: (recipe.recipecategory ?? []).map((link) => String(link.idCategory)),
  servings: recipe.servings != null ? String(recipe.servings) : '',
});

// Suma el tiempo estimado de cada paso para que sea el tiempo de preparación de la
// receta: el editor ya no lo pide a mano. Devuelve null si ningún paso tiene tiempo
// cargado (en vez de 0), así una edición que borra todos los tiempos también limpia el
// tiempo de preparación de la receta en vez de dejar guardado un valor viejo.
export const computePreparationTimeFromSteps = (steps) => {
  const total = steps.reduce((sum, step) => sum + (Number(step.estimatedTime) || 0), 0);
  return total > 0 ? total : null;
};

// Arma el body para POST/PATCH /api/recipes a partir del estado del formulario.
// preparationTime no viene del draft: RecipeEditorPage lo suma con
// computePreparationTimeFromSteps y lo agrega antes de mandar el pedido.
// servings va en null (no undefined) si se borró: así una edición también lo limpia.
export const draftToRecipePayload = (draft) => ({
  name: draft.name.trim(),
  description: draft.description.trim() || undefined,
  categoryIds: draft.categoryIds.map(Number),
  servings: draft.servings ? Number(draft.servings) : null,
});

// Errores del editor sin nada marcado (ver validateRecipeDraft).
export const NO_RECIPE_ERRORS = { name: '', servings: '', ingredients: '', invalidStepIndexes: [] };

// Recibe: las porciones como texto del input. Devuelve el mensaje de error, o '' si están
// bien (vacío también está bien: son opcionales).
const validateServings = (servings) => {
  if (!servings) return '';
  const value = Number(servings);
  return Number.isInteger(value) && value >= RECIPE_SERVINGS_MIN && value <= RECIPE_SERVINGS_MAX
    ? ''
    : `Ingresá un número entero entre ${RECIPE_SERVINGS_MIN} y ${RECIPE_SERVINGS_MAX}.`;
};

// Revisa lo obligatorio antes de publicar: título, al menos un ingrediente (solo si hay
// ingredientes en el catálogo para elegir: el backend exige al menos uno al guardar la
// lista) y la descripción de cada paso; y que las porciones, si se cargaron, sean válidas.
// Recibe: { draft, ingredients, steps, hasIngredientsCatalog }. Devuelve: { name,
// servings, ingredients, invalidStepIndexes } con el mensaje de cada problema (vacío = está
// bien) y los índices de los pasos sin descripción.
export const validateRecipeDraft = ({ draft, ingredients, steps, hasIngredientsCatalog }) => ({
  name: draft.name.trim() ? '' : 'Ponele un título a tu receta.',
  servings: validateServings(draft.servings),
  ingredients: hasIngredientsCatalog && ingredients.length === 0 ? 'Agregá al menos un ingrediente.' : '',
  invalidStepIndexes: steps
    .map((step, index) => (step.instruction.trim() ? null : index))
    .filter((index) => index !== null),
});

// Recibe: el resultado de validateRecipeDraft. Devuelve: true si hay algo para corregir.
export const hasRecipeErrors = (errors) =>
  Boolean(errors.name || errors.servings || errors.ingredients || errors.invalidStepIndexes.length > 0);
