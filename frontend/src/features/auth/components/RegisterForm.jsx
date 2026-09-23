// Modal del formulario de registro de nuevo usuario.
import { useState } from "react";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { formatDateDisplay, PHONE_COUNTRY_PREFIX } from "../models/registerModel";
import DatePickerModal from "../../../core/components/DatePickerModal.jsx";
import "../styles/_auth-modal.scss";

const RegisterForm = ({ onClose, onRegisterSubmit, onSwitchToLogin }) => {
    const {
        form,
        isLoading,
        errorOfEmptyFields,
        errorOfRegister,
        handleInputChange,
        handleDateChange,
        handleSubmit
    } = useRegisterForm({ onClose, onRegisterSubmit });

    // Estado puramente visual: si la contraseña se muestra en texto plano o no.
    const [showPassword, setShowPassword] = useState(false);
    const handleToggleShowPassword = () => setShowPassword((prev) => !prev);

    // Estado puramente visual: si el modal de calendario está abierto.
    const [showDatePicker, setShowDatePicker] = useState(false);

    return (
        <div className="AuthModal-overlay" onClick={onClose}>
            <div
                className="AuthModal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="register-modal-title"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className="AuthModal-closeButton"
                    aria-label="Cerrar"
                    onClick={onClose}
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="AuthModal-header">
                    <div className="AuthModal-icon">
                        <span className="material-symbols-outlined">restaurant_menu</span>
                    </div>
                    <h2 className="AuthModal-title" id="register-modal-title">Sumate a la cocina</h2>
                    <p className="AuthModal-subtitle">Unite gratis a Chefcito para descubrir más recetas.</p>
                </div>

                <form className="AuthModal-form" onSubmit={handleSubmit}>
                    <div className="AuthModal-row">
                        <div className="AuthModal-field">
                            <input
                                className="AuthModal-input"
                                type="text"
                                placeholder="Nombre"
                                autoComplete="given-name"
                                value={form.formalName}
                                onChange={(event) => handleInputChange(event, "formalName")}
                            />
                        </div>
                        <div className="AuthModal-field">
                            <input
                                className="AuthModal-input"
                                type="text"
                                placeholder="Apellido"
                                autoComplete="family-name"
                                value={form.surName}
                                onChange={(event) => handleInputChange(event, "surName")}
                            />
                        </div>
                    </div>

                    <input
                        className="AuthModal-input"
                        type="text"
                        placeholder="Nombre de usuario"
                        autoComplete="username"
                        value={form.userName}
                        onChange={(event) => handleInputChange(event, "userName")}
                    />

                    <input
                        className="AuthModal-input"
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(event) => handleInputChange(event, "email")}
                    />

                    <div className="AuthModal-phoneWrapper">
                        <span className="AuthModal-phonePrefix">
                            <svg className="AuthModal-phoneFlag" viewBox="0 0 3 2" aria-hidden="true">
                                <rect width="3" height="2" fill="#fff" />
                                <rect width="3" height="0.667" fill="#74acdf" />
                                <rect width="3" height="0.667" y="1.333" fill="#74acdf" />
                                <circle cx="1.5" cy="1" r="0.28" fill="#f6b40e" />
                            </svg>
                            {PHONE_COUNTRY_PREFIX}
                        </span>
                        <input
                            className="AuthModal-input AuthModal-phoneInput"
                            type="tel"
                            placeholder="Teléfono (opcional)"
                            autoComplete="tel-national"
                            value={form.telephone}
                            onChange={(event) => handleInputChange(event, "telephone")}
                        />
                    </div>

                    <button
                        type="button"
                        className="AuthModal-dateButton"
                        onClick={() => setShowDatePicker(true)}
                    >
                        <span className={form.birthDate ? "" : "AuthModal-dateButton--placeholder"}>
                            {form.birthDate ? formatDateDisplay(form.birthDate) : "Fecha de nacimiento (DD/MM/AAAA)"}
                        </span>
                        <span className="material-symbols-outlined">calendar_month</span>
                    </button>

                    <div>
                        <div className="AuthModal-passwordWrapper">
                            <input
                                className="AuthModal-input"
                                type={showPassword ? "text" : "password"}
                                placeholder="Creá una contraseña"
                                autoComplete="new-password"
                                value={form.password}
                                onChange={(event) => handleInputChange(event, "password")}
                            />
                            <button
                                type="button"
                                className="AuthModal-toggleVisibility"
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                onClick={handleToggleShowPassword}
                            >
                                <span className="material-symbols-outlined">
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                            </button>
                        </div>
                        <p className="AuthModal-hint">Usá al menos 6 caracteres.</p>
                    </div>

                    {errorOfEmptyFields && (
                        <p className="AuthModal-error">Por favor, completá todos los campos requeridos.</p>
                    )}

                    {errorOfRegister && (
                        <p className="AuthModal-error">{errorOfRegister}</p>
                    )}

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
            </div>

            {showDatePicker && (
                <DatePickerModal
                    value={form.birthDate}
                    onSelect={handleDateChange}
                    onClose={() => setShowDatePicker(false)}
                />
            )}
        </div>
    );
};

export default RegisterForm;
