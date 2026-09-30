// Campo de los formularios de login y registro: label arriba (con un asterisco rojo si es
// obligatorio), el control que recibe como children y, debajo, el error del campo o, si no
// hay error, un texto de ayuda. El control se vincula con esos textos con getFieldAriaProps.
// El asterisco y el error son los mismos de toda la app (core/components).
import RequiredMark from "../../../core/components/RequiredMark.jsx";
import FieldError from "../../../core/components/FieldError.jsx";
import { getFieldErrorId } from "../../../shared/utils/fieldAria.js";
import "../styles/_auth-modal.scss";

// Recibe: id (el del input, para el htmlFor del label), label, isRequired, error (mensaje o
// vacío), hint (ayuda opcional) y children (el input, botón, etc.).
function AuthField({ id, label, isRequired = false, error, hint, children }) {
    return (
        <div className="AuthModal-field">
            <label className="AuthModal-label" htmlFor={id}>
                {label}
                {isRequired && <RequiredMark />}
            </label>

            {children}

            <FieldError id={getFieldErrorId(id)} message={error} />
            {!error && hint && (
                <p className="AuthModal-hint" id={`${id}-hint`}>{hint}</p>
            )}
        </div>
    );
}

export default AuthField;
