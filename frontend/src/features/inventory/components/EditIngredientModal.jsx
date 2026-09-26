// Modal para actualizar la cantidad de un ingrediente del inventario.
// Muestra el nombre como texto, un stepper (+/-) con input editable central,
// y la unidad de medida como texto debajo del stepper.
import { useState } from 'react';
import '../styles/_edit-ingredient-modal.scss';

// Recibe:
//   item: el ítem a editar ({ ingredientName, availableQuantity, unitOfMeasure, ... }).
//   onConfirm(ingredientId, { availableQuantity, unitOfMeasure }): callback al guardar.
//   onClose: callback al cancelar.
function EditIngredientModal({ item, onConfirm, onClose }) {
  // Arranca con la cantidad actual del ítem. El padre monta el modal solo cuando hay
  // un ítem abierto (y con key por ítem), así que no hace falta sincronizarlo en un efecto.
  const [quantity, setQuantity] = useState(String(item.availableQuantity ?? 0));
  const [qtyError, setQtyError] = useState('');

  const unit = item.unitOfMeasure ?? item.ingredientBaseUnit ?? '';

  // Parsea y valida el valor actual del input (debe ser número entero >= 0)
  const numValue = Number(quantity);
  const isValid = quantity.trim() !== '' && !isNaN(numValue) && Number.isInteger(numValue) && numValue >= 0;

  // Ajusta la cantidad con +/- en enteros (mínimo 0)
  const handleStep = (delta) => {
    const current = isValid ? numValue : 0;
    const next = Math.max(0, current + delta);
    setQuantity(String(next));
    setQtyError('');
  };

  const handleQtyChange = (e) => {
    const val = e.target.value;
    setQuantity(val);
    setQtyError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = quantity.trim();
    const parsed = Number(clean);
    if (clean === '' || isNaN(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      setQtyError('Ingresá una cantidad entera válida (número entero mayor o igual a 0).');
      return;
    }
    onConfirm(item.idIngredient, {
      availableQuantity: parsed,
      unitOfMeasure: item.unitOfMeasure ?? null,
    });
  };

  // Cierra si se hace clic en el overlay (fuera del panel)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="EditModal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      onClick={handleOverlayClick}
    >
      <div className="EditModal">
        {/* Botón cerrar */}
        <button
          type="button"
          className="EditModal-closeBtn"
          aria-label="Cerrar modal"
          onClick={onClose}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Título */}
        <h3 className="EditModal-title" id="edit-modal-title">
          Actualizar cantidades
        </h3>

        {/* Nombre del ingrediente como texto */}
        <p className="EditModal-ingredientName">{item.ingredientName}</p>

        <form onSubmit={handleSubmit}>
          {/* Stepper de cantidad */}
          <div className="EditModal-stepperWrapper">
            <div className="EditModal-stepper">
              <button
                type="button"
                className="EditModal-stepBtn"
                aria-label="Reducir cantidad"
                onClick={() => handleStep(-1)}
                disabled={isValid && numValue <= 0}
              >
                <span className="material-symbols-outlined">remove</span>
              </button>

              <input
                autoFocus
                id="edit-modal-qty"
                type="number"
                className="EditModal-qtyInput"
                min="0"
                step="1"
                value={quantity}
                onChange={handleQtyChange}
                aria-label="Cantidad disponible"
              />

              <button
                type="button"
                className="EditModal-stepBtn"
                aria-label="Aumentar cantidad"
                onClick={() => handleStep(1)}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            {/* Unidad debajo del stepper */}
            {unit && <p className="EditModal-unitText">{unit}</p>}
          </div>

          {qtyError && <p className="EditModal-error">{qtyError}</p>}

          {/* Acciones */}
          <div className="EditModal-actions">
            <button type="submit" className="EditModal-btn EditModal-btn--save">
              <span className="material-symbols-outlined">check</span>
              Guardar cambios
            </button>
            <button
              type="button"
              className="EditModal-btn EditModal-btn--cancel"
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

export default EditIngredientModal;
