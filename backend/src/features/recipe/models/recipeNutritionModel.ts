// Tipos y constantes de los valores nutricionales de una receta (tabla "Valores por
// porción" del detalle y filtro por necesidades nutricionales del buscador).
// Esta capa no tiene lógica: solo describe la forma de los datos.

// Nutrientes conocidos, en el orden en que se muestran, con la unidad en la que se expresa
// su valor. Son los mismos que ofrece el formulario de ingredientes del panel admin
// (frontend: features/ingredient/models/ingredientFormModel.js, NUTRIENT_OPTIONS).
export const KNOWN_NUTRIENTS = [
  { name: 'Calorías', unit: 'kcal' },
  { name: 'Proteínas', unit: 'gr' },
  { name: 'Carbohidratos', unit: 'gr' },
  { name: 'Azúcares', unit: 'gr' },
  { name: 'Grasas totales', unit: 'gr' },
  { name: 'Grasas saturadas', unit: 'gr' },
  { name: 'Grasas trans', unit: 'gr' },
  { name: 'Fibra', unit: 'gr' },
  { name: 'Sodio', unit: 'mg' },
  { name: 'Colesterol', unit: 'mg' },
  { name: 'Calcio', unit: 'mg' },
  { name: 'Hierro', unit: 'mg' },
  { name: 'Potasio', unit: 'mg' },
  { name: 'Vitamina C', unit: 'mg' },
] as const;

// Un valor nutricional de un ingrediente: `value` cada `servingAmount` `servingUnit`
// (ej. Proteínas: 26 cada 100 gr). Prisma manda los Decimal como objetos: se aceptan
// number, string o cualquier cosa convertible con Number().
export interface NutritionalValueInput {
  name: string;
  servingAmount: unknown;
  servingUnit: string | null;
  value: unknown;
}

// Un ingrediente de la receta con la cantidad que pide (en la unidad del ingrediente) y
// su tabla nutricional.
export interface NutritionIngredientInput {
  name: string;
  unitOfMeasure: string | null;
  requiredQuantity: unknown;
  nutritionalValues: NutritionalValueInput[];
}

// Un nutriente de la receta: cuánto aporta en total y por porción. isComplete = todos los
// ingredientes de la receta tienen cargado este nutriente (si no, el número real puede
// ser mayor).
export interface RecipeNutrient {
  name: string;
  unit: string;
  total: number;
  perServing: number;
  isComplete: boolean;
}

// Resumen nutricional de una receta. servings = porciones que rinde (null si la receta no
// lo indica: en ese caso perServing es el total). missingIngredients = ingredientes que no
// suman nada (sin cantidad o sin valores nutricionales cargados).
export interface RecipeNutrition {
  servings: number | null;
  nutrients: RecipeNutrient[];
  missingIngredients: string[];
  isComplete: boolean;
}
