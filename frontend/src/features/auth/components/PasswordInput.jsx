// Input de contraseña con el botón del ojito para mostrarla u ocultarla. Lo comparten el
// login y el registro.
import { useState } from "react";
import "../styles/_auth-modal.scss";

// Recibe: id, value, onChange, placeholder, autoComplete y cualquier otro atributo del
// input (ej. los aria de getFieldAriaProps, readOnly u onFocus), que se le pasan tal cual.
function PasswordInput({ id, value, onChange, placeholder, autoComplete, ...inputProps }) {
    // Estado puramente visual: si la contraseña se muestra en texto plano o no.
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="AuthModal-passwordWrapper">
            <input
                {...inputProps}
                className="AuthModal-input"
                id={id}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                autoComplete={autoComplete}
                value={value}
                onChange={onChange}
            />
            <button
                type="button"
                className="AuthModal-toggleVisibility"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((prev) => !prev)}
            >
                <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                </span>
            </button>
        </div>
    );
}

export default PasswordInput;
