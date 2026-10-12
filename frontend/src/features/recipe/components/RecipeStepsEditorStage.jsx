// Instrucciones de la receta, dentro del editor: los pasos se cargan de a uno (mismo
// patrón de navegación que RecipeStepsPanel en el detalle de receta), con una barra de
// progreso y píldoras para saltar a cualquiera, y "Nuevo paso" / "Eliminar paso" arriba.
// El tiempo de preparación de la receta ya no se carga a mano: se calcula solo sumando
// el tiempo de cada paso (ver computePreparationTimeFromSteps en RecipeEditorPage), pero
// acá no se muestra ningún total.
import { useState } from 'react';
import RecipeStepCard from './RecipeStepCard.jsx';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import '../styles/_recipe-steps-editor-stage.scss';

// Recibe: un número. Devuelve: el número con dos dígitos ("02"), como las píldoras.
const pad = (number) => String(number).padStart(2, '0');

// Recibe una lista de números de paso (1, 2...). Devuelve: "del paso 2" o "de los pasos 2 y 3".
const describeSteps = (numbers) =>
  numbers.length === 1
    ? `del paso ${numbers[0]}`
    : `de los pasos ${numbers.slice(0, -1).join(', ')} y ${numbers[numbers.length - 1]}`;

// Recibe: steps (array de { instruction, estimatedTime }), onStepsChange (recibe el
// array completo ya modificado) e invalidStepIndexes (índices de los pasos sin
// descripción al intentar publicar; vacío si no hay error).
function RecipeStepsEditorStage({ steps, onStepsChange, invalidStepIndexes = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const goTo = (index) => setCurrentIndex(Math.max(0, Math.min(index, steps.length - 1)));

  const handleChangeCurrentStep = (patch) => {
    onStepsChange(steps.map((step, i) => (i === currentIndex ? { ...step, ...patch } : step)));
  };

  // El paso nuevo se agrega al final y se muestra de una vez, para seguir escribiendo ahí.
  const handleAddStep = () => {
    onStepsChange([...steps, { instruction: '', estimatedTime: '' }]);
    setCurrentIndex(steps.length);
  };

  const handleConfirmDeleteStep = () => {
    const deletedIndex = currentIndex;
    onStepsChange(steps.filter((_, i) => i !== deletedIndex));
    setCurrentIndex((index) => Math.max(0, Math.min(index, steps.length - 2)));
    setShowDeleteConfirm(false);
  };

  return (
    <section className="RecipeEditorCard RecipeStepsEditorStage">
      <div className="RecipeEditorCard-header">
        <h2 className="RecipeEditorCard-title">
          Instrucciones
          <RequiredMark />
        </h2>
        <div className="RecipeStepsEditorStage-headerActions">
          <button
            type="button"
            className="RecipeStepsEditorStage-actionBtn RecipeStepsEditorStage-actionBtn--danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={steps.length <= 1}
            title={steps.length > 1 ? 'Eliminar este paso' : 'La receta debe tener al menos un paso'}
          >
            <span className="material-symbols-outlined">delete</span>
            Eliminar paso
          </button>
          <button
            type="button"
            className="RecipeStepsEditorStage-actionBtn RecipeStepsEditorStage-actionBtn--primary"
            onClick={handleAddStep}
          >
            <span className="material-symbols-outlined">add</span>
            Nuevo paso
          </button>
        </div>
      </div>

      {/* Como se ve un paso por vez, el error dice cuáles faltan (y sus píldoras quedan en rojo). */}
      <FieldError
        id="recipe-steps-error"
        message={
          invalidStepIndexes.length > 0
            ? `Completá la descripción ${describeSteps(invalidStepIndexes.map((index) => index + 1))}.`
            : ''
        }
      />

      {/* Un segmento por paso: pintados hasta el actual, igual que en el detalle de receta. */}
      <div
        className="RecipeStepsEditorStage-progress"
        style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}
      >
        {steps.map((_, index) => (
          <span
            key={index}
            className={`RecipeStepsEditorStage-segment${index <= currentIndex ? ' RecipeStepsEditorStage-segment--done' : ''}`}
          />
        ))}
      </div>

      <RecipeStepCard
        step={steps[currentIndex]}
        index={currentIndex}
        total={steps.length}
        onChange={handleChangeCurrentStep}
        error={invalidStepIndexes.includes(currentIndex) ? 'Escribí qué hay que hacer en este paso.' : ''}
      />

      <div className="RecipeStepsEditorStage-nav">
        <button
          type="button"
          className="RecipeStepsEditorStage-navBtn"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          aria-label="Paso anterior"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <div className="RecipeStepsEditorStage-pills">
          {steps.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`RecipeStepsEditorStage-pill${index === currentIndex ? ' RecipeStepsEditorStage-pill--active' : ''}${invalidStepIndexes.includes(index) ? ' RecipeStepsEditorStage-pill--invalid' : ''}`}
              onClick={() => goTo(index)}
              aria-label={`Ir al paso ${index + 1}${invalidStepIndexes.includes(index) ? ' (falta la descripción)' : ''}`}
            >
              {pad(index + 1)}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="RecipeStepsEditorStage-navBtn RecipeStepsEditorStage-navBtn--primary"
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === steps.length - 1}
          aria-label="Paso siguiente"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Eliminar paso"
          message={`¿Eliminar el paso ${currentIndex + 1}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={handleConfirmDeleteStep}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </section>
  );
}

export default RecipeStepsEditorStage;
