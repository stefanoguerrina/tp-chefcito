// Lógica de negocio de la feature nutritionalValue.
// Orquesta el repositorio, aplica reglas y transforma datos para el controller.
import { nutritionalValueRepository } from '../repository/nutritionalValueRepository.js';
import type { CreateNutritionalValueData, UpdateNutritionalValueData } from '../models/nutritionalValueModel.js';

// Devuelve todos los valores nutricionales de un ingrediente.
// Devuelve 'ingredient_not_found' si el ingrediente padre no existe.
export async function getAllByIngredient(idIngredient: number) {
  const exists = await nutritionalValueRepository.ingredientExists(idIngredient);
  if (!exists) return 'ingredient_not_found' as const;
  return nutritionalValueRepository.findAllByIngredient(idIngredient);
}

// Busca un valor nutricional puntual. Devuelve null si no existe.
export async function getOne(idIngredient: number, num: number) {
  return nutritionalValueRepository.findOne(idIngredient, num);
}

// Crea un nuevo valor nutricional para un ingrediente. Verifica que el ingrediente exista.
export async function create(
  idIngredient: number,
  data: CreateNutritionalValueData
): Promise<
  | { ok: true; nutritionalValue: Awaited<ReturnType<typeof nutritionalValueRepository.create>> }
  | { ok: false }
> {
  const exists = await nutritionalValueRepository.ingredientExists(idIngredient);
  if (!exists) return { ok: false };

  const nutritionalValue = await nutritionalValueRepository.create(idIngredient, data);
  return { ok: true, nutritionalValue };
}

// Actualiza un valor nutricional existente. Devuelve null si no existe.
export async function update(idIngredient: number, num: number, data: UpdateNutritionalValueData) {
  const existing = await nutritionalValueRepository.findOne(idIngredient, num);
  if (!existing) return null;
  return nutritionalValueRepository.update(idIngredient, num, data);
}

// Elimina un valor nutricional. Devuelve el registro eliminado o null si no existía.
export async function remove(idIngredient: number, num: number) {
  const existing = await nutritionalValueRepository.findOne(idIngredient, num);
  if (!existing) return null;
  await nutritionalValueRepository.delete(idIngredient, num);
  return existing;
}
