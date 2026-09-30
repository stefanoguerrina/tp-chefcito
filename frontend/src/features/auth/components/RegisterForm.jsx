// Modal del formulario de registro de nuevo usuario. Cada campo tiene su label (con * si
// es obligatorio) y muestra su propio error debajo. Desde sm los campos van de a dos por
// fila (AuthModal-row), para que el modal entre en la pantalla sin scrollear. Al crear la cuenta, el mismo modal
// cambia a un mensaje de éxito con el botón para pasar al login.
import { useState } from "react";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { formatDateDisplay, PHONE_COUNTRY_PREFIX, PASSWORD_MIN_LENGTH } from "../models/registerModel";
import { getFieldAriaProps } from "../../../shared/utils/fieldAria.js";
import RequiredFieldsNote from "../../../core/components/RequiredFieldsNote.jsx";
import DatePickerModal from "../../../core/components/DatePickerModal.jsx";
import ArgentinaFlag from "../../../core/components/ArgentinaFlag.jsx";
import AuthModalLayout from "./AuthModalLayout.jsx";
import AuthField from "./AuthField.jsx";
import PasswordInput from "./PasswordInput.jsx";
import RegisterSuccess from "./RegisterSuccess.jsx";
import "../styles/_auth-modal.scss";

const TITLE_ID = "register-modal-title";
const PASSWORD_HINT = `Usá al menos ${PASSWORD_MIN_LENGTH} caracteres.`;

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

    // Estado puramente visual: si el modal de calendario está abierto.
    const [showDatePicker, setShowDatePicker] = useState(false);

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
                <RequiredFieldsNote />

                <div className="AuthModal-row">
                    <AuthField id="register-name" label="Nombre" isRequired error={fieldErrors.formalName}>
                        <input
                            className="AuthModal-input"
                            id="register-name"
                            type="text"
                            autoComplete="given-name"
                            value={form.formalName}
                            onChange={(event) => handleInputChange(event, "formalName")}
                            {...getFieldAriaProps("register-name", { error: fieldErrors.formalName, isRequired: true })}
                        />
                    </AuthField>
                    <AuthField id="register-lastname" label="Apellido" isRequired error={fieldErrors.surName}>
                        <input
                            className="AuthModal-input"
                            id="register-lastname"
                            type="text"
                            autoComplete="family-name"
                            value={form.surName}
                            onChange={(event) => handleInputChange(event, "surName")}
                            {...getFieldAriaProps("register-lastname", { error: fieldErrors.surName, isRequired: true })}
                        />
                    </AuthField>
                </div>

                <div className="AuthModal-row">
                    <AuthField id="register-username" label="Nombre de usuario" isRequired error={fieldErrors.userName}>
                        <input
                            className="AuthModal-input"
                            id="register-username"
                            type="text"
                            autoComplete="username"
                            value={form.userName}
                            onChange={(event) => handleInputChange(event, "userName")}
                            {...getFieldAriaProps("register-username", { error: fieldErrors.userName, isRequired: true })}
                        />
                    </AuthField>

                    <AuthField id="register-email" label="Email" isRequired error={fieldErrors.email}>
                        <input
                            className="AuthModal-input"
                            id="register-email"
                            type="email"
                            placeholder="nombre@mail.com"
                            autoComplete="email"
                            value={form.email}
                            onChange={(event) => handleInputChange(event, "email")}
                            {...getFieldAriaProps("register-email", { error: fieldErrors.email, isRequired: true })}
                        />
                    </AuthField>
                </div>

                <div className="AuthModal-row">
                    <AuthField id="register-phone" label="Teléfono" error={fieldErrors.telephone}>
                        <div className={`AuthModal-phoneWrapper${fieldErrors.telephone ? " AuthModal-phoneWrapper--invalid" : ""}`}>
                            <span className="AuthModal-phonePrefix">
                                <ArgentinaFlag className="AuthModal-phoneFlag" />
                                {PHONE_COUNTRY_PREFIX}
                            </span>
                            <input
                                className="AuthModal-input AuthModal-phoneInput"
                                id="register-phone"
                                type="tel"
                                autoComplete="tel-national"
                                value={form.telephone}
                                onChange={(event) => handleInputChange(event, "telephone")}
                                {...getFieldAriaProps("register-phone", { error: fieldErrors.telephone })}
                            />
                        </div>
                    </AuthField>

                    <AuthField id="register-birthdate" label="Fecha de nacimiento" error={fieldErrors.birthDate}>
                        <button
                            type="button"
                            className="AuthModal-dateButton"
                            id="register-birthdate"
                            onClick={() => setShowDatePicker(true)}
                            {...getFieldAriaProps("register-birthdate", { error: fieldErrors.birthDate })}
                        >
                            <span className={form.birthDate ? "" : "AuthModal-dateButton--placeholder"}>
                                {form.birthDate ? formatDateDisplay(form.birthDate) : "DD/MM/AAAA"}
                            </span>
                            <span className="material-symbols-outlined">calendar_month</span>
                        </button>
                    </AuthField>
                </div>

                <AuthField
                    id="register-password"
                    label="Contraseña"
                    isRequired
                    error={fieldErrors.password}
                    hint={PASSWORD_HINT}
                >
                    <PasswordInput
                        id="register-password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(event) => handleInputChange(event, "password")}
                        {...getFieldAriaProps("register-password", {
                            error: fieldErrors.password,
                            hint: PASSWORD_HINT,
                            isRequired: true
                        })}
                    />
                </AuthField>

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
                <p className="AuthModal-legal">
                    Al continuar, aceptás las <a href="#">Condiciones del servicio</a> de Chefcito y confirmás
                    que leíste nuestra <a href="#">Política de privacidad</a>.
                </p>
            </div>

            {showDatePicker && (
                <DatePickerModal
                    value={form.birthDate}
                    onSelect={handleDateChange}
                    onClose={() => setShowDatePicker(false)}
                />
            )}
        </AuthModalLayout>
    );
};

export default RegisterForm;
