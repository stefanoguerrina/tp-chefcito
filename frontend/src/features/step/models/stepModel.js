// Modelo de la feature Step (pasos de preparación de una receta): mapea la forma cruda
// que devuelve el backend y arma la que espera el editor de recetas, y viceversa.
// Factory functions simples, como el resto del frontend.

// Convierte un paso crudo del backend (fila de step) al objeto que usa el frontend.
// Recibe: { idRecipe, id, stepNumber, instruction, estimatedTime }.
// Devuelve: { id, stepNumber, instruction, estimatedTime } (estimatedTime en minutos o null).
export const stepFromApi = (step) => ({
  id: step.id,
  stepNumber: step.stepNumber,
  instruction: step.instruction ?? '',
  estimatedTime: step.estimatedTime ?? null,
});

// Convierte los pasos crudos del backend (step[]) al estado que espera
// RecipeStepsEditorStage: solo instruction y estimatedTime como string editable.
export const stepsToDraft = (steps) =>
  (steps ?? []).map((step) => ({
    instruction: step.instruction ?? '',
    estimatedTime: step.estimatedTime != null ? String(step.estimatedTime) : '',
  }));

// Arma el array de pasos para PUT /api/recipes/:id/steps a partir del estado del formulario.
export const stepsToPayload = (steps) =>
  steps.map((step) => ({
    instruction: step.instruction.trim(),
    estimatedTime: step.estimatedTime ? Number(step.estimatedTime) : undefined,
  }));
