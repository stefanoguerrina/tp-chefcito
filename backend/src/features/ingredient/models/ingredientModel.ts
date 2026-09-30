// Tipos e interfaces de dominio para la feature Ingredient.
// Esta capa no tiene lógica: solo describe la forma de los datos.
// Un ingrediente puede pertenecer a varias categorías (relación N:M vía
// la tabla intermedia ingredientcategoryingredient), por eso se maneja
// como un array de IDs (categoryIds) en vez de un único idIngredientCategory.
// Los valores nutricionales se pueden mandar junto con el ingrediente (nutritionalValues):
// así el formulario del panel guarda todo en un solo pedido.
import type { CreateNutritionalValueData } from '../../nutritionalValue/models/nutritionalValueModel.js';

// Datos necesarios para crear un nuevo ingrediente.
export interface CreateIngredientData {
  categoryIds: number[];
  name: string;
  description?: string | null;
  unitOfMeasure?: string | null;
  imagePath?: string | null;
  nutritionalValues?: CreateNutritionalValueData[];
}

// Campos que se pueden modificar de un ingrediente existente.
// Si se envía categoryIds (o nutritionalValues), se reemplaza por completo el set actual.
export interface UpdateIngredientData {
  categoryIds?: number[];
  name?: string;
  description?: string | null;
  unitOfMeasure?: string | null;
  imagePath?: string | null;
  nutritionalValues?: CreateNutritionalValueData[];
}
