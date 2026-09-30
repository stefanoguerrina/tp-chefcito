// Aclaración que explica qué significa el asterisco rojo (RequiredMark) de los labels. No
// está siempre a la vista: aparece recién cuando se intentó enviar el formulario y quedaron
// campos marcados con error, y se va sola cuando se corrigen.
// Recibe: isVisible (si mostrarla; ej. hasFieldErrors(fieldErrors)) y className (opcional,
// para ajustar márgenes desde el formulario que la usa).
import './_form-feedback.scss';

function RequiredFieldsNote({ isVisible, className = '' }) {
  if (!isVisible) return null;

  return (
    <p className={`RequiredFieldsNote ${className}`.trim()} role="status">
      Los campos marcados con <span className="RequiredMark">*</span> son obligatorios.
    </p>
  );
}

export default RequiredFieldsNote;
