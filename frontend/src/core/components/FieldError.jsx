// Mensaje de error que va debajo de un campo de formulario (ej. "Ingresá un nombre.").
// Si no hay mensaje no dibuja nada, así se puede dejar puesto siempre.
// Recibe: id (el que se pasa en aria-describedby del campo, ver fieldAria.js) y message.
import './_form-feedback.scss';

function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <p className="FieldError" id={id}>
      <span className="material-symbols-outlined" aria-hidden="true">error</span>
      {message}
    </p>
  );
}

export default FieldError;
