// Hook personalizado que gestiona el estado de autenticación y la lógica de navegación
// entre el formulario de login y el de registro.
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../../app/AuthContext.jsx";
import { USER_HOME_PATH, ADMIN_HOME_PATH } from "../../../app/ProtectedRoute.jsx";

export const useAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuthContext();

    // Controla la visibilidad del formulario de login.
    const [showLoginForm, setShowLoginForm] = useState(false);
    // Controla la visibilidad del formulario de registro.
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    // Email o usuario con el que arranca el login (el recién registrado; vacío si no).
    const [loginIdentifier, setLoginIdentifier] = useState("");
    // Controla la visibilidad del modal "necesitás una cuenta" (ver handleShowAuthGate).
    const [showAuthGate, setShowAuthGate] = useState(false);

    // Abre el login vacío (desde la landing, el aviso de sesión vencida, etc.).
    const handleShowLoginForm = () => {
        setLoginIdentifier("");
        setShowLoginForm(true);
    };
    const handleHideLoginForm = () => setShowLoginForm(false);

    // Procesa la respuesta del backend tras un login exitoso: abre la sesión (AuthContext
    // guarda el token) y lleva al usuario a la página que quería ver antes de loguearse
    // (la guarda ProtectedRoute en location.state.from) o a su inicio según su rol.
    const handleLoginSessionSubmit = (backendResponse) => {
        const ok = login(backendResponse.token);
        if (!ok) return false;
        const defaultPath = backendResponse.isAdmin === true ? ADMIN_HOME_PATH : USER_HOME_PATH;
        navigate(location.state?.from ?? defaultPath, { replace: true });
        return true;
    };

    const handleRegisterForm = () => setShowRegisterForm(true);

    const handleHideRegisterForm = () => setShowRegisterForm(false);

    // Botón "Iniciar sesión" del mensaje de cuenta creada: cambia al login con el usuario
    // nuevo ya cargado, así solo le queda escribir la contraseña.
    // Recibe: username de la cuenta recién creada.
    const handleRegisteredGoToLogin = (username) => {
        handleHideRegisterForm();
        handleShowLoginForm();
        setLoginIdentifier(username);
    };

    // Cierra el modal de login y abre el de registro (link "¿No tenés cuenta? Registrate").
    const handleSwitchToRegister = () => {
        handleHideLoginForm();
        handleRegisterForm();
    };

    // Cierra el modal de registro y abre el de login (link "¿Ya tenés cuenta? Iniciar sesión").
    const handleSwitchToLogin = () => {
        handleHideRegisterForm();
        handleShowLoginForm();
    };

    // Muestra el modal "necesitás una cuenta" (se usa cuando un visitante sin loguear
    // intenta usar una función real de la app, ej. ver una receta o guardarla).
    const handleShowAuthGate = () => setShowAuthGate(true);
    const handleHideAuthGate = () => setShowAuthGate(false);

    // Desde el modal de aviso, ir directo a login o a registro.
    const handleAuthGateLogin = () => {
        handleHideAuthGate();
        handleShowLoginForm();
    };
    const handleAuthGateRegister = () => {
        handleHideAuthGate();
        handleRegisterForm();
    };

    return {
        showLoginForm,
        showRegisterForm,
        showAuthGate,
        loginIdentifier,
        handleShowLoginForm,
        handleHideLoginForm,
        handleLoginSessionSubmit,
        handleRegisterForm,
        handleHideRegisterForm,
        handleRegisteredGoToLogin,
        handleSwitchToRegister,
        handleSwitchToLogin,
        handleShowAuthGate,
        handleHideAuthGate,
        handleAuthGateLogin,
        handleAuthGateRegister
    };
};
