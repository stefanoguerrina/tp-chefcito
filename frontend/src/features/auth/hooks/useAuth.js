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
    // Indica si el último registro fue exitoso (para mostrar feedback al usuario).
    const [registerSucces, setRegisterSucces] = useState(false);
    // Controla la visibilidad del modal "necesitás una cuenta" (ver handleShowAuthGate).
    const [showAuthGate, setShowAuthGate] = useState(false);

    const handleShowLoginForm = () => setShowLoginForm(true);
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

    const handleHideRegisterForm = () => {
        setRegisterSucces(false);
        setShowRegisterForm(false);
    };

    // Tras un registro exitoso, oculta el form de registro y muestra el de login.
    const handleRegisterSubmit = () => {
        handleHideRegisterForm();
        setRegisterSucces(true);
        handleShowLoginForm();
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
        registerSucces,
        handleShowLoginForm,
        handleHideLoginForm,
        handleLoginSessionSubmit,
        handleRegisterForm,
        handleHideRegisterForm,
        handleRegisterSubmit,
        handleSwitchToRegister,
        handleSwitchToLogin,
        handleShowAuthGate,
        handleHideAuthGate,
        handleAuthGateLogin,
        handleAuthGateRegister
    };
};
