// Lógica de negocio de la feature ingredientCategory.
// Orquesta el repositorio, aplica reglas y transforma datos para el controller.
import { ingredientCategoryRepository } from '../repository/ingredientCategoryRepository.js';
import type { CreateIngredientCategoryData, UpdateIngredientCategoryData } from '../models/ingredientCategoryModel.js';

// Devuelve todas las categorías de ingrediente.
export async function getAllIngredientCategories() {
  const categories = await ingredientCategoryRepository.findAll();
  return categories;
}

// Busca una categoría de ingrediente por ID. Devuelve null si no existe.
export async function getIngredientCategoryById(id: number) {
  return ingredientCategoryRepository.findById(id);
}

// Crea una nueva categoría de ingrediente. Devuelve un objeto de resultado
// que indica éxito, o el motivo del fallo (nombre duplicado).
export async function createIngredientCategory(
  data: CreateIngredientCategoryData
): Promise<
  | { ok: true; category: Awaited<ReturnType<typeof ingredientCategoryRepository.create>> }
  | { ok: false; reason: 'duplicate_name' }
> {
  const existing = await ingredientCategoryRepository.findByName(data.name);
  if (existing) return { ok: false, reason: 'duplicate_name' };

  const category = await ingredientCategoryRepository.create(data);
  return { ok: true, category };
}

// Actualiza una categoría de ingrediente existente. Devuelve null si no existe.
export async function updateIngredientCategory(id: number, data: UpdateIngredientCategoryData) {
  const existing = await ingredientCategoryRepository.findById(id);
  if (!existing) return null;
  return ingredientCategoryRepository.update(id, data);
}

// Elimina una categoría de ingrediente. Devuelve un objeto de resultado:
// ok, not_found, o has_ingredients (si todavía tiene ingredientes asociados).
export async function deleteIngredientCategory(
  id: number
): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'has_ingredients' }> {
  const existing = await ingredientCategoryRepository.findById(id);
  if (!existing) return { ok: false, reason: 'not_found' };

  const ingredientCount = await ingredientCategoryRepository.countIngredients(id);
  if (ingredientCount > 0) return { ok: false, reason: 'has_ingredients' };

  await ingredientCategoryRepository.delete(id);
  return { ok: true };
}
