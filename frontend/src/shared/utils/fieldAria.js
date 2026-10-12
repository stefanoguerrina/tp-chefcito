// Atributos de accesibilidad de un campo de formulario, compartidos por todos los
// formularios de la app (junto con RequiredMark y FieldError de core/components).

// Id del mensaje de error de un campo: el que usa FieldError y el que apunta aria-describedby.
// Recibe: id del campo. Devuelve: "<id>-error".
export const getFieldErrorId = (fieldId) => `${fieldId}-error`;

// Recibe: id del campo y { error, hint, isRequired }. Devuelve los atributos aria para
// esparcir en el input: lo marcan como obligatorio o inválido (el borde rojo sale de
// aria-invalid, ver _form-feedback.scss) y lo vinculan con su mensaje de error (o de
// ayuda), que el lector de pantalla lee al enfocar el campo.
export const getFieldAriaProps = (fieldId, { error, hint, isRequired = false } = {}) => {
  let describedBy;
  if (error) describedBy = getFieldErrorId(fieldId);
  else if (hint) describedBy = `${fieldId}-hint`;

  return {
    'aria-required': isRequired || undefined,
    'aria-invalid': Boolean(error) || undefined,
    'aria-describedby': describedBy,
  };
};

// Indica si un objeto de errores por campo tiene algún error cargado (los campos ya
// corregidos quedan en '' o undefined). Revisa también los errores anidados, como los de
// cada fila de una lista ({ nutrients: { 0: 'Ingresá el valor.' } }).
// Recibe: el objeto de errores. Devuelve: true si hay al menos uno.
export const hasFieldErrors = (errors = {}) =>
  Object.values(errors).some((value) =>
    value && typeof value === 'object' ? hasFieldErrors(value) : Boolean(value)
  );

// Pasa los errores por campo que devuelve la API ([{ campo, mensaje }], ver ApiError) a un
// objeto { [campoDelForm]: mensaje }, para mostrarlos debajo de cada input.
// Recibe: fieldErrors y un mapa { campoDeLaApi: campoDelForm } (los campos que no están en
// el mapa se ignoran). Devuelve: el objeto de errores (vacío si ninguno aplica).
export const mapApiFieldErrors = (fieldErrors = [], apiToFormField = {}) => {
  const errors = {};
  fieldErrors.forEach(({ campo, mensaje }) => {
    const formField = apiToFormField[campo];
    if (formField && !errors[formField]) errors[formField] = mensaje;
  });
  return errors;
};
