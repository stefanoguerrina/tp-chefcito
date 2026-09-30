// Campos del paso que se está editando, dentro de RecipeStepsEditorStage: instrucción
// (obligatoria) y tiempo estimado (opcional). Los pasos no tienen título ni foto propia,
// a diferencia de la receta (que sí tiene su portada); el número de paso y "Eliminar" se
// manejan desde el encabezado de la etapa, no acá.
import { RECIPE_DESCRIPTION_MAX_LENGTH } from '../models/recipeModel.js';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldAriaProps, getFieldErrorId } from '../../../shared/utils/fieldAria.js';

// Recibe: step ({ instruction, estimatedTime }), index (posición 0-based) y total
// (cantidad de pasos, para el texto "Paso X de Y"), onChange (campos modificados) y
// error (mensaje si se intentó publicar con este paso sin descripción; vacío si no).
function RecipeStepCard({ step, index, total, onChange, error }) {
  return (
    <div className="RecipeStepCard">
      <span className="RecipeStepCard-tag">Paso {index + 1} de {total}</span>

      <div className="RecipeStepCard-field">
        <label htmlFor={`step-instruction-${index}`}>
          Descripción
          <RequiredMark />
        </label>
        <textarea
          id={`step-instruction-${index}`}
          value={step.instruction}
          onChange={(e) => onChange({ instruction: e.target.value })}
          placeholder="Explicá cómo ejecutar este paso con precisión..."
          rows={5}
          maxLength={RECIPE_DESCRIPTION_MAX_LENGTH}
          {...getFieldAriaProps(`step-instruction-${index}`, { error, isRequired: true })}
        />
        <FieldError id={getFieldErrorId(`step-instruction-${index}`)} message={error} />
      </div>

      <div className="RecipeStepCard-timeField">
        <span className="material-symbols-outlined">timer</span>
        <label htmlFor={`step-time-${index}`}>Tiempo:</label>
        <input
          id={`step-time-${index}`}
          type="number"
          min="1"
          value={step.estimatedTime}
          onChange={(e) => onChange({ estimatedTime: e.target.value })}
          placeholder="-"
          aria-label="Tiempo estimado en minutos (opcional)"
        />
        <span>min</span>
      </div>
    </div>
  );
}

export default RecipeStepCard;
