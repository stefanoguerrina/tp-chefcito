// Test unitario de computeRecipeNutrition: el cálculo de los valores nutricionales por porción
// de una receta. Es una función pura, así que se prueba con datos armados a mano, sin base.
import { describe, it, expect } from 'vitest';
import { computeRecipeNutrition } from './recipeNutritionService.js';
import type { NutritionIngredientInput } from '../models/recipeNutritionModel.js';

// Arma un ingrediente en gramos con su cantidad y sus valores cada 100 gr.
const ingredientInGrams = (
  name: string,
  requiredQuantity: unknown,
  valuesPer100: Record<string, number>
): NutritionIngredientInput => ({
  name,
  unitOfMeasure: 'gr',
  requiredQuantity,
  nutritionalValues: Object.entries(valuesPer100).map(([nutrientName, value]) => ({
    name: nutrientName,
    value,
    servingAmount: 100,
    servingUnit: 'gr',
  })),
});

describe('computeRecipeNutrition', () => {
  it('suma lo que aporta cada ingrediente y lo divide por las porciones', () => {
    const ingredients = [
      // 500 gr con 26 gr de proteínas cada 100 gr → 130 gr
      ingredientInGrams('Carne picada', 500, { Proteínas: 26, Calorías: 250 }),
      // 500 gr con 12 gr de proteínas cada 100 gr → 60 gr
      ingredientInGrams('Fideos', 500, { Proteínas: 12, Calorías: 350 }),
    ];

    const nutrition = computeRecipeNutrition(ingredients, 2);

    const proteins = nutrition.nutrients.find((nutrient) => nutrient.name === 'Proteínas');
    expect(proteins).toEqual({ name: 'Proteínas', unit: 'gr', total: 190, perServing: 95, isComplete: true });
    expect(nutrition.servings).toBe(2);
    expect(nutrition.isComplete).toBe(true);
    expect(nutrition.missingIngredients).toEqual([]);
  });

  it('muestra los nutrientes en el orden fijo de la tabla (Calorías antes que Proteínas)', () => {
    const nutrition = computeRecipeNutrition([ingredientInGrams('Arroz', 100, { Proteínas: 7, Calorías: 130 })], 1);

    expect(nutrition.nutrients.map((nutrient) => nutrient.name)).toEqual(['Calorías', 'Proteínas']);
  });

  it('sin porciones indicadas, el valor por porción es el de la receta entera', () => {
    const nutrition = computeRecipeNutrition([ingredientInGrams('Arroz', 200, { Calorías: 130 })], null);

    expect(nutrition.servings).toBeNull();
    expect(nutrition.nutrients[0]).toMatchObject({ total: 260, perServing: 260 });
  });

  it('un ingrediente sin cantidad ("a gusto") no suma y deja el dato incompleto', () => {
    const ingredients = [
      ingredientInGrams('Carne picada', 500, { Proteínas: 26 }),
      ingredientInGrams('Sal', null, { Sodio: 38000 }),
    ];

    const nutrition = computeRecipeNutrition(ingredients, 1);

    expect(nutrition.missingIngredients).toEqual(['Sal']);
    expect(nutrition.isComplete).toBe(false);
    // Solo lo aportó 1 de los 2 ingredientes: el número real podría ser mayor.
    expect(nutrition.nutrients[0]).toMatchObject({ name: 'Proteínas', total: 130, isComplete: false });
  });

  it('ignora un valor cargado en otra unidad, porque no se puede convertir', () => {
    const milk: NutritionIngredientInput = {
      name: 'Leche',
      unitOfMeasure: 'ml',
      requiredQuantity: 200,
      nutritionalValues: [{ name: 'Calcio', value: 120, servingAmount: 100, servingUnit: 'gr' }],
    };

    const nutrition = computeRecipeNutrition([milk], 1);

    expect(nutrition.nutrients).toEqual([]);
    expect(nutrition.missingIngredients).toEqual(['Leche']);
  });

  it('acepta las cantidades como texto, como llegan los Decimal de Prisma', () => {
    const nutrition = computeRecipeNutrition([ingredientInGrams('Fideos', '250', { Proteínas: 12 })], 1);

    expect(nutrition.nutrients[0]).toMatchObject({ total: 30, perServing: 30 });
  });
});
