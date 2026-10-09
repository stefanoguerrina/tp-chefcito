// Modal de aviso: se muestra cuando un visitante sin cuenta intenta usar una función
// real de la app (ver una receta, guardarla, comentar, etc.) en vez de mandarlo
// directo a un formulario. Deja elegir entre iniciar sesión o registrarse.
import { useOverlayClose } from "../../../core/hooks/useOverlayClose.js";
import "../styles/_auth-modal.scss";

const AuthGateModal = ({ onClose, onLoginClick, onRegisterClick }) => {
    const overlayCloseProps = useOverlayClose(onClose);

    return (
        <div className="AuthModal-overlay" {...overlayCloseProps}>
            <div
                className="AuthModal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-gate-modal-title"
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
                    <h2 className="AuthModal-title" id="auth-gate-modal-title">Necesitás una cuenta</h2>
                    <p className="AuthModal-subtitle">
                        Iniciá sesión o registrate gratis para guardar recetas, reseñar y mucho más.
                    </p>
                </div>

                <div className="AuthModal-actions">
                    <button type="button" className="AuthModal-submit" onClick={onRegisterClick}>
                        Registrarse
                    </button>
                    <button type="button" className="AuthModal-outlineButton" onClick={onLoginClick}>
                        Iniciar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthGateModal;
