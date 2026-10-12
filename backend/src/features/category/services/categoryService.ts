// Lógica de negocio de la feature category.
// Orquesta el repositorio, aplica reglas (por ejemplo, evitar nombres duplicados) y
// transforma datos para el controller.
import { categoryRepository } from '../repository/categoryRepository.js';
import type { CreateCategoryData, UpdateCategoryData } from '../models/categoryModel.js';

// Devuelve todas las categorías (array vacío si todavía no hay ninguna cargada).
export async function getAllCategories() {
  const categories = await categoryRepository.findAll();
  return categories;
}

// Busca una categoría por su nombre exacto. Devuelve null si no existe.
export async function getCategoryByName(name: string) {
  const category = await categoryRepository.findByName(name);
  return category ?? null;
}

// Crea una categoría nueva, verificando primero que no exista otra con el mismo nombre.
// Devuelve { ok: true, category } o { ok: false, reason: 'duplicate' }.
export async function createCategory(data: CreateCategoryData) {
  const existing = await categoryRepository.findByName(data.name);
  if (existing) {
    return { ok: false as const, reason: 'duplicate' as const };
  }

  const category = await categoryRepository.create(data);
  return { ok: true as const, category };
}

// Actualiza los datos de una categoría existente.
// Devuelve null si no existe, 'duplicate' si el nuevo nombre ya está en uso por otra categoría,
// o la categoría actualizada si todo salió bien.
export async function updateCategory(id: number, data: UpdateCategoryData) {
  const existing = await categoryRepository.findById(id);
  if (!existing) return null;

  // Solo revalidamos duplicados si el nombre efectivamente está cambiando.
  if (data.name && data.name !== existing.name) {
    const duplicate = await categoryRepository.findByName(data.name);
    if (duplicate) return 'duplicate' as const;
  }

  return categoryRepository.update(id, data);
}

// Elimina definitivamente una categoría. Devuelve sus datos o null si no existía.
export async function deleteCategory(id: number) {
  const existing = await categoryRepository.findById(id);
  if (!existing) return null;
  await categoryRepository.delete(id);
  return existing;
}
