// Sub-panel de valores nutricionales de un ingrediente. Se muestra dentro de
// IngredientFormModal al editar un ingrediente (columna aparte, ver ese componente).
// Permite listar, agregar, editar y eliminar valores nutricionales.
import { useState, useEffect } from 'react';
import {
  getNutritionalValuesByIngredient,
  createNutritionalValue,
  updateNutritionalValue,
  deleteNutritionalValue,
} from '../../nutritionalValue/services/nutritionalValueService.js';
import { fetchListOrEmpty } from '../../../shared/utils/apiFetch.js';
import ConfirmModal from '../../../core/components/ConfirmModal.jsx';
import AlertModal from '../../../core/components/AlertModal.jsx';
import ErrorState from '../../../core/components/ErrorState.jsx';
import '../styles/_nutritional-value-panel.scss';

// Formulario para crear o editar un valor nutricional.
// Recibe: initialData (null para crear, objeto para editar), onSubmit, onCancel.
function NutritionalValueForm({ initialData, onSubmit, onCancel }) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [servingAmount, setServingAmount] = useState(initialData?.servingAmount ?? '');
  const [servingUnit, setServingUnit] = useState(initialData?.servingUnit ?? '');
  const [value, setValue] = useState(initialData?.value ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        servingAmount: servingAmount !== '' ? Number(servingAmount) : undefined,
        servingUnit: servingUnit.trim() || undefined,
        value: value !== '' ? Number(value) : undefined,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="NutritionalValueForm" onSubmit={handleSubmit}>
      <div className="NutritionalValueForm-row">
        <div className="NutritionalValueForm-field">
          <label htmlFor="nvf-name">Nombre *</label>
          <input
            id="nvf-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ej: Proteínas"
          />
        </div>
        <div className="NutritionalValueForm-field">
          <label htmlFor="nvf-serving-amount">Porción</label>
          <input
            id="nvf-serving-amount"
            type="number"
            step="any"
            value={servingAmount}
            onChange={(e) => setServingAmount(e.target.value)}
            placeholder="Ej: 100"
          />
        </div>
        <div className="NutritionalValueForm-field">
          <label htmlFor="nvf-serving-unit">Unidad porción</label>
          <input
            id="nvf-serving-unit"
            type="text"
            value={servingUnit}
            onChange={(e) => setServingUnit(e.target.value)}
            placeholder="Ej: g"
          />
        </div>
        <div className="NutritionalValueForm-field">
          <label htmlFor="nvf-value">Valor</label>
          <input
            id="nvf-value"
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ej: 26.5"
          />
        </div>
      </div>
      {error && <p className="NutritionalValueForm-error">⚠ {error}</p>}
      <div className="NutritionalValueForm-actions">
        <button type="submit" disabled={isSubmitting} className="NutritionalValueForm-submit">
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Agregar'}
        </button>
        <button type="button" onClick={onCancel} className="NutritionalValueForm-cancel">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// Panel principal de valores nutricionales.
// Recibe: idIngredient (número).
function NutritionalValuePanel({ idIngredient }) {
  const [values, setValues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // null = lista; 'create' = formulario nuevo; número = editando ese num
  const [formMode, setFormMode] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  const [actionError, setActionError] = useState('');
  // Valor nutricional que se pidió eliminar (se confirma en un modal) o null.
  const [valueToDelete, setValueToDelete] = useState(null);

  // Pide los valores del ingrediente (un 404 = todavía no tiene ninguno).
  // El estado se actualiza solo dentro de los callbacks de la promesa, así se puede
  // llamar desde el useEffect sin renders en cascada.
  const loadValues = () =>
    fetchListOrEmpty(() => getNutritionalValuesByIngredient(idIngredient))
      .then((data) => {
        setValues(data);
        setFetchError('');
      })
      .catch((err) => setFetchError(err.message))
      .finally(() => setIsLoading(false));

  // Reintento manual después de un error de carga.
  const handleRetry = () => {
    setIsLoading(true);
    loadValues();
  };

  useEffect(() => {
    loadValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idIngredient]);

  const handleCreate = async (data) => {
    await createNutritionalValue(idIngredient, data);
    setFormMode(null);
    await loadValues();
  };

  const handleEdit = (nv) => {
    setEditingValue(nv);
    setFormMode('edit');
  };

  const handleUpdate = async (data) => {
    await updateNutritionalValue(idIngredient, editingValue.num, data);
    setFormMode(null);
    setEditingValue(null);
    await loadValues();
  };

  // Elimina el valor confirmado en el modal. Si falla, se avisa en un modal.
  const handleConfirmDelete = async () => {
    const nv = valueToDelete;
    setValueToDelete(null);
    try {
      await deleteNutritionalValue(idIngredient, nv.num);
      await loadValues();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="NutritionalValuePanel">
      <h4 className="NutritionalValuePanel-title">Valores nutricionales</h4>

      {isLoading && <p className="NutritionalValuePanel-loading">Cargando...</p>}
      {fetchError && <ErrorState message={fetchError} onRetry={handleRetry} />}

      {!isLoading && !fetchError && values.length === 0 && (
        <p className="NutritionalValuePanel-empty">Sin valores nutricionales cargados.</p>
      )}

      {!isLoading && values.length > 0 && (
        <ul className="NutritionalValuePanel-list">
          {values.map((nv) => (
            <li key={nv.num} className="NutritionalValuePanel-item">
              <div className="NutritionalValuePanel-itemInfo">
                <strong>{nv.name}</strong>
                {nv.value != null && (
                  <span> — {nv.value} {nv.servingUnit ?? ''} / {nv.servingAmount} {nv.servingUnit ?? ''}</span>
                )}
              </div>
              <div className="NutritionalValuePanel-itemActions">
                <button
                  type="button"
                  className="NutritionalValuePanel-button"
                  onClick={() => handleEdit(nv)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="NutritionalValuePanel-button NutritionalValuePanel-button--danger"
                  onClick={() => setValueToDelete(nv)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {valueToDelete && (
        <ConfirmModal
          title="Eliminar valor nutricional"
          message={`¿Eliminar el valor nutricional "${valueToDelete.name}"?`}
          confirmLabel="Eliminar"
          danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setValueToDelete(null)}
        />
      )}

      {actionError && (
        <AlertModal
          title="No se pudo eliminar"
          message={actionError}
          onClose={() => setActionError('')}
        />
      )}

      {formMode === null && (
        <button
          type="button"
          className="NutritionalValuePanel-button NutritionalValuePanel-button--add"
          onClick={() => setFormMode('create')}
        >
          + Agregar valor nutricional
        </button>
      )}

      {formMode === 'create' && (
        <NutritionalValueForm
          initialData={null}
          onSubmit={handleCreate}
          onCancel={() => setFormMode(null)}
        />
      )}

      {formMode === 'edit' && editingValue && (
        <NutritionalValueForm
          initialData={editingValue}
          onSubmit={handleUpdate}
          onCancel={() => { setFormMode(null); setEditingValue(null); }}
        />
      )}
    </div>
  );
}

export default NutritionalValuePanel;
