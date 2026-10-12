// Asterisco rojo que va al lado del label de un campo obligatorio. El lector de pantalla
// no lo lee: el campo ya se anuncia como obligatorio con aria-required (ver fieldAria.js).
import './_form-feedback.scss';

function RequiredMark() {
  return (
    <span className="RequiredMark" aria-hidden="true">
      {' '}*
    </span>
  );
}

export default RequiredMark;
