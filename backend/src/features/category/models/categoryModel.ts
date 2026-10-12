// Tipos e interfaces de dominio para la feature Category.
// Esta capa no tiene lógica: solo describe la forma de los datos.
// Coincide con el modelo `category` de prisma/schema.prisma (id, name, description).

// Datos necesarios para crear una nueva categoría.
export interface CreateCategoryData {
  name: string;
  description?: string | null;
}

// Campos que se pueden modificar de una categoría existente.
export interface UpdateCategoryData {
  name?: string;
  description?: string | null;
}
