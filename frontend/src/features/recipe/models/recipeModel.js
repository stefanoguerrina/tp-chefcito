// Modelo de dominio de la feature Recipe: mapea la forma cruda que devuelve el
// backend a la forma que usa el editor (RecipeEditorPage), y viceversa.
// Sin clases ni interfaces de TS: solo factory functions simples, como el resto
// del frontend.
import { resolveImageUrl } from '../../../shared/utils/imageUrl.js';

// Dificultades aceptadas por el backend (deben coincidir con RECIPE_DIFFICULTIES
// de backend/src/features/recipe/models/recipeModel.ts).
export const RECIPE_DIFFICULTIES = ['Fácil', 'Media', 'Avanzada'];

// Imagen de reemplazo para recetas sin foto de portada todavía.
export const RECIPE_PLACEHOLDER_IMAGE = 'https://placehold.co/480x360/f9f3eb/8d7169?text=Sin+foto';

// Avatar de reemplazo para autores sin foto de perfil todavía.
export const RECIPE_PLACEHOLDER_AVATAR = 'https://placehold.co/48x48/e1bfb6/59413b?text=%20';

// Devuelve la imagen principal de una receta cruda (la marcada isMain o, si no hay, la
// primera), o null si todavía no tiene ninguna.
export const getMainImage = (recipe) =>
  recipe.image?.find((img) => img.isMain) ?? recipe.image?.[0] ?? null;

// Devuelve la URL lista para <img src> de la foto principal, o el placeholder si no tiene.
export const getRecipeImageUrl = (recipe) =>
  resolveImageUrl(getMainImage(recipe)?.imageUrl) ?? RECIPE_PLACEHOLDER_IMAGE;

// Convierte una receta cruda del backend a las props que espera RecipeCard
// (core/components), usado tanto en "Mis recetas" como en la previsualización
// en vivo del wizard.
export const recipeToCardProps = (recipe) => {
  const categoryName = recipe.recipecategory?.[0]?.category?.name;
  return {
    title: recipe.name,
    author: recipe.user?.username ?? '',
    image: getRecipeImageUrl(recipe),
    rating: 0,
    reviewsCount: 0,
    timeMinutes: recipe.preparationTime ?? '—',
    difficulty: recipe.difficulty ?? 'Sin definir',
    badge: categoryName ? { label: categoryName, icon: 'sell' } : null,
  };
};

// Convierte una receta cruda del backend a las props que espera HomeRecipeCard
// (features/recipe/components), usado en el feed de recetas de la comunidad
// de la home.
export const recipeToHomeCardProps = (recipe) => {
  const categoryName = recipe.recipecategory?.[0]?.category?.name;
  return {
    id: recipe.id,
    title: recipe.name,
    image: getRecipeImageUrl(recipe),
    badge: categoryName ? { label: categoryName } : null,
    description: null,
    time: recipe.preparationTime != null ? `${recipe.preparationTime} min` : '—',
    difficulty: recipe.difficulty ?? 'Sin definir',
    author: recipe.user?.username ?? null,
    authorAvatar: recipe.user?.avatarUrl ?? RECIPE_PLACEHOLDER_AVATAR,
  };
};

// Arma el estado inicial en blanco del formulario (Etapa 1) para crear una receta nueva.
export const createEmptyRecipeDraft = () => ({
  name: '',
  description: '',
  preparationTime: '',
  difficulty: '',
  categoryId: '',
  // Lo que se muestra en la vista previa de la portada: la foto ya guardada, una vista
  // previa local (blob:) de la foto elegida o el link pegado.
  coverImagePreview: null,
  // Foto nueva elegida desde el dispositivo (File ya comprimido), o null.
  coverImageFile: null,
  // Link externo pegado por el usuario en lugar de subir una foto ('' si no hay).
  coverImageLink: '',
  // id de la imagen principal ya guardada en el backend (null si todavía no tiene).
  // Se usa para saber si hay que crear una imagen nueva o actualizar la existente.
  mainImageId: null,
});

// Convierte una receta cruda del backend (con su recipecategory[] e image[]) al
// estado que espera el formulario de edición. Solo toma la primera categoría
// vinculada, ya que el selector de la Etapa 1 es de una sola categoría a la vez.
export const recipeToDraft = (recipe) => {
  const mainImage = getMainImage(recipe);
  return {
    name: recipe.name ?? '',
    description: recipe.description ?? '',
    preparationTime: recipe.preparationTime != null ? String(recipe.preparationTime) : '',
    difficulty: recipe.difficulty ?? '',
    categoryId: recipe.recipecategory?.[0]?.idCategory != null ? String(recipe.recipecategory[0].idCategory) : '',
    coverImagePreview: resolveImageUrl(mainImage?.imageUrl),
    coverImageFile: null,
    coverImageLink: '',
    mainImageId: mainImage?.id ?? null,
  };
};

// Convierte los pasos crudos del backend (step[]) al estado que espera
// RecipeStepsStage: solo instruction y estimatedTime como string editable.
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

// Arma el body para POST/PATCH /api/recipes a partir del estado del formulario.
export const draftToRecipePayload = (draft) => ({
  name: draft.name.trim(),
  description: draft.description.trim() || undefined,
  preparationTime: draft.preparationTime ? Number(draft.preparationTime) : undefined,
  difficulty: draft.difficulty || undefined,
  categoryIds: draft.categoryId ? [Number(draft.categoryId)] : [],
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

// Arma los datos de la portada para createImage/updateImage según lo que eligió el
// usuario: la foto subida tiene prioridad sobre un link pegado.
// Recibe: el draft. Devuelve: { file } | { imageUrl }, o null si no hay nada nuevo.
export const draftToCoverImagePayload = (draft) => {
  if (draft.coverImageFile) return { file: draft.coverImageFile, isMain: true };
  if (draft.coverImageLink.trim()) return { imageUrl: draft.coverImageLink.trim(), isMain: true };
  return null;
};
