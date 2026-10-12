// Tipos e interfaces de dominio para la feature NutritionalValue.
// Esta capa no tiene lógica: solo describe la forma de los datos.
// NutritionalValue es una entidad dependiente de Ingredient: su clave primaria
// compuesta (idIngredient, num) no existe sin un ingrediente asociado.

// Datos necesarios para crear un nuevo valor nutricional dentro de un ingrediente.
// El número de secuencia (num) se asigna automáticamente en el repository.
export interface CreateNutritionalValueData {
  name: string;
  servingAmount?: number | null;
  servingUnit?: string | null;
  value?: number | null;
}

// Campos que se pueden modificar de un valor nutricional existente.
export interface UpdateNutritionalValueData {
  name?: string;
  servingAmount?: number | null;
  servingUnit?: string | null;
  value?: number | null;
}
