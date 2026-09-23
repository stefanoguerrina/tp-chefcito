// Hook que gestiona el estado y la lógica del formulario de registro.
import { useState } from "react";
import { formInitialState, checkEmptyFields } from "../models/registerModel";
import { registerService } from "../services/registerService";

export const useRegisterForm = ({ onClose, onRegisterSubmit }) => {

    const [form, setForm] = useState(formInitialState);
    // true si el usuario intentó enviar el form con campos requeridos vacíos.
    const [errorOfEmptyFields, setErrorOfEmptyFields] = useState(false);
    // Mensaje de error devuelto por el backend (ej: usuario o email ya en uso).
    const [errorOfRegister, setErrorOfRegister] = useState("");
    // Evita doble submit mientras se espera la respuesta del servidor.
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (event, attr) => {
        setErrorOfEmptyFields(false);
        setErrorOfRegister("");
        setForm((prevForm) => ({ ...prevForm, [attr]: event.target.value }));
    };

    // Igual que handleInputChange, pero para el DatePickerModal: no hay un evento de
    // input real, solo la fecha ISO ("YYYY-MM-DD") que el usuario eligió en el calendario.
    const handleDateChange = (isoDate) => {
        setErrorOfEmptyFields(false);
        setErrorOfRegister("");
        setForm((prevForm) => ({ ...prevForm, birthDate: isoDate }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Previene el doble submit si ya hay una petición en curso.
        if (isLoading) return;

        if (checkEmptyFields(form)) {
            setErrorOfEmptyFields(true);
            return;
        }
        setErrorOfEmptyFields(false);

        setIsLoading(true);
        try {
            const backendResponse = await registerService(form);
            onRegisterSubmit(backendResponse);
            setForm(formInitialState);
            onClose();
        } catch (error) {
            // Muestra el mensaje de error del backend si está disponible.
            setErrorOfRegister(error.message || "Error al registrarse. Intentá de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    return { form, isLoading, errorOfEmptyFields, errorOfRegister, handleInputChange, handleDateChange, handleSubmit };
};
