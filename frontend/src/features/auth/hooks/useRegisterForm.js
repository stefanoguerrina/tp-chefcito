// Hook que gestiona el estado y la lógica del formulario de registro: valores, errores
// por campo (propios o devueltos por el backend) y el estado de "cuenta creada".
import { useState } from "react";
import { formInitialState, validateRegisterForm, mapRegisterApiErrors } from "../models/registerModel";
import { registerService } from "../services/registerService";

export const useRegisterForm = () => {

    const [form, setForm] = useState(formInitialState);
    // Errores de cada campo ({ userName: "...", email: "..." }): se muestran debajo del input.
    const [fieldErrors, setFieldErrors] = useState({});
    // Error que no es de un campo puntual (ej. servidor caído o sin conexión).
    const [generalError, setGeneralError] = useState("");
    // Evita doble submit mientras se espera la respuesta del servidor.
    const [isLoading, setIsLoading] = useState(false);
    // Usuario recién creado (null = todavía no se registró): con esto el modal cambia el
    // formulario por el mensaje de éxito, y el login puede arrancar con el usuario cargado.
    const [registeredUsername, setRegisteredUsername] = useState(null);

    // Al escribir en un campo se borra solo SU error (los demás siguen marcados hasta que
    // el usuario los corrija).
    const updateField = (attr, value) => {
        setFieldErrors((prevErrors) => ({ ...prevErrors, [attr]: undefined }));
        setGeneralError("");
        setForm((prevForm) => ({ ...prevForm, [attr]: value }));
    };

    const handleInputChange = (event, attr) => updateField(attr, event.target.value);

    // Igual que handleInputChange, pero para el DatePickerModal: no hay un evento de
    // input real, solo la fecha ISO ("YYYY-MM-DD") que el usuario eligió en el calendario.
    const handleDateChange = (isoDate) => updateField("birthDate", isoDate);

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Previene el doble submit si ya hay una petición en curso.
        if (isLoading) return;

        const errors = validateRegisterForm(form);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);
        try {
            await registerService(form);
            setRegisteredUsername(form.userName.trim());
        } catch (error) {
            // Si el backend dijo qué campo falló (validación 422 o usuario/email ya en uso
            // 409), el error va debajo de ese campo; si no, como mensaje general.
            const apiErrors = mapRegisterApiErrors(error.fieldErrors ?? []);
            if (Object.keys(apiErrors).length > 0) {
                setFieldErrors(apiErrors);
            } else {
                setGeneralError(error.message || "No pudimos crear tu cuenta. Intentá de nuevo.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form,
        isLoading,
        fieldErrors,
        generalError,
        registeredUsername,
        handleInputChange,
        handleDateChange,
        handleSubmit
    };
};
