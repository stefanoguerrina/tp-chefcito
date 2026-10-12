// Contenido del modal de registro una vez creada la cuenta: confirma que salió bien y
// ofrece pasar al login sin cerrar el modal (el usuario ya queda cargado ahí).
import "../styles/_auth-modal.scss";

// Recibe: titleId (el mismo id de título del modal), username (el de la cuenta creada) y
// onGoToLogin (abre el login).
function RegisterSuccess({ titleId, username, onGoToLogin }) {
    return (
        // role="status": el lector de pantalla anuncia el mensaje apenas aparece.
        <div className="AuthModal-success" role="status">
            <div className="AuthModal-icon AuthModal-icon--success">
                <span className="material-symbols-outlined">check</span>
            </div>
            <h2 className="AuthModal-title" id={titleId}>¡Registro exitoso!</h2>
            <p className="AuthModal-subtitle">
                Tu cuenta <strong>@{username}</strong> ya está lista. Iniciá sesión para empezar a cocinar.
            </p>

            {/* autoFocus: el foco estaba en "Crear cuenta", que ya no existe; así con Enter se sigue. */}
            <button type="button" className="AuthModal-submit" onClick={onGoToLogin} autoFocus>
                Iniciar sesión
            </button>
        </div>
    );
}

export default RegisterSuccess;
