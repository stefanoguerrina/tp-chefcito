// Modal del formulario de inicio de sesión. Cada campo tiene su label (con * porque los
// dos son obligatorios) y muestra su propio error debajo si se envía vacío.
import { useState } from "react";
import { useLoginForm } from "../hooks/useLoginForm";
import { getFieldAriaProps, hasFieldErrors } from "../../../shared/utils/fieldAria.js";
import RequiredFieldsNote from "../../../core/components/RequiredFieldsNote.jsx";
import AuthModalLayout from "./AuthModalLayout.jsx";
import AuthField from "./AuthField.jsx";
import PasswordInput from "./PasswordInput.jsx";
import ChefcitoLogo from "../../../core/components/ChefcitoLogo.jsx";
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
    // "current-password" apenas se montan, sin que el usuario haga nada). Se sacan cuando
    // el usuario toca el campo: ahí sí decide él y, si quiere, elige una credencial guardada.
    // Se sacan en onPointerDown (antes de que el campo tome el foco) y no en onFocus: en el
    // celular, un campo readOnly que recibe el foco no abre el teclado, y había que tocarlo
    // dos veces. onFocus queda para quien llega con Tab desde el teclado.
    const [autofillLocked, setAutofillLocked] = useState(true);
    const handleUnlockAutofill = () => setAutofillLocked(false);
    const unlockProps = {
        readOnly: autofillLocked,
        onPointerDown: handleUnlockAutofill,
        onFocus: handleUnlockAutofill
    };

    return (
        <AuthModalLayout titleId={TITLE_ID} onClose={onClose}>
            <div className="AuthModal-header">
                <ChefcitoLogo className="AuthModal-logo" />
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
                        {...unlockProps}
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
                        // Sin autoFocus aunque venga el usuario recién registrado: el foco
                        // automático sacaba el readOnly al instante y en el celular dejaba el
                        // campo enfocado pero sin teclado (no se abría ni al tocarlo).
                        {...unlockProps}
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
