// Hook del formulario de ingrediente del panel admin (IngredientFormModal): valores, errores
// por campo, paso actual (1 = datos, 2 = valores nutricionales), la foto elegida y el envío.
// Las reglas y el armado del body viven en ingredientFormModel.
import { useState } from 'react';
import { useImagePicker } from '../../../core/hooks/useImagePicker.js';
import { mapApiFieldErrors } from '../../../shared/utils/fieldAria.js';
import {
  NUTRIENT_OPTIONS,
  createIngredientForm,
  getDefaultServingAmount,
  validateIngredientDetails,
  validateIngredientNutrition,
  toIngredientPayload,
} from '../models/ingredientFormModel.js';

export const DETAILS_STEP = 1;
export const NUTRITION_STEP = 2;

// Campos del backend que se muestran debajo de un input del paso 1.
const API_FIELDS = { name: 'name', unitOfMeasure: 'unitOfMeasure', description: 'description', categoryIds: 'categoryIds' };

// Recibe: initialData (el ingrediente crudo a editar, o null para un alta) y onSubmit
// (async, recibe { data, imageFile, isImageRemoved }; el padre guarda y cierra el modal).
export const useIngredientForm = (initialData, onSubmit) => {
  const [form, setForm] = useState(() => createIngredientForm(initialData));
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [step, setStep] = useState(DETAILS_STEP);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const image = useImagePicker(initialData?.imagePath ?? null);

  // Cambia un campo y borra solo SU error (los demás siguen marcados hasta corregirlos).
  const updateField = (field, value) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setGeneralError('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Al cambiar la unidad, si todavía no se cargó ningún valor nutricional, la porción de
  // referencia pasa a la habitual para esa unidad (100 para g/ml, 1 para el resto).
  const handleUnitChange = (unit) => {
    updateField('unitOfMeasure', unit);
    if (form.nutrients.length === 0) {
      setForm((prev) => ({ ...prev, servingAmount: getDefaultServingAmount(unit) }));
    }
  };

  // Suma una fila con el primer nutriente de la lista que todavía no se usó.
  const handleAddNutrient = () => {
    const usedNames = form.nutrients.map((nutrient) => nutrient.name);
    const nextOption = NUTRIENT_OPTIONS.find((option) => !usedNames.includes(option.name));
    if (!nextOption) return;
    setFieldErrors((prev) => ({ ...prev, nutrients: undefined }));
    setForm((prev) => ({ ...prev, nutrients: [...prev.nutrients, { name: nextOption.name, value: '' }] }));
  };

  // Cambia el nombre o el valor de la fila index. Recibe: index, campo ('name' | 'value') y valor.
  const handleNutrientChange = (index, field, value) => {
    setFieldErrors((prev) => ({ ...prev, nutrients: { ...prev.nutrients, [index]: undefined } }));
    setForm((prev) => ({
      ...prev,
      nutrients: prev.nutrients.map((nutrient, i) => (i === index ? { ...nutrient, [field]: value } : nutrient)),
    }));
  };

  // Al sacar una fila se borran todos los errores de las filas: sus índices cambian.
  const handleRemoveNutrient = (index) => {
    setFieldErrors((prev) => ({ ...prev, nutrients: undefined }));
    setForm((prev) => ({ ...prev, nutrients: prev.nutrients.filter((_, i) => i !== index) }));
  };

  // Pasa al paso 2 solo si el paso 1 está completo; si no, marca los errores.
  const handleGoToNutrition = () => {
    const errors = validateIngredientDetails(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setStep(NUTRITION_STEP);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    // Si el paso 1 tiene errores (ej. el backend dijo que el nombre ya existe y no se
    // corrigió), se vuelve a ese paso para que se vean.
    const detailsErrors = validateIngredientDetails(form);
    if (Object.keys(detailsErrors).length > 0) {
      setFieldErrors(detailsErrors);
      setStep(DETAILS_STEP);
      return;
    }
    const nutritionErrors = validateIngredientNutrition(form);
    if (Object.keys(nutritionErrors).length > 0) {
      setFieldErrors(nutritionErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ data: toIngredientPayload(form), imageFile: image.file, isImageRemoved: image.isRemoved });
      // Sin setIsSubmitting(false) en el caso de éxito: el padre cierra el modal.
    } catch (err) {
      // Los errores de un campo del paso 1 (ej. nombre repetido) van debajo de ese campo.
      const apiErrors = mapApiFieldErrors(err.fieldErrors, API_FIELDS);
      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(apiErrors);
        setStep(DETAILS_STEP);
      } else {
        setGeneralError(err.message || 'No pudimos guardar el ingrediente. Intentá de nuevo.');
      }
      setIsSubmitting(false);
    }
  };

  return {
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
    handleBackToDetails: () => setStep(DETAILS_STEP),
    handleSubmit,
  };
};
