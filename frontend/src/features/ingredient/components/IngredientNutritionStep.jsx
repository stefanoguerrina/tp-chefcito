// Paso 2 del formulario de ingrediente: los valores nutricionales (opcionales), como una
// tabla nutricional. Arriba, la porción de referencia común a todos los valores (su unidad
// no se elige: es la del ingrediente, del paso 1); abajo, "Agregar valor nutricional" y
// una fila por nutriente, elegido de una lista fija (Calorías, Proteínas, ...). Los números
// son inputs de texto que aceptan coma o punto (normalizeDecimalInput los deja con punto).
import DropdownSelect from '../../../core/components/DropdownSelect.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldAriaProps, getFieldErrorId } from '../../../shared/utils/fieldAria.js';
import { normalizeDecimalInput } from '../../../shared/utils/decimalInput.js';
import { NUTRIENT_OPTIONS, getNutrientUnit } from '../models/ingredientFormModel.js';

// Opciones del desplegable de una fila: los nutrientes que no se usaron en OTRA fila (no
// se puede cargar dos veces el mismo). Si la fila tiene un nombre que no está en la lista
// (cargado antes de que existiera), se suma para no perderlo.
// Recibe: las filas y el índice de la fila. Devuelve: [{ value, label }].
const getRowOptions = (nutrients, index) => {
  const usedElsewhere = nutrients.filter((_, i) => i !== index).map((nutrient) => nutrient.name);
  const names = NUTRIENT_OPTIONS.map((option) => option.name).filter((name) => !usedElsewhere.includes(name));
  const currentName = nutrients[index].name;
  const rowNames = names.includes(currentName) ? names : [currentName, ...names];
  return rowNames.map((name) => ({ value: name, label: name }));
};

// Recibe: form, fieldErrors ({ servingAmount?, nutrients?: { [índice]: mensaje } }),
// onServingAmountChange(valor), onAddNutrient, onNutrientChange(índice, campo, valor) y
// onRemoveNutrient(índice).
function IngredientNutritionStep({
  form,
  fieldErrors,
  onServingAmountChange,
  onAddNutrient,
  onNutrientChange,
  onRemoveNutrient,
}) {
  const hasAllNutrients = form.nutrients.length >= NUTRIENT_OPTIONS.length;

  return (
    <>
      <section className="IngredientFormModal-section">
        <label className="IngredientFormModal-sectionTitle" htmlFor="ingf-serving">
          Porción de referencia
        </label>
        <div className="IngredientFormModal-serving">
          <input
            id="ingf-serving"
            type="text"
            inputMode="decimal"
            className="IngredientFormModal-input IngredientFormModal-servingInput"
            value={form.servingAmount}
            onChange={(event) => onServingAmountChange(normalizeDecimalInput(event.target.value))}
            {...getFieldAriaProps('ingf-serving', { error: fieldErrors.servingAmount })}
          />
          {/* Solo lectura a propósito: es la unidad de medida del ingrediente (paso 1). */}
          <span className="IngredientFormModal-lockedUnit" aria-label={`Unidad: ${form.unitOfMeasure}`}>
            {form.unitOfMeasure}
          </span>
        </div>
        <FieldError id={getFieldErrorId('ingf-serving')} message={fieldErrors.servingAmount} />
      </section>

      <section className="IngredientFormModal-section">
        <div className="IngredientFormModal-fieldHeader">
          <h4 className="IngredientFormModal-sectionTitle">Agregar valor nutricional</h4>
          <button
            type="button"
            className="IngredientFormModal-addButton"
            onClick={onAddNutrient}
            disabled={hasAllNutrients}
            aria-label="Agregar valor nutricional"
            title="Agregar valor nutricional"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {form.nutrients.length > 0 && (
          <ul className="IngredientFormModal-nutrients">
            {form.nutrients.map((nutrient, index) => {
              const valueId = `ingf-nutrient-value-${index}`;
              const error = fieldErrors.nutrients?.[index];
              return (
                <li key={index} className="IngredientFormModal-nutrient">
                  <div className="IngredientFormModal-nutrientRow">
                    <div className="IngredientFormModal-nutrientName">
                      <DropdownSelect
                        value={nutrient.name}
                        options={getRowOptions(form.nutrients, index)}
                        onChange={(name) => onNutrientChange(index, 'name', name)}
                        aria-label={`Nutriente ${index + 1}`}
                      />
                    </div>
                    <input
                      id={valueId}
                      type="text"
                      inputMode="decimal"
                      className="IngredientFormModal-input IngredientFormModal-nutrientValue"
                      value={nutrient.value}
                      onChange={(event) => onNutrientChange(index, 'value', normalizeDecimalInput(event.target.value))}
                      placeholder="0"
                      aria-label={`Valor de ${nutrient.name}`}
                      {...getFieldAriaProps(valueId, { error, isRequired: true })}
                    />
                    <span className="IngredientFormModal-nutrientUnit">{getNutrientUnit(nutrient.name)}</span>
                    <button
                      type="button"
                      className="IngredientFormModal-iconButton"
                      onClick={() => onRemoveNutrient(index)}
                      aria-label={`Quitar ${nutrient.name}`}
                      title="Quitar"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                  <FieldError id={getFieldErrorId(valueId)} message={error} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

export default IngredientNutritionStep;
