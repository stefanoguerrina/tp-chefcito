// Lógica de negocio de "Con mi despensa": cruza los ingredientes de una receta con los
// que el usuario tiene en su inventario. Son funciones puras (no tocan la base de datos):
// reciben los datos ya cargados, así se pueden probar con un test unitario sin mocks.
import type { PantryMatch, PantryMissingIngredient } from '../models/searchModel.js';

// Un ingrediente de receta tal como lo trae el repositorio (Prisma devuelve las
// cantidades como Decimal: se aceptan números, strings o Decimal y se pasan a Number).
interface RecipeIngredientForMatch {
  idIngredient: number;
  requiredQuantity: unknown;
  ingredient: { name: string };
}

// Convierte una cantidad de la base (Decimal, string o null) en número o null.
const toQuantity = (value: unknown): number | null =>
  value === null || value === undefined ? null : Number(value);

// Arma el mapa idIngredient → cantidad disponible a partir de las filas del inventario.
// Recibe: [{ idIngredient, availableQuantity }]. Devuelve: Map (cantidad null = sin cargar).
export function buildPantryMap(inventory: { idIngredient: number; availableQuantity: unknown }[]) {
  return new Map(inventory.map((item) => [item.idIngredient, toQuantity(item.availableQuantity)]));
}

// Calcula cuánto de una receta se puede hacer con la despensa.
// Recibe: los ingredientes de la receta y el mapa de buildPantryMap.
// Devuelve: { availableCount, totalCount, missing, isComplete }.
// Un ingrediente cuenta como "lo tenés" si está en el inventario con cantidad mayor a 0 y,
// cuando la receta y el inventario tienen cantidad cargada, alcanza la requerida. Si falta
// alguna de las dos cantidades no hay con qué comparar, así que alcanza con tenerlo.
export function computePantryMatch(
  recipeIngredients: RecipeIngredientForMatch[],
  pantry: Map<number, number | null>
): PantryMatch {
  const missing: PantryMissingIngredient[] = [];

  recipeIngredients.forEach((item) => {
    const base = { idIngredient: item.idIngredient, name: item.ingredient.name };
    if (!pantry.has(item.idIngredient)) {
      missing.push({ ...base, reason: 'missing' });
      return;
    }

    const available = pantry.get(item.idIngredient) ?? null;
    const required = toQuantity(item.requiredQuantity);
    if (available !== null && available <= 0) {
      missing.push({ ...base, reason: 'missing' });
    } else if (available !== null && required !== null && available < required) {
      missing.push({ ...base, reason: 'not_enough' });
    }
  });

  const totalCount = recipeIngredients.length;
  return {
    availableCount: totalCount - missing.length,
    totalCount,
    missing,
    // Una receta sin ingredientes cargados no se puede evaluar: nunca cuenta como completa.
    isComplete: totalCount > 0 && missing.length === 0,
  };
}

// Compara dos coincidencias para ordenarlas de "más cocinable" a "menos": primero las
// completas, después las de mayor porcentaje de ingredientes y, a igual porcentaje, las
// que tienen menos ingredientes faltantes. Devuelve negativo si `a` va antes que `b`.
export function comparePantryMatches(a: PantryMatch, b: PantryMatch): number {
  if (a.isComplete !== b.isComplete) return a.isComplete ? -1 : 1;
  const ratioA = a.totalCount ? a.availableCount / a.totalCount : 0;
  const ratioB = b.totalCount ? b.availableCount / b.totalCount : 0;
  if (ratioA !== ratioB) return ratioB - ratioA;
  return a.missing.length - b.missing.length;
}
