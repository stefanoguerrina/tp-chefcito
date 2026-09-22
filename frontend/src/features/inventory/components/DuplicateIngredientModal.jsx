// Modal que se muestra cuando el usuario intenta agregar un ingrediente
// que ya está en su inventario. Le muestra la cantidad actual y le permite
// actualizarla con un stepper o cancelar la operación.
import { useState, useEffect, useRef } from 'react';
import '../styles/_duplicate-ingredient-modal.scss';

// Recibe:
//   - modal: { ingredientName, idIngredient, current: { availableQuantity, unitOfMeasure } }
//   - onConfirm(ingredientId, { availableQuantity, unitOfMeasure }): callback al confirmar
//   - onClose: callback al cancelar
function DuplicateIngredientModal({ modal, onConfirm, onClose }) {
  const [quantity, setQuantity] = useState('0');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (modal) {
      setQuantity(String(modal.current?.availableQuantity ?? 0));
      setError('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [modal]);

  if (!modal) return null;

  const unit = modal.current?.unitOfMeasure ?? '';
  const numValue = Number(quantity);
  const isValid = quantity.trim() !== '' && !isNaN(numValue) && Number.isInteger(numValue) && numValue >= 0;

  const handleStep = (delta) => {
    const current = isValid ? numValue : 0;
    const next = Math.max(0, current + delta);
    setQuantity(String(next));
    setError('');
  };

  const handleQtyChange = (e) => {
    setQuantity(e.target.value);
    setError('');
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    const clean = quantity.trim();
    const parsed = Number(clean);
    if (clean === '' || isNaN(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      setError('Ingresá una cantidad entera válida (mayor o igual a 0).');
      return;
    }
    onConfirm(modal.idIngredient, {
      availableQuantity: parsed,
      unitOfMeasure: unit || null,
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="DuplicateModal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dup-modal-title"
      onClick={handleOverlayClick}
    >
      <div className="DuplicateModal">
        {/* Botón cerrar X */}
        <button
          type="button"
          className="DuplicateModal-closeBtn"
          aria-label="Cerrar modal"
          onClick={onClose}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Título */}
        <h3 className="DuplicateModal-title" id="dup-modal-title">
          Ya tenés este ingrediente
        </h3>

        {/* Subtítulo fluido directamente debajo del título */}
        <p className="DuplicateModal-subtitle">
          Actualmente tenés{' '}
          <strong>
            {modal.current?.availableQuantity ?? '—'} {unit}
          </strong>{' '}
          de <strong>{modal.ingredientName}</strong> en tu despensa. ¿Querés actualizar la cantidad?
        </p>

        <form className="DuplicateModal-form" onSubmit={handleConfirm}>
          {/* Stepper de cantidad */}
          <div className="DuplicateModal-stepperWrapper">
            <div className="DuplicateModal-stepper">
              <button
                type="button"
                className="DuplicateModal-stepBtn"
                aria-label="Reducir cantidad"
                onClick={() => handleStep(-1)}
                disabled={isValid && numValue <= 0}
              >
                <span className="material-symbols-outlined">remove</span>
              </button>

              <input
                ref={inputRef}
                id="dup-modal-qty"
                type="number"
                className="DuplicateModal-qtyInput"
                min="0"
                step="1"
                value={quantity}
                onChange={handleQtyChange}
                aria-label="Nueva cantidad"
              />

              <button
                type="button"
                className="DuplicateModal-stepBtn"
                aria-label="Aumentar cantidad"
                onClick={() => handleStep(1)}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            {/* Unidad debajo del stepper */}
            {unit && <p className="DuplicateModal-unitText">{unit}</p>}
          </div>

          {error && <p className="DuplicateModal-error">{error}</p>}

          {/* Acciones simétricas y homogéneas */}
          <div className="DuplicateModal-actions">
            <button type="submit" className="DuplicateModal-btn DuplicateModal-btn--confirm">
              <span className="material-symbols-outlined">check</span>
              Actualizar cantidad
            </button>
            <button
              type="button"
              className="DuplicateModal-btn DuplicateModal-btn--cancel"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DuplicateIngredientModal;
