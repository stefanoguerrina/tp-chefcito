// Tipos e interfaces de dominio para la feature Image.
// Esta capa no tiene lógica: solo describe la forma de los datos.
// Image es una entidad dependiente de Recipe: su clave primaria compuesta
// (idRecipe, id) no existe sin una receta asociada. Una receta puede tener
// varias imágenes, pero a lo sumo una marcada como "principal" (isMain).

// Datos necesarios para agregar una nueva imagen a una receta.
export interface CreateImageData {
  imageUrl: string;
  isMain?: boolean;
}

// Campos que se pueden modificar de una imagen existente.
export interface UpdateImageData {
  imageUrl?: string;
  isMain?: boolean;
}
