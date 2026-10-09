// Estructura común de los modales de login y registro: fondo oscuro (cierra al tocarlo),
// tarjeta y botón de cerrar arriba a la derecha. El contenido lo pone cada formulario.
import { useOverlayClose } from "../../../core/hooks/useOverlayClose.js";
import "../styles/_auth-modal.scss";

// Recibe: titleId (id del título del modal, para aria-labelledby), onClose, children e
// isWide (opcional: tarjeta más ancha desde md, para formularios con campos de a dos).
function AuthModalLayout({ titleId, onClose, children, isWide = false }) {
    const overlayCloseProps = useOverlayClose(onClose);

    return (
        <div className="AuthModal-overlay" {...overlayCloseProps}>
            <div
                className={`AuthModal-card${isWide ? " AuthModal-card--wide" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
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

                {children}
            </div>
        </div>
    );
}

export default AuthModalLayout;
