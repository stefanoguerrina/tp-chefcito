// Hook que gestiona el estado y la lógica del formulario de inicio de sesión.
import { useState } from "react";
import { createLoginFormState, validateLoginForm } from "../models/loginModel";
import { loginService } from "../services/loginService";

// Recibe: onClose, onLoginSession (abre la sesión con la respuesta del backend) e
// initialIdentifier (email o usuario con el que arranca el campo, ej. recién registrado).
export const useLoginForm = ({ onClose, onLoginSession, initialIdentifier }) => {

    const [form, setForm] = useState(() => createLoginFormState(initialIdentifier));
    // Errores de cada campo vacío ({ email: "...", password: "..." }), debajo del input.
    const [fieldErrors, setFieldErrors] = useState({});
    // Error del backend (ej. credenciales incorrectas). Va como mensaje general y no en un
    // campo: por seguridad no se dice si lo que está mal es el usuario o la contraseña.
    const [loginError, setLoginError] = useState("");
    // Evita doble submit mientras se espera la respuesta del servidor.
    const [isLoading, setIsLoading] = useState(false);

    // Al escribir en un campo se borra solo SU error.
    const handleInputChange = (event, attr) => {
        setFieldErrors((prevErrors) => ({ ...prevErrors, [attr]: undefined }));
        setLoginError("");
        setForm((prevForm) => ({ ...prevForm, [attr]: event.target.value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isLoading) return;

        const errors = validateLoginForm(form);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);
        try {
            const backendResponse = await loginService(form);
            onLoginSession(backendResponse);
            onClose();
        } catch (error) {
            setLoginError(error.message || "Email, usuario o contraseña incorrectos.");
        } finally {
            setIsLoading(false);
        }
    };

    return { form, isLoading, fieldErrors, loginError, handleInputChange, handleSubmit };
};
