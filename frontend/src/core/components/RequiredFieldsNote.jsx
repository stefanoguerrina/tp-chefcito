// Aclaración que va arriba de un formulario con campos obligatorios: explica qué significa
// el asterisco rojo (RequiredMark) de los labels.
// Recibe: className (opcional, para ajustar márgenes desde el formulario que la usa).
import './_form-feedback.scss';

function RequiredFieldsNote({ className = '' }) {
  return (
    <p className={`RequiredFieldsNote ${className}`.trim()}>
      Los campos marcados con <span className="RequiredMark">*</span> son obligatorios.
    </p>
  );
}

export default RequiredFieldsNote;
