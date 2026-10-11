// Test unitario del CU "Consultar recetas según ingredientes disponibles": cruzar los
// ingredientes de una receta con el inventario del usuario y ordenar las recetas de "más
// cocinable" a "menos". Son funciones puras, se prueban sin base de datos.
import { describe, it, expect } from 'vitest';
import { buildPantryMap, computePantryMatch, comparePantryMatches } from './pantryMatchService.js';

// Ingredientes de una receta de ejemplo (fideos con tuco), como los trae el repositorio.
const recipeIngredients = [
  { idIngredient: 1, requiredQuantity: 500, ingredient: { name: 'Fideos' } },
  { idIngredient: 2, requiredQuantity: 400, ingredient: { name: 'Tomate' } },
  { idIngredient: 3, requiredQuantity: 100, ingredient: { name: 'Cebolla' } },
];

describe('computePantryMatch', () => {
  it('la receta es completa si el inventario tiene todo en cantidad suficiente', () => {
    const pantry = buildPantryMap([
      { idIngredient: 1, availableQuantity: 1000 },
      { idIngredient: 2, availableQuantity: 400 },
      { idIngredient: 3, availableQuantity: '250' },
    ]);

    const match = computePantryMatch(recipeIngredients, pantry);

    expect(match).toEqual({ availableCount: 3, totalCount: 3, missing: [], isComplete: true });
  });

  it('distingue el ingrediente que falta del que no alcanza', () => {
    const pantry = buildPantryMap([
      { idIngredient: 1, availableQuantity: 200 }, // pide 500: no alcanza
      { idIngredient: 2, availableQuantity: 400 },
      // la cebolla (3) no está en el inventario
    ]);

    const match = computePantryMatch(recipeIngredients, pantry);

    expect(match.isComplete).toBe(false);
    expect(match.availableCount).toBe(1);
    expect(match.missing).toEqual([
      { idIngredient: 1, name: 'Fideos', reason: 'not_enough' },
      { idIngredient: 3, name: 'Cebolla', reason: 'missing' },
    ]);
  });

  it('un ingrediente con cantidad 0 en el inventario cuenta como faltante', () => {
    const pantry = buildPantryMap([{ idIngredient: 1, availableQuantity: 0 }]);

    const match = computePantryMatch([recipeIngredients[0]], pantry);

    expect(match.missing).toEqual([{ idIngredient: 1, name: 'Fideos', reason: 'missing' }]);
  });

  it('si el inventario no tiene cantidad cargada, alcanza con tener el ingrediente', () => {
    const pantry = buildPantryMap([{ idIngredient: 1, availableQuantity: null }]);

    const match = computePantryMatch([recipeIngredients[0]], pantry);

    expect(match.isComplete).toBe(true);
  });

  it('una receta sin ingredientes cargados nunca cuenta como completa', () => {
    const match = computePantryMatch([], buildPantryMap([]));

    expect(match).toEqual({ availableCount: 0, totalCount: 0, missing: [], isComplete: false });
  });
});

describe('comparePantryMatches', () => {
  it('ordena primero las completas, después por porcentaje y después por menos faltantes', () => {
    const missingOne = { idIngredient: 9, name: 'X', reason: 'missing' as const };
    const complete = { availableCount: 2, totalCount: 2, missing: [], isComplete: true };
    const half = { availableCount: 1, totalCount: 2, missing: [missingOne], isComplete: false };
    const twoThirds = { availableCount: 2, totalCount: 3, missing: [missingOne], isComplete: false };
    const halfWithMoreMissing = {
      availableCount: 2,
      totalCount: 4,
      missing: [missingOne, missingOne],
      isComplete: false,
    };

    const sorted = [half, halfWithMoreMissing, twoThirds, complete].sort(comparePantryMatches);

    expect(sorted).toEqual([complete, twoThirds, half, halfWithMoreMissing]);
  });
});
