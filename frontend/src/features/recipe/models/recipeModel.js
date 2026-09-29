// Modelo de dominio de la feature Recipe: mapea la forma cruda que devuelve el
// backend a la forma que usa el editor (RecipeEditorPage), y viceversa.
// Sin clases ni interfaces de TS: solo factory functions simples, como el resto
// del frontend.
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Dificultades aceptadas por el backend (deben coincidir con RECIPE_DIFFICULTIES
// de backend/src/features/recipe/models/recipeModel.ts).
export const RECIPE_DIFFICULTIES = ['Fácil', 'Media', 'Avanzada'];

// Ícono (Material Symbols) con el que se muestra la dificultad en el detalle de receta.
export const RECIPE_DIFFICULTY_ICON = 'signal_cellular_alt';

// Límites reales de columnas del backend (recipe.name VarChar(150), recipe.description
// Text con tope de 2000 en la validación): el editor los usa tal cual, sin inventar
// otros más cortos.
export const RECIPE_NAME_MAX_LENGTH = 150;
export const RECIPE_DESCRIPTION_MAX_LENGTH = 2000;

// Imagen de reemplazo para recetas sin foto de portada todavía.
export const RECIPE_PLACEHOLDER_IMAGE = 'https://placehold.co/480x360/f9f3eb/8d7169?text=Sin+foto';

// Recibe: timeMinutes (número, string o null). Devuelve el texto del tiempo de preparación
// ("25 min" o "Sin definir"), mismo formato que muestra RecipeCard.
export const formatPreparationTime = (timeMinutes) =>
  timeMinutes === null || timeMinutes === undefined || timeMinutes === '' ? 'Sin definir' : `${timeMinutes} min`;

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
// rating/reviewsCount no vienen en la receta: quien los tenga (ej. el perfil o
// useRecipeReviewStats, con las estadísticas de reseñas) los agrega encima; si no,
// la card muestra "Sin reseñas".
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
});

// Convierte una receta cruda del backend al estado que espera el formulario de edición.
export const recipeToDraft = (recipe) => ({
  name: recipe.name ?? '',
  description: recipe.description ?? '',
  categoryIds: (recipe.recipecategory ?? []).map((link) => String(link.idCategory)),
});

// Suma el tiempo estimado de cada paso para que sea el tiempo de preparación de la
// receta: el editor ya no lo pide a mano. Devuelve null si ningún paso tiene tiempo
// cargado (en vez de 0), así una edición que borra todos los tiempos también limpia el
// tiempo de preparación de la receta en vez de dejar guardado un valor viejo.
export const computePreparationTimeFromSteps = (steps) => {
  const total = steps.reduce((sum, step) => sum + (Number(step.estimatedTime) || 0), 0);
  return total > 0 ? total : null;
};

// Convierte los pasos crudos del backend (step[]) al estado que espera
// RecipeStepsEditorStage: solo instruction y estimatedTime como string editable.
export const stepsToDraft = (steps) =>
  (steps ?? []).map((step) => ({
    instruction: step.instruction ?? '',
    estimatedTime: step.estimatedTime != null ? String(step.estimatedTime) : '',
  }));

// Convierte los ingredientes crudos del backend (recipeingredient[], con su
// ingredient anidado) al estado que espera RecipeIngredientsStage.
export const recipeIngredientsToDraft = (recipeIngredients) =>
  (recipeIngredients ?? []).map((item) => ({
    idIngredient: String(item.idIngredient),
    quantity: item.requiredQuantity != null ? String(item.requiredQuantity) : '',
  }));

// Convierte las imágenes crudas de una receta (image[]) al estado que administra
// useRecipePhotos: una "foto" por elemento, con su id real (para poder actualizarla o
// borrarla) y originalIsMain (para no mandar un PATCH de más si no cambió nada).
// La principal queda primero, así es la que se ve al abrir el editor.
export const recipeImagesToDraft = (images) =>
  (images ?? [])
    .slice()
    .sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.id - b.id)
    .map((image) => ({
      key: `existing-${image.id}`,
      existingImageId: image.id,
      file: null,
      previewUrl: resolveImageUrl(image.imageUrl),
      isMain: Boolean(image.isMain),
      originalIsMain: Boolean(image.isMain),
    }));

// Arma el body para POST/PATCH /api/recipes a partir del estado del formulario.
// preparationTime no viene del draft: RecipeEditorPage lo suma con
// computePreparationTimeFromSteps y lo agrega antes de mandar el pedido.
export const draftToRecipePayload = (draft) => ({
  name: draft.name.trim(),
  description: draft.description.trim() || undefined,
  categoryIds: draft.categoryIds.map(Number),
});

// Arma el array de pasos para PUT /api/recipes/:id/steps a partir del estado del formulario.
export const stepsToPayload = (steps) =>
  steps.map((step) => ({
    instruction: step.instruction.trim(),
    estimatedTime: step.estimatedTime ? Number(step.estimatedTime) : undefined,
  }));

// Arma el array de ingredientes para PUT /api/recipes/:id/ingredients a partir
// del estado del formulario.
export const recipeIngredientsToPayload = (ingredients) =>
  ingredients.map((item) => ({
    idIngredient: Number(item.idIngredient),
    requiredQuantity: item.quantity ? Number(item.quantity) : undefined,
  }));
