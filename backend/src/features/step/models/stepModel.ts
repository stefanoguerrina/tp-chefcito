// Tipos e interfaces de dominio para la feature Step.
// Esta capa no tiene lógica: solo describe la forma de los datos.
// Step es una entidad dependiente de Recipe: su clave primaria compuesta
// (idRecipe, id) no existe sin una receta asociada. A diferencia de
// NutritionalValue (que se edita paso a paso, uno por uno), los pasos de una
// receta se editan siempre como una lista ordenada completa (agregar/quitar/
// reordenar en el mismo formulario), por eso la única operación de escritura
// es "reemplazar todo el set" en vez de crear/actualizar/borrar individualmente.

// Un paso tal como lo envía el formulario, sin número asignado todavía
// (el stepNumber lo asigna el repository según la posición en el array).
export interface StepInput {
  instruction: string;
  estimatedTime?: number | null;
}
