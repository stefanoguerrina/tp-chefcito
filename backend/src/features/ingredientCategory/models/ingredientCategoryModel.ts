// Tipos e interfaces de dominio para la feature IngredientCategory.
// Esta capa no tiene lógica: solo describe la forma de los datos.

// Datos necesarios para crear una nueva categoría de ingrediente.
export interface CreateIngredientCategoryData {
  name: string;
  description?: string | null;
}

// Campos que se pueden modificar de una categoría de ingrediente existente.
export interface UpdateIngredientCategoryData {
  name?: string;
  description?: string | null;
}
