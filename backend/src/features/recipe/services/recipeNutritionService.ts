// Cálculo de los valores nutricionales de una receta a partir de sus ingredientes.
// Son funciones puras (sin base de datos): reciben los datos ya leídos y devuelven el
// resultado, así se pueden probar solas. Las usan el detalle de receta (recipeService) y
// el filtro por necesidades nutricionales del buscador (searchService).
import { KNOWN_NUTRIENTS } from '../models/recipeNutritionModel.js';
import type {
  NutritionIngredientInput,
  NutritionalValueInput,
  RecipeNutrient,
  RecipeNutrition,
} from '../models/recipeNutritionModel.js';

// Prisma manda los Decimal como objetos (y pueden venir null): se pasan a number.
const toNumber = (value: unknown): number | null =>
  value === null || value === undefined ? null : Number(value);

// Redondea a un decimal: más precisión no tiene sentido en una tabla nutricional.
const roundOneDecimal = (value: number) => Math.round(value * 10) / 10;

// Posición de cada nutriente conocido, para mostrarlos siempre en el mismo orden.
const nutrientOrder = new Map<string, number>(KNOWN_NUTRIENTS.map((nutrient, index) => [nutrient.name, index]));
const nutrientUnits = new Map<string, string>(KNOWN_NUTRIENTS.map((nutrient) => [nutrient.name, nutrient.unit]));

// Un valor nutricional sirve para el cálculo si tiene valor y porción de referencia, y si
// esa porción está en la misma unidad que la cantidad de la receta (la del ingrediente).
// Al cargarlos desde el panel admin siempre coinciden, pero si no, no se puede convertir.
const isUsableValue = (nutritionalValue: NutritionalValueInput, unitOfMeasure: string | null) => {
  const servingAmount = toNumber(nutritionalValue.servingAmount);
  return (
    servingAmount !== null && servingAmount > 0
    && toNumber(nutritionalValue.value) !== null
    && (!nutritionalValue.servingUnit || nutritionalValue.servingUnit === unitOfMeasure)
  );
};

// Recibe: los ingredientes de la receta (cantidad + tabla nutricional de cada uno) y las
// porciones que rinde (null si no lo indica).
// Devuelve: { servings, nutrients, missingIngredients, isComplete } (ver RecipeNutrition).
// Cada ingrediente aporta (cantidad / porción de referencia) × valor: 500 gr de carne con
// 26 gr de proteínas cada 100 gr aportan 130 gr. Un ingrediente sin cantidad (ej. "sal a
// gusto") o sin valores cargados no suma nada y queda en missingIngredients.
export function computeRecipeNutrition(
  ingredients: NutritionIngredientInput[],
  servings: number | null
): RecipeNutrition {
  // Por nutriente: el total acumulado y cuántos ingredientes lo aportaron.
  const totals = new Map<string, { total: number; ingredientCount: number }>();
  const missingIngredients: string[] = [];

  ingredients.forEach((ingredient) => {
    const quantity = toNumber(ingredient.requiredQuantity);
    const usableValues = ingredient.nutritionalValues.filter((item) => isUsableValue(item, ingredient.unitOfMeasure));

    if (quantity === null || quantity <= 0 || usableValues.length === 0) {
      missingIngredients.push(ingredient.name);
      return;
    }

    usableValues.forEach((item) => {
      const contribution = (quantity / Number(item.servingAmount)) * Number(item.value);
      const current = totals.get(item.name) ?? { total: 0, ingredientCount: 0 };
      totals.set(item.name, { total: current.total + contribution, ingredientCount: current.ingredientCount + 1 });
    });
  });

  // Sin porciones indicadas, "por porción" es la receta completa.
  const divisor = servings && servings > 0 ? servings : 1;

  const nutrients: RecipeNutrient[] = [...totals.entries()]
    .map(([name, { total, ingredientCount }]) => ({
      name,
      unit: nutrientUnits.get(name) ?? '',
      total: roundOneDecimal(total),
      perServing: roundOneDecimal(total / divisor),
      isComplete: ingredientCount === ingredients.length,
    }))
    // Primero los conocidos en su orden; los cargados a mano con otro nombre, al final.
    .sort((a, b) =>
      (nutrientOrder.get(a.name) ?? Infinity) - (nutrientOrder.get(b.name) ?? Infinity)
      || a.name.localeCompare(b.name));

  return {
    servings: servings && servings > 0 ? servings : null,
    nutrients,
    missingIngredients,
    isComplete: ingredients.length > 0 && missingIngredients.length === 0,
  };
}

// Recibe: el resultado de computeRecipeNutrition y el nombre de un nutriente.
// Devuelve: cuánto aporta por porción, o null si no se puede saber con certeza (algún
// ingrediente no tiene cargado ese nutriente). Lo usa el filtro del buscador, que solo
// debe mostrar recetas cuyo dato esté completo.
export function getCompletePerServing(nutrition: RecipeNutrition, nutrientName: string): number | null {
  const nutrient = nutrition.nutrients.find((item) => item.name === nutrientName);
  return nutrient && nutrient.isComplete ? nutrient.perServing : null;
}
