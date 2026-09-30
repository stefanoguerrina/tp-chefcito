// Formulario para buscar y agregar un ingrediente al inventario.
// Muestra un input de búsqueda con dropdown de sugerencias + stepper de cantidad + unidad fija (texto) + botón agregar.
import { useState } from 'react';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldAriaProps, getFieldErrorId } from '../../../shared/utils/fieldAria.js';

// Recibe:
//   allIngredients: lista completa de ingredientes disponibles.
//   ingredientsLoading: boolean.
//   onAdd(ingredientId, quantity, unit): callback al confirmar.
function AddIngredientForm({ allIngredients, ingredientsLoading, onAdd }) {
  const [search, setSearch] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  // Errores de los dos campos obligatorios ({ ingredient, quantity }), debajo de cada uno.
  const [fieldErrors, setFieldErrors] = useState({});
  const clearFieldError = (field) => setFieldErrors((prev) => ({ ...prev, [field]: '' }));

  // Filtra por nombre (mínimo 1 carácter, máximo 8 resultados)
  const filtered =
    search.trim().length > 0
      ? allIngredients
          .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 8)
      : [];

  const handleSelectIngredient = (ingredient) => {
    setSelectedIngredient(ingredient);
    setSearch(ingredient.name);
    setUnit(ingredient.unitOfMeasure ?? '');
    clearFieldError('ingredient');
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    clearFieldError('ingredient');
    if (selectedIngredient && e.target.value !== selectedIngredient.name) {
      setSelectedIngredient(null);
      setUnit('');
    }
  };

  // Ajusta la cantidad con +/- en enteros
  const handleStep = (delta) => {
    const num = Number(quantity);
    const current = !isNaN(num) && Number.isInteger(num) && num >= 0 ? num : 0;
    const next = Math.max(0, current + delta);
    setQuantity(String(next));
    clearFieldError('quantity');
  };

  const handleQtyChange = (e) => {
    setQuantity(e.target.value);
    clearFieldError('quantity');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Se revisan los dos campos a la vez, así se marcan todos los que falten de una.
    const clean = quantity.trim();
    const parsed = Number(clean);
    const errors = {};
    if (!selectedIngredient) errors.ingredient = 'Seleccioná un ingrediente de la lista desplegable.';
    if (clean === '' || isNaN(parsed) || !Number.isInteger(parsed) || parsed < 0) {
      errors.quantity = 'Ingresá una cantidad entera (0 o más).';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onAdd(selectedIngredient.id, parsed, unit);
    setSearch('');
    setSelectedIngredient(null);
    setQuantity('1');
    setUnit('');
  };

  const numVal = Number(quantity);
  const isQtyValid = quantity.trim() !== '' && !isNaN(numVal) && Number.isInteger(numVal) && numVal >= 0;

  return (
    // noValidate: los errores los muestra la app debajo de cada campo.
    <form className="InventoryForm" onSubmit={handleSubmit} noValidate>
      {/* Buscador con dropdown */}
      <div className="InventoryForm-field InventoryForm-searchWrapper">
        <label htmlFor="add-ingredient-search">
          Buscar ingrediente
          <RequiredMark />
        </label>
        <input
          id="add-ingredient-search"
          type="text"
          className="InventoryForm-input"
          placeholder={
            ingredientsLoading
              ? 'Cargando ingredientes…'
              : 'Ej: tomate, harina, leche…'
          }
          value={search}
          onChange={handleSearchChange}
          disabled={ingredientsLoading}
          autoComplete="off"
          {...getFieldAriaProps('add-ingredient-search', { error: fieldErrors.ingredient, isRequired: true })}
        />
        <FieldError id={getFieldErrorId('add-ingredient-search')} message={fieldErrors.ingredient} />

        {filtered.length > 0 && !selectedIngredient && (
          <ul className="InventoryForm-suggestions">
            {filtered.map((ingredient) => (
              <li key={ingredient.id}>
                <button
                  type="button"
                  className="InventoryForm-suggestion"
                  onClick={() => handleSelectIngredient(ingredient)}
                >
                  <span className="InventoryForm-suggestionName">{ingredient.name}</span>
                  {ingredient.unitOfMeasure && (
                    <span className="InventoryForm-suggestionUnit">
                      {ingredient.unitOfMeasure}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cantidad (Stepper) + Unidad (Texto) + Botón Agregar alineados y simétricos */}
      <div className="InventoryForm-row">
        {/* Stepper de cantidad */}
        <div className="InventoryForm-field InventoryForm-field--qty">
          <label htmlFor="add-ingredient-qty">
            Cantidad
            <RequiredMark />
          </label>
          {/* El borde lo tiene el stepper (el input no): con error, se marca el stepper. */}
          <div className={`InventoryForm-stepper${fieldErrors.quantity ? ' InventoryForm-stepper--invalid' : ''}`}>
            <button
              type="button"
              className="InventoryForm-stepBtn"
              aria-label="Reducir cantidad"
              onClick={() => handleStep(-1)}
              disabled={isQtyValid && numVal <= 0}
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <input
              id="add-ingredient-qty"
              type="number"
              className="InventoryForm-qtyInput"
              min="0"
              step="1"
              value={quantity}
              onChange={handleQtyChange}
              {...getFieldAriaProps('add-ingredient-qty', { error: fieldErrors.quantity, isRequired: true })}
            />
            <button
              type="button"
              className="InventoryForm-stepBtn"
              aria-label="Aumentar cantidad"
              onClick={() => handleStep(1)}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>

        {/* Unidad como texto no editable */}
        <div className="InventoryForm-field InventoryForm-field--unit">
          <label>Unidad</label>
          <div className="InventoryForm-unitDisplay" title={unit || 'Sin unidad'}>
            {unit || '—'}
          </div>
        </div>

        {/* Botón de acción perfectamente nivelado */}
        <div className="InventoryForm-action">
          <button type="submit" className="InventoryForm-btn">
            <span className="material-symbols-outlined">add</span>
            Agregar
          </button>
        </div>
      </div>

      {/* Va debajo de la fila (y no dentro del stepper) para no desalinear el botón Agregar. */}
      <FieldError id={getFieldErrorId('add-ingredient-qty')} message={fieldErrors.quantity} />
    </form>
  );
}

export default AddIngredientForm;
