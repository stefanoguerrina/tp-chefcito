// Modal para actualizar la cantidad de un ingrediente del inventario.
// Muestra el nombre como texto, un stepper (+/-) con input editable central,
// y la unidad de medida como texto debajo del stepper.
import { useState } from 'react';
import { useOverlayClose } from '../../../core/hooks/useOverlayClose.js';
import { normalizeDecimalInput, isValidQuantity, stepQuantity } from '../../../shared/utils/decimalInput.js';
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

  // Valida el valor actual del input (número >= 0, con decimales).
  const isValid = isValidQuantity(quantity);

  // Ajusta la cantidad con +/- de a una unidad (mínimo 0)
  const handleStep = (delta) => {
    setQuantity(stepQuantity(quantity, delta));
    setQtyError('');
  };

  // Acepta decimales con coma o punto: se guarda siempre con punto (ver decimalInput).
  const handleQtyChange = (e) => {
    setQuantity(normalizeDecimalInput(e.target.value));
    setQtyError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) {
      setQtyError('Ingresá una cantidad válida (mayor o igual a 0).');
      return;
    }
    onConfirm(item.idIngredient, {
      availableQuantity: Number(quantity),
      unitOfMeasure: item.unitOfMeasure ?? null,
    });
  };

  const overlayCloseProps = useOverlayClose(onClose);

  return (
    <div
      className="EditModal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      {...overlayCloseProps}
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
                disabled={isValid && Number(quantity) <= 0}
              >
                <span className="material-symbols-outlined">remove</span>
              </button>

              <input
                autoFocus
                id="edit-modal-qty"
                type="text"
                inputMode="decimal"
                className="EditModal-qtyInput"
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
