// Datos básicos de la receta, a todo el ancho del editor: título y descripción. Las
// categorías tienen su propia sección (ver RecipeCategoryPicker, mismo patrón que
// RecipeIngredientsStage). El tiempo de preparación y la dificultad no se cargan más
// acá: el tiempo se calcula solo sumando los pasos (ver RecipeStepsEditorStage) y la
// dificultad se sacó del editor.
import { RECIPE_NAME_MAX_LENGTH, RECIPE_DESCRIPTION_MAX_LENGTH } from '../models/recipeModel.js';
import RequiredMark from '../../../core/components/RequiredMark.jsx';
import FieldError from '../../../core/components/FieldError.jsx';
import { getFieldAriaProps, getFieldErrorId } from '../../../shared/utils/fieldAria.js';
import '../styles/_recipe-basic-info-section.scss';

// Recibe: values (draft: name, description), onFieldChange(campo, valor) y nameError
// (mensaje si se intentó publicar sin título; vacío si no).
function RecipeBasicInfoSection({ values, onFieldChange, nameError }) {
  return (
    <section className="RecipeEditorCard RecipeBasicInfoSection">
      <div className="RecipeBasicInfoSection-field">
        <label className="RecipeBasicInfoSection-label--large" htmlFor="recf-name">
          Título
          <RequiredMark />
        </label>
        <input
          id="recf-name"
          type="text"
          value={values.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
          placeholder="Ej: Milanesa a la Napolitana"
          maxLength={RECIPE_NAME_MAX_LENGTH}
          {...getFieldAriaProps('recf-name', { error: nameError, isRequired: true })}
        />
        <FieldError id={getFieldErrorId('recf-name')} message={nameError} />
        <span className="RecipeBasicInfoSection-charCount">
          {values.name.length} / {RECIPE_NAME_MAX_LENGTH} caracteres
        </span>
      </div>

      <div className="RecipeBasicInfoSection-field RecipeBasicInfoSection-field--grow">
        <label className="RecipeBasicInfoSection-label--large" htmlFor="recf-description">Descripción</label>
        <textarea
          id="recf-description"
          value={values.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Contá brevemente de qué se trata este plato"
          rows={3}
          maxLength={RECIPE_DESCRIPTION_MAX_LENGTH}
        />
        <span className="RecipeBasicInfoSection-charCount">
          {values.description.length} / {RECIPE_DESCRIPTION_MAX_LENGTH} caracteres
        </span>
      </div>
    </section>
  );
}

export default RecipeBasicInfoSection;
