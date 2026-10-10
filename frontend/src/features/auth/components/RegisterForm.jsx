// Modal del formulario de registro de nuevo usuario. Los campos (con su label, el * si son
// obligatorios y su propio error debajo) vienen de RegisterFields, que también usa el alta
// de usuarios del panel admin. Al crear la cuenta, el mismo modal cambia a un mensaje de
// éxito con el botón para pasar al login.
import { useRegisterForm } from "../hooks/useRegisterForm";
import RequiredFieldsNote from "../../../core/components/RequiredFieldsNote.jsx";
import { hasFieldErrors } from "../../../shared/utils/fieldAria.js";
import AuthModalLayout from "./AuthModalLayout.jsx";
import RegisterFields from "./RegisterFields.jsx";
import RegisterSuccess from "./RegisterSuccess.jsx";
import "../styles/_auth-modal.scss";

const TITLE_ID = "register-modal-title";

// Recibe: onClose, onGoToLogin(username) (después de registrarse: abre el login con ese
// usuario cargado) y onSwitchToLogin (link "¿Ya tenés una cuenta?").
const RegisterForm = ({ onClose, onGoToLogin, onSwitchToLogin }) => {
    const {
        form,
        isLoading,
        fieldErrors,
        generalError,
        registeredUsername,
        handleInputChange,
        handleDateChange,
        handleSubmit
    } = useRegisterForm();

    if (registeredUsername) {
        return (
            <AuthModalLayout titleId={TITLE_ID} onClose={onClose}>
                <RegisterSuccess
                    titleId={TITLE_ID}
                    username={registeredUsername}
                    onGoToLogin={() => onGoToLogin(registeredUsername)}
                />
            </AuthModalLayout>
        );
    }

    return (
        <AuthModalLayout titleId={TITLE_ID} onClose={onClose} isWide>
            <div className="AuthModal-header">
                <div className="AuthModal-icon">
                    <span className="material-symbols-outlined">restaurant_menu</span>
                </div>
                <h2 className="AuthModal-title" id={TITLE_ID}>Sumate a la cocina</h2>
                <p className="AuthModal-subtitle">Unite gratis a Chefcito para descubrir más recetas.</p>
            </div>

            {/* noValidate: los errores los muestra la app debajo de cada campo, no los
                globitos nativos del navegador. */}
            <form className="AuthModal-form" onSubmit={handleSubmit} noValidate>
                <RequiredFieldsNote isVisible={hasFieldErrors(fieldErrors)} />

                <RegisterFields
                    form={form}
                    fieldErrors={fieldErrors}
                    onInputChange={handleInputChange}
                    onDateChange={handleDateChange}
                />

                {generalError && <p className="AuthModal-error" role="alert">{generalError}</p>}

                <button type="submit" className="AuthModal-submit" disabled={isLoading}>
                    {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
            </form>

            <div className="AuthModal-footer">
                <p>
                    ¿Ya tenés una cuenta?{' '}
                    <button type="button" className="AuthModal-switchButton" onClick={onSwitchToLogin}>
                        Iniciar sesión
                    </button>
                </p>
            </div>
        </AuthModalLayout>
    );
};

export default RegisterForm;
