// Modal del formulario de inicio de sesión.
import { useState } from "react";
import { useLoginForm } from "../hooks/useLoginForm";
import "../styles/_auth-modal.scss";

const LoginForm = ({ onClose, onLoginSession, onSwitchToRegister }) => {
    const {
        form,
        errorOfEmptyFields,
        errorOfData,
        handleInputChange,
        handleSubmit
    } = useLoginForm({ onClose, onLoginSession });

    // Estado puramente visual: si la contraseña se muestra en texto plano o no.
    const [showPassword, setShowPassword] = useState(false);
    const handleToggleShowPassword = () => setShowPassword((prev) => !prev);

    return (
        <div className="AuthModal-overlay" onClick={onClose}>
            <div
                className="AuthModal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-modal-title"
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
                    <h2 className="AuthModal-title" id="login-modal-title">¡Hola de nuevo!</h2>
                    <p className="AuthModal-subtitle">Ingresá para seguir cocinando tu vida.</p>
                </div>

                <form className="AuthModal-form" onSubmit={handleSubmit}>
                    <input
                        className="AuthModal-input"
                        type="text"
                        id="emailLogIn"
                        name="emailLogIn"
                        placeholder="Email o usuario"
                        autoComplete="username"
                        value={form.email}
                        onChange={(event) => handleInputChange(event, "email")}
                    />

                    <div className="AuthModal-passwordWrapper">
                        <input
                            className="AuthModal-input"
                            placeholder="Contraseña"
                            type={showPassword ? "text" : "password"}
                            id="passwordLogIn"
                            name="passwordLogIn"
                            autoComplete="current-password"
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

                    {errorOfEmptyFields && (
                        <p className="AuthModal-error">Debés completar todos los campos.</p>
                    )}

                    {errorOfData && (
                        <p className="AuthModal-error">
                            {typeof errorOfData === 'string' ? errorOfData : 'Email o contraseña incorrectos.'}
                        </p>
                    )}

                    <button type="submit" className="AuthModal-submit">Ingresar</button>
                </form>

                <div className="AuthModal-footer">
                    <p>
                        ¿No tenés una cuenta?{' '}
                        <button type="button" className="AuthModal-switchButton" onClick={onSwitchToRegister}>
                            Registrate
                        </button>
                    </p>
                    <p className="AuthModal-legal">
                        Al continuar, aceptás las <a href="#">Condiciones del servicio</a> de Chefcito y confirmás
                        que leíste nuestra <a href="#">Política de privacidad</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
