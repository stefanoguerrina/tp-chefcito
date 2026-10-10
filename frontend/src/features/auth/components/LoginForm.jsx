// Modal del formulario de inicio de sesión. Cada campo tiene su label (con * porque los
// dos son obligatorios) y muestra su propio error debajo si se envía vacío.
import { useState } from "react";
import { useLoginForm } from "../hooks/useLoginForm";
import { getFieldAriaProps, hasFieldErrors } from "../../../shared/utils/fieldAria.js";
import RequiredFieldsNote from "../../../core/components/RequiredFieldsNote.jsx";
import AuthModalLayout from "./AuthModalLayout.jsx";
import AuthField from "./AuthField.jsx";
import PasswordInput from "./PasswordInput.jsx";
import "../styles/_auth-modal.scss";

const TITLE_ID = "login-modal-title";

// Recibe: onClose, onLoginSession, onSwitchToRegister e initialIdentifier (opcional: el
// usuario recién registrado, para que solo le falte escribir la contraseña).
const LoginForm = ({ onClose, onLoginSession, onSwitchToRegister, initialIdentifier = "" }) => {
    const {
        form,
        isLoading,
        fieldErrors,
        loginError,
        handleInputChange,
        handleSubmit
    } = useLoginForm({ onClose, onLoginSession, initialIdentifier });

    // Los inputs arrancan como readOnly para que el navegador no los autocomplete solo
    // al abrir el modal (Chrome rellena de una los campos con autoComplete="username"/
    // "current-password" apenas se montan, sin que el usuario haga nada). Se sacan al
    // primer focus: ahí sí es el usuario quien decide tocar el campo y, si quiere, elegir
    // una credencial guardada del desplegable nativo del navegador.
    const [autofillLocked, setAutofillLocked] = useState(true);
    const handleUnlockAutofill = () => setAutofillLocked(false);

    return (
        <AuthModalLayout titleId={TITLE_ID} onClose={onClose}>
            <div className="AuthModal-header">
                <div className="AuthModal-icon">
                    <span className="material-symbols-outlined">restaurant_menu</span>
                </div>
                <h2 className="AuthModal-title" id={TITLE_ID}>¡Hola de nuevo!</h2>
                <p className="AuthModal-subtitle">Ingresá para seguir cocinando tu vida.</p>
            </div>

            {/* noValidate: los errores los muestra la app debajo de cada campo. */}
            <form className="AuthModal-form" onSubmit={handleSubmit} noValidate>
                <RequiredFieldsNote isVisible={hasFieldErrors(fieldErrors)} />

                <AuthField id="login-identifier" label="Email o nombre de usuario" isRequired error={fieldErrors.email}>
                    <input
                        className="AuthModal-input"
                        type="text"
                        id="login-identifier"
                        name="emailLogIn"
                        autoComplete="username"
                        readOnly={autofillLocked}
                        onFocus={handleUnlockAutofill}
                        value={form.email}
                        onChange={(event) => handleInputChange(event, "email")}
                        {...getFieldAriaProps("login-identifier", { error: fieldErrors.email, isRequired: true })}
                    />
                </AuthField>

                <AuthField id="login-password" label="Contraseña" isRequired error={fieldErrors.password}>
                    <PasswordInput
                        id="login-password"
                        name="passwordLogIn"
                        autoComplete="current-password"
                        readOnly={autofillLocked}
                        onFocus={handleUnlockAutofill}
                        // Si ya viene el usuario (recién registrado), el cursor arranca acá.
                        autoFocus={Boolean(initialIdentifier)}
                        value={form.password}
                        onChange={(event) => handleInputChange(event, "password")}
                        {...getFieldAriaProps("login-password", { error: fieldErrors.password, isRequired: true })}
                    />
                </AuthField>

                {loginError && <p className="AuthModal-error" role="alert">{loginError}</p>}

                <button type="submit" className="AuthModal-submit" disabled={isLoading}>
                    {isLoading ? "Ingresando..." : "Ingresar"}
                </button>
            </form>

            <div className="AuthModal-footer">
                <p>
                    ¿No tenés una cuenta?{' '}
                    <button type="button" className="AuthModal-switchButton" onClick={onSwitchToRegister}>
                        Registrate
                    </button>
                </p>
            </div>
        </AuthModalLayout>
    );
};

export default LoginForm;
