// Modal para crear o editar un ingrediente, en dos pasos para que no quede un formulario
// larguísimo: 1) datos (foto, nombre, unidad, categorías, descripción) y 2) valores
// nutricionales (opcionales). Todo se guarda junto al final, en el paso 2. El estado y la
// lógica viven en useIngredientForm; cada paso es su propio componente.
import IngredientDetailsStep from './IngredientDetailsStep.jsx';
import IngredientNutritionStep from './IngredientNutritionStep.jsx';
import RequiredFieldsNote from '../../../core/components/RequiredFieldsNote.jsx';
import { hasFieldErrors } from '../../../shared/utils/fieldAria.js';
import { useIngredientForm, DETAILS_STEP, NUTRITION_STEP } from '../hooks/useIngredientForm.js';
import '../styles/_ingredient-form-modal.scss';

const STEPS = [
  { id: DETAILS_STEP, label: 'Datos' },
  { id: NUTRITION_STEP, label: 'Valores nutricionales' },
];

// Recibe: initialData (null para crear, el ingrediente crudo para editar), categories
// (catálogo completo), onSubmit (async, recibe { data, imageFile, isImageRemoved }) y onCancel.
function IngredientFormModal({ initialData, categories, onSubmit, onCancel }) {
  const {
    form,
    fieldErrors,
    generalError,
    step,
    isSubmitting,
    image,
    updateField,
    handleUnitChange,
    handleAddNutrient,
    handleNutrientChange,
    handleRemoveNutrient,
    handleGoToNutrition,
    handleBackToDetails,
    handleSubmit,
  } = useIngredientForm(initialData, onSubmit);

  const isEditing = initialData !== null;

  // Tocar un paso del indicador equivale a "Siguiente" o "Atrás" (al 2 solo se pasa con
  // el paso 1 completo).
  const handleStepClick = (stepId) => {
    if (stepId === NUTRITION_STEP) handleGoToNutrition();
    else handleBackToDetails();
  };

  return (
    <div className="IngredientFormModal-overlay" onClick={isSubmitting ? undefined : onCancel}>
      <div
        className="IngredientFormModal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ingredient-form-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="IngredientFormModal-header">
          <h3 className="IngredientFormModal-title" id="ingredient-form-modal-title">
            {isEditing ? <>Editar <span className="EditingName">"{initialData.name}"</span></> : 'Nuevo ingrediente'}
          </h3>
          <button
            type="button"
            className="IngredientFormModal-close"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <ol className="IngredientFormModal-steps">
          {STEPS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`IngredientFormModal-step${step === item.id ? ' IngredientFormModal-step--active' : ''}`}
                onClick={() => handleStepClick(item.id)}
                aria-current={step === item.id ? 'step' : undefined}
              >
                <span className="IngredientFormModal-stepNumber">{item.id}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ol>

        {/* noValidate: los errores los muestra la app debajo de cada campo. El único botón
            submit está en el paso 2: en el paso 1, Enter no guarda a medias. Los botones de
            abajo llevan key propia: si React reusara el de "Siguiente" como el submit del
            paso 2, ese mismo click terminaría enviando el formulario. */}
        <form className="IngredientFormModal-form" onSubmit={handleSubmit} noValidate>
          <RequiredFieldsNote isVisible={hasFieldErrors(fieldErrors)} />

          {step === DETAILS_STEP ? (
            <IngredientDetailsStep
              form={form}
              fieldErrors={fieldErrors}
              image={image}
              categories={categories}
              onFieldChange={updateField}
              onUnitChange={handleUnitChange}
            />
          ) : (
            <IngredientNutritionStep
              form={form}
              fieldErrors={fieldErrors}
              onServingAmountChange={(value) => updateField('servingAmount', value)}
              onAddNutrient={handleAddNutrient}
              onNutrientChange={handleNutrientChange}
              onRemoveNutrient={handleRemoveNutrient}
            />
          )}

          {generalError && (
            <p className="IngredientFormModal-error" role="alert">
              {generalError}
            </p>
          )}

          <div className="IngredientFormModal-actions">
            {step === DETAILS_STEP ? (
              <>
                <button key="cancel" type="button" className="IngredientFormModal-secondary" onClick={onCancel}>
                  Cancelar
                </button>
                <button key="next" type="button" className="IngredientFormModal-primary" onClick={handleGoToNutrition}>
                  Siguiente
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </>
            ) : (
              <>
                <button
                  key="back"
                  type="button"
                  className="IngredientFormModal-secondary"
                  onClick={handleBackToDetails}
                  disabled={isSubmitting}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Atrás
                </button>
                <button key="submit" type="submit" className="IngredientFormModal-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear ingrediente'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default IngredientFormModal;
