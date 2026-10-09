// Lógica de negocio de la feature ingredient.
// Orquesta el repositorio, aplica reglas y transforma datos para el controller.
import { ingredientRepository } from '../repository/ingredientRepository.js';
import type { CreateIngredientData, UpdateIngredientData } from '../models/ingredientModel.js';
import { deleteLocalUpload } from '../../../core/fileStorage.js';

// Devuelve todos los ingredientes con sus categorías.
export async function getAllIngredients() {
  const ingredients = await ingredientRepository.findAll();
  return ingredients;
}

// Busca un ingrediente por ID. Devuelve null si no existe.
export async function getIngredientById(id: number) {
  return ingredientRepository.findById(id);
}

// Crea un nuevo ingrediente. Verifica que todas las categorías existan y que
// no haya otro ingrediente con el mismo nombre en toda la tabla (nombre único global).
export async function createIngredient(
  data: CreateIngredientData
): Promise<
  | { ok: true; ingredient: Awaited<ReturnType<typeof ingredientRepository.create>> }
  | { ok: false; reason: 'categories_not_found' | 'duplicate_name' }
> {
  const categoriesExist = await ingredientRepository.categoriesExist(data.categoryIds);
  if (!categoriesExist) return { ok: false, reason: 'categories_not_found' };

  const existing = await ingredientRepository.findByName(data.name);
  if (existing) return { ok: false, reason: 'duplicate_name' };

  const ingredient = await ingredientRepository.create(data);
  return { ok: true, ingredient };
}

// Actualiza un ingrediente existente. Si se envían categoryIds, verifica que todas
// existan (y reemplaza el set completo). Si se cambia el nombre, verifica que no
// choque con otro ingrediente (excluyéndose a sí mismo).
export async function updateIngredient(
  id: number,
  data: UpdateIngredientData
): Promise<
  | { ok: true; ingredient: Awaited<ReturnType<typeof ingredientRepository.update>> }
  | { ok: false; reason: 'not_found' | 'categories_not_found' | 'duplicate_name' }
> {
  const existing = await ingredientRepository.findById(id);
  if (!existing) return { ok: false, reason: 'not_found' };

  if (data.categoryIds !== undefined) {
    const categoriesExist = await ingredientRepository.categoriesExist(data.categoryIds);
    if (!categoriesExist) return { ok: false, reason: 'categories_not_found' };
  }

  if (data.name !== undefined) {
    const duplicate = await ingredientRepository.findByName(data.name, id);
    if (duplicate) return { ok: false, reason: 'duplicate_name' };
  }

  const ingredient = await ingredientRepository.update(id, data);
  return { ok: true, ingredient };
}

// Elimina un ingrediente. Devuelve un objeto de resultado: ok, not_found, o in_use
// (si tiene inventario, valores nutricionales o recetas asociadas).
export async function deleteIngredient(
  id: number
): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'in_use' }> {
  const existing = await ingredientRepository.findById(id);
  if (!existing) return { ok: false, reason: 'not_found' };

  try {
    await ingredientRepository.delete(id);
    // Recién con el ingrediente borrado se borra su foto: si el borrado fallaba (en uso),
    // la foto tenía que seguir estando.
    await deleteLocalUpload(existing.imagePath);
    return { ok: true };
  } catch (error: any) {
    // Prisma lanza P2003/P2014 cuando hay filas relacionadas.
    if (error?.code === 'P2003' || error?.code === 'P2014') {
      return { ok: false, reason: 'in_use' };
    }
    throw error;
  }
}

// Guarda la nueva foto de un ingrediente (una sola por ingrediente).
// Recibe: id del ingrediente y la ruta pública del archivo ya subido. La foto anterior, si
// era un archivo propio, se borra del disco porque ya no la usa nadie (mismo criterio que
// el avatar de un usuario). Devuelve el ingrediente actualizado o not_found.
export async function setIngredientImage(
  id: number,
  imagePath: string
): Promise<
  | { ok: true; ingredient: Awaited<ReturnType<typeof ingredientRepository.update>> }
  | { ok: false; reason: 'not_found' }
> {
  const existing = await ingredientRepository.findById(id);
  if (!existing) return { ok: false, reason: 'not_found' };

  const ingredient = await ingredientRepository.update(id, { imagePath });
  await deleteLocalUpload(existing.imagePath);
  return { ok: true, ingredient };
}

// Quita la foto de un ingrediente: deja imagePath en null y borra el archivo.
// Recibe: id del ingrediente. Devuelve el ingrediente actualizado o not_found.
export async function removeIngredientImage(
  id: number
): Promise<
  | { ok: true; ingredient: Awaited<ReturnType<typeof ingredientRepository.update>> }
  | { ok: false; reason: 'not_found' }
> {
  const existing = await ingredientRepository.findById(id);
  if (!existing) return { ok: false, reason: 'not_found' };

  const ingredient = await ingredientRepository.update(id, { imagePath: null });
  await deleteLocalUpload(existing.imagePath);
  return { ok: true, ingredient };
}
