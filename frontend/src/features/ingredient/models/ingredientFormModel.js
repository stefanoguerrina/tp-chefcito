// Modelo del formulario de ingrediente del panel admin (IngredientFormModal): las opciones
// fijas de unidad y de nutrientes, el estado inicial (vacío o a partir de un ingrediente),
// la validación de cada paso y el body que se manda al backend. Sin JSX ni estado.

// Unidades de medida que se pueden elegir. Son una lista fija para que todos los
// ingredientes usen la misma abreviatura para lo mismo (y no "g" en uno y "gr" en otro):
// value es lo que se guarda en la BD y se muestra junto a las cantidades.
export const UNIT_OPTIONS = [
  { value: 'ud.', label: 'Unidad (ud.)' },
  { value: 'gr', label: 'Gramos (gr)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'cda.', label: 'Cucharada (cda.)' },
  { value: 'cdta.', label: 'Cucharadita (cdta.)' },
  { value: 'taza', label: 'Taza' },
  { value: 'pizca', label: 'Pizca' },
  { value: 'diente', label: 'Diente (ej. ajo)' },
  { value: 'feta', label: 'Feta' },
  { value: 'hoja', label: 'Hoja' },
  { value: 'atado', label: 'Atado' },
  { value: 'lata', label: 'Lata' },
  { value: 'paquete', label: 'Paquete' },
  { value: 'oz', label: 'Onzas (oz)' },
  { value: 'lb', label: 'Libras (lb)' },
];

// Nutrientes que se pueden cargar, los de una tabla nutricional estándar. name es lo que se
// guarda en la BD (nutritionalvalue.name) y valueUnit la unidad en la que se expresa el valor.
export const NUTRIENT_OPTIONS = [
  { name: 'Calorías', valueUnit: 'kcal' },
  { name: 'Proteínas', valueUnit: 'gr' },
  { name: 'Carbohidratos', valueUnit: 'gr' },
  { name: 'Azúcares', valueUnit: 'gr' },
  { name: 'Grasas totales', valueUnit: 'gr' },
  { name: 'Grasas saturadas', valueUnit: 'gr' },
  { name: 'Grasas trans', valueUnit: 'gr' },
  { name: 'Fibra', valueUnit: 'gr' },
  { name: 'Sodio', valueUnit: 'mg' },
  { name: 'Colesterol', valueUnit: 'mg' },
  { name: 'Calcio', valueUnit: 'mg' },
  { name: 'Hierro', valueUnit: 'mg' },
  { name: 'Potasio', valueUnit: 'mg' },
  { name: 'Vitamina C', valueUnit: 'mg' },
];

// Largos máximos que acepta el backend (ver ingredientValidationMiddleware).
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 255;

// Unidad en la que se expresa un nutriente (kcal, g, mg), o '' si es uno cargado a mano
// que no está en la lista. Recibe: el nombre del nutriente.
export const getNutrientUnit = (name) =>
  NUTRIENT_OPTIONS.find((option) => option.name === name)?.valueUnit ?? '';

// Opciones del selector de unidad. Si el ingrediente ya tenía una unidad que no está en la
// lista (cargado antes de que existiera el selector), se suma para no perderla al editar.
// Recibe: la unidad actual. Devuelve: [{ value, label }].
export const getUnitOptions = (currentUnit) => {
  if (!currentUnit || UNIT_OPTIONS.some((option) => option.value === currentUnit)) return UNIT_OPTIONS;
  return [...UNIT_OPTIONS, { value: currentUnit, label: `${currentUnit} (unidad anterior)` }];
};

// Porción de referencia que se propone para los valores nutricionales según la unidad del
// ingrediente: lo habitual es informarlos "cada 100 gr" o "cada 100 ml"; para el resto
// (unidades, cucharadas, kilos...) se propone 1.
export const getDefaultServingAmount = (unit) => (unit === 'gr' || unit === 'ml' ? '100' : '1');

// Estado inicial del formulario: vacío para un alta, o precargado con un ingrediente
// crudo del backend (con ingredientcategoryingredient[] y nutritionalvalue[]).
// Recibe: el ingrediente o null. Devuelve: el form.
export const createIngredientForm = (ingredient) => {
  const nutritionalValues = ingredient?.nutritionalvalue ?? [];
  const unitOfMeasure = ingredient?.unitOfMeasure ?? '';
  return {
    name: ingredient?.name ?? '',
    unitOfMeasure,
    description: ingredient?.description ?? '',
    categoryIds: (ingredient?.ingredientcategoryingredient ?? []).map((link) => link.idIngredientCategory),
    // La porción es la misma para todos los valores (así se lee una tabla nutricional):
    // se toma la del primero guardado, o la que corresponda a la unidad.
    servingAmount:
      nutritionalValues[0]?.servingAmount != null
        ? String(Number(nutritionalValues[0].servingAmount))
        : getDefaultServingAmount(unitOfMeasure),
    nutrients: nutritionalValues.map((item) => ({
      name: item.name,
      value: item.value != null ? String(Number(item.value)) : '',
    })),
  };
};

// Valida el paso 1 (datos del ingrediente). Recibe: form.
// Devuelve: { [campo]: mensaje } solo con los campos con error (vacío = todo bien).
export const validateIngredientDetails = (form) => {
  const errors = {};
  const name = form.name.trim();
  if (!name) errors.name = 'Ingresá un nombre.';
  else if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    errors.name = `Debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.`;
  }
  if (!form.unitOfMeasure) errors.unitOfMeasure = 'Elegí una unidad de medida.';
  if (form.categoryIds.length === 0) errors.categoryIds = 'Agregá al menos una categoría.';
  if (form.description.trim().length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Usá como máximo ${DESCRIPTION_MAX_LENGTH} caracteres.`;
  }
  return errors;
};

// Valida el paso 2 (valores nutricionales, todos opcionales). Si se cargó alguno, la
// porción tiene que ser mayor a 0 y cada valor un número mayor o igual a 0.
// Recibe: form. Devuelve: { servingAmount?, nutrients?: { [índice]: mensaje } }.
export const validateIngredientNutrition = (form) => {
  const errors = {};
  if (form.nutrients.length === 0) return errors;

  if (!(Number(form.servingAmount) > 0)) errors.servingAmount = 'Ingresá una porción mayor a 0.';

  const nutrientErrors = {};
  form.nutrients.forEach((nutrient, index) => {
    if (nutrient.value === '') nutrientErrors[index] = 'Ingresá el valor.';
    else if (!(Number(nutrient.value) >= 0)) nutrientErrors[index] = 'Tiene que ser 0 o más.';
  });
  if (Object.keys(nutrientErrors).length > 0) errors.nutrients = nutrientErrors;
  return errors;
};

// Arma el body de POST/PATCH /api/ingredients. La unidad de la porción de cada valor
// nutricional es siempre la del ingrediente (no se elige aparte): "Calorías: 18 kcal
// cada 100 gr" si el tomate se mide en gr. Recibe: form. Devuelve: el payload.
export const toIngredientPayload = (form) => ({
  name: form.name.trim(),
  unitOfMeasure: form.unitOfMeasure,
  description: form.description.trim() || null,
  categoryIds: form.categoryIds,
  nutritionalValues: form.nutrients.map((nutrient) => ({
    name: nutrient.name,
    value: Number(nutrient.value),
    servingAmount: Number(form.servingAmount),
    servingUnit: form.unitOfMeasure,
  })),
});
