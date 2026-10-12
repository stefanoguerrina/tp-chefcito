// Paso 1 del formulario de ingrediente: arriba la foto a la izquierda y, a su derecha, el
// nombre y la unidad de medida (de una lista fija) uno debajo del otro; después las
// categorías y, al final, la descripción (va última porque puede ser el texto más largo).
import IngredientImageField from './IngredientImageField.jsx';
import IngredientCategoryPicker from './IngredientCategoryPicker.jsx';
import DropdownSelect from '../../../core/components/DropdownSelect.jsx';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldAriaProps, getFieldErrorId } from '../../../shared/utils/fieldAria.js';
import { getUnitOptions } from '../models/ingredientFormModel.js';

// Recibe: form, fieldErrors, image (useImagePicker), categories (catálogo completo),
// onFieldChange(campo, valor) y onUnitChange(unidad).
function IngredientDetailsStep({ form, fieldErrors, image, categories, onFieldChange, onUnitChange }) {
  return (
    <>
      <div className="IngredientFormModal-identity">
        <IngredientImageField image={image} name={form.name} />

        <div className="IngredientFormModal-identityFields">
          <div className="IngredientFormModal-field">
            <label className="IngredientFormModal-label" htmlFor="ingf-name">
              Nombre
              <RequiredMark />
            </label>
            <input
              id="ingf-name"
              type="text"
              className="IngredientFormModal-input"
              value={form.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              placeholder="Ej: Tomate"
              {...getFieldAriaProps('ingf-name', { error: fieldErrors.name, isRequired: true })}
            />
            <FieldError id={getFieldErrorId('ingf-name')} message={fieldErrors.name} />
          </div>

          <div className="IngredientFormModal-field">
            <label className="IngredientFormModal-label" htmlFor="ingf-unit">
              Unidad de medida
              <RequiredMark />
            </label>
            <DropdownSelect
              id="ingf-unit"
              value={form.unitOfMeasure}
              options={getUnitOptions(form.unitOfMeasure)}
              placeholder="Elegí una unidad"
              onChange={onUnitChange}
              {...getFieldAriaProps('ingf-unit', { error: fieldErrors.unitOfMeasure, isRequired: true })}
            />
            <FieldError id={getFieldErrorId('ingf-unit')} message={fieldErrors.unitOfMeasure} />
          </div>
        </div>
      </div>

      <IngredientCategoryPicker
        categories={categories}
        selectedIds={form.categoryIds}
        onChange={(ids) => onFieldChange('categoryIds', ids)}
        error={fieldErrors.categoryIds}
      />

      <div className="IngredientFormModal-field">
        <label className="IngredientFormModal-label" htmlFor="ingf-description">
          Descripción
        </label>
        <textarea
          id="ingf-description"
          className="IngredientFormModal-input IngredientFormModal-textarea"
          rows={3}
          maxLength={255}
          value={form.description}
          onChange={(event) => onFieldChange('description', event.target.value)}
          placeholder="Ej: Tomate perita, ideal para salsas."
          {...getFieldAriaProps('ingf-description', { error: fieldErrors.description })}
        />
        <FieldError id={getFieldErrorId('ingf-description')} message={fieldErrors.description} />
      </div>
    </>
  );
}

export default IngredientDetailsStep;
