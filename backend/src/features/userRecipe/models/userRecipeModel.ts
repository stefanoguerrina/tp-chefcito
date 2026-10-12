// Tipos de dominio para la feature UserRecipe (recetas guardadas por un usuario).
// Esta capa no tiene lógica: solo describe la forma de los datos.
// El idUser siempre sale del token JWT, nunca del body. El idRecipe sale del param de ruta.

// Datos opcionales al guardar una receta (crear el registro userrecipe).
export interface CreateUserRecipeData {
  isSaved?: boolean;
}

// Campos que se pueden modificar de un registro userrecipe existente.
export interface UpdateUserRecipeData {
  isSaved: boolean;
}
