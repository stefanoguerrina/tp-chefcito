// Preparación del detalle de receta, de a un paso por vez: píldoras con el número de cada
// paso y barra de progreso arriba (para saltar a cualquiera), el paso actual en el medio y
// "Paso anterior" / "Paso siguiente" abajo.
import { useState } from 'react';
import '../styles/_recipe-steps-panel.scss';

// Recibe: un número. Devuelve: el número con dos dígitos ("02"), como en las píldoras.
const pad = (number) => String(number).padStart(2, '0');

// Recibe: steps (step[] crudo, ya ordenado por stepNumber desde el backend) y totalTime
// (preparationTime de la receta, en minutos, o null).
function RecipeStepsPanel({ steps, totalTime }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const step = steps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;
  // Si la receta no tiene tiempo total cargado, se suma el de cada paso.
  const estimatedTotal = totalTime ?? steps.reduce((sum, item) => sum + (item.estimatedTime ?? 0), 0);

  return (
    <section className="RecipeDetailCard RecipeStepsPanel">
      <div className="RecipeDetailCard-header">
        <h2 className="RecipeDetailCard-title">Instrucciones paso a paso</h2>

        {steps.length > 1 && (
          <div className="RecipeStepsPanel-pills">
            {steps.map((item, index) => (
              <button
                key={item.id ?? index}
                type="button"
                className={`RecipeStepsPanel-pill${index === currentIndex ? ' RecipeStepsPanel-pill--active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ir al paso ${index + 1}`}
                aria-current={index === currentIndex ? 'step' : undefined}
              >
                {pad(index + 1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {steps.length === 0 ? (
        <p className="RecipeDetailCard-empty">Esta receta todavía no tiene pasos cargados.</p>
      ) : (
        <>
          {/* Un segmento por paso: pintados hasta el actual, para ver cuánto falta. */}
          <div className="RecipeStepsPanel-progress" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
            {steps.map((item, index) => (
              <button
                key={item.id ?? index}
                type="button"
                className={
                  'RecipeStepsPanel-segment' +
                  (index <= currentIndex ? ' RecipeStepsPanel-segment--done' : '') +
                  (index === currentIndex ? ' RecipeStepsPanel-segment--current' : '')
                }
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ir al paso ${index + 1}`}
              />
            ))}
          </div>

          <div className="RecipeStepsPanel-content">
            <div className="RecipeStepsPanel-visual">
              <span className="RecipeStepsPanel-bigNumber">{pad(currentIndex + 1)}</span>
              <span className="RecipeStepsPanel-ofTotal">de {pad(steps.length)}</span>
              {step.estimatedTime && (
                <span className="RecipeStepsPanel-duration">
                  <span className="material-symbols-outlined">hourglass_top</span>
                  {step.estimatedTime} min
                </span>
              )}
            </div>

            <div className="RecipeStepsPanel-text">
              <span className="RecipeStepsPanel-tag">
                Paso {pad(currentIndex + 1)} / {pad(steps.length)}
              </span>
              <p className="RecipeStepsPanel-instruction">{step.instruction}</p>
              {estimatedTotal > 0 && (
                <span className="RecipeStepsPanel-hint">
                  <span className="material-symbols-outlined">check_circle</span>
                  Tiempo total estimado: {estimatedTotal} min
                </span>
              )}
            </div>
          </div>

          <div className="RecipeStepsPanel-nav">
            <button
              type="button"
              className="RecipeStepsPanel-navBtn"
              onClick={() => setCurrentIndex((index) => index - 1)}
              disabled={isFirst}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Paso anterior
            </button>
            {/* En el último paso el botón pasa a ser un cierre: ya no hay a dónde avanzar. */}
            <button
              type="button"
              className="RecipeStepsPanel-navBtn RecipeStepsPanel-navBtn--primary"
              onClick={() => setCurrentIndex((index) => index + 1)}
              disabled={isLast}
            >
              {isLast ? '¡Receta lista!' : 'Paso siguiente'}
              <span className="material-symbols-outlined">{isLast ? 'check' : 'arrow_forward'}</span>
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default RecipeStepsPanel;
