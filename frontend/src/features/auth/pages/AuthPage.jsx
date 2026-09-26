// Authentication page component managing login and register forms.
import { useAuth } from "../hooks/useAuth"
import { useAuthContext } from "../../../app/AuthContext.jsx";
import AlertModal from "../../../core/components/AlertModal.jsx";
import LandingPage from "../../landing/pages/LandingPage.jsx";
import LoginForm from "../components/LoginForm.jsx";
import RegisterForm from "../components/RegisterForm.jsx";
import AuthGateModal from "../components/AuthGateModal.jsx";


const AuthPage = () => {
    // Si la sesión se cerró sola (token vencido), se avisa antes de volver a pedir el login.
    const { sessionExpired, dismissSessionExpired } = useAuthContext();

    // Custom hook to manage authentication state (which form to show, submit handlers).
    const {
        showLoginForm,
        showRegisterForm,
        showAuthGate,
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
    } = useAuth();

    const handleCloseSessionExpired = () => {
        dismissSessionExpired();
        handleShowLoginForm();
    };

    return (
        <div className="App">

            <LandingPage
                onLoginClick={handleShowLoginForm}
                onRegisterClick={handleRegisterForm}
                onRequireAuth={handleShowAuthGate}
            />

            {sessionExpired && (
                <AlertModal
                    title="Tu sesión expiró"
                    message="Por seguridad, las sesiones duran 8 horas. Volvé a iniciar sesión para seguir."
                    closeLabel="Iniciar sesión"
                    onClose={handleCloseSessionExpired}
                />
            )}
            {showAuthGate && (
                <AuthGateModal
                    onClose={handleHideAuthGate}
                    onLoginClick={handleAuthGateLogin}
                    onRegisterClick={handleAuthGateRegister}
                />
            )}
            {showLoginForm && (
                <LoginForm
                    onClose={handleHideLoginForm}
                    onLoginSession={handleLoginSessionSubmit}
                    onSwitchToRegister={handleSwitchToRegister}
                />
            )}
            {showRegisterForm && (
                <RegisterForm
                    onClose={handleHideRegisterForm}
                    onRegisterSubmit={handleRegisterSubmit}
                    onSwitchToLogin={handleSwitchToLogin}
                />
            )}
        </div>
    )
}
export default AuthPage;
