// Hook que gestiona el estado y la lógica del formulario de alta de una cuenta: valores,
// errores por campo (propios o devueltos por el backend) y el estado de "cuenta creada".
// Lo usan el registro (RegisterForm) y el alta desde el panel admin (AdminCreateUserModal):
// cambia solo a qué endpoint se manda el formulario.
import { useState } from "react";
import { formInitialState, validateRegisterForm, mapRegisterApiErrors } from "../models/registerModel";
import { registerService } from "../services/registerService";

// Recibe (opcional): { submitForm, onSuccess }.
//   submitForm(form): async, manda el formulario al backend (por defecto, el registro).
//   onSuccess(respuesta): se llama con lo que devolvió submitForm (ej. el usuario creado).
export const useRegisterForm = ({ submitForm = registerService, onSuccess } = {}) => {

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
            const response = await submitForm(form);
            setRegisteredUsername(form.userName.trim());
            onSuccess?.(response);
        } catch (error) {
            // Si el backend dijo qué campo falló (validación 422 o usuario/email ya en uso
            // 409), el error va debajo de ese campo; si no, como mensaje general.
            const apiErrors = mapRegisterApiErrors(error.fieldErrors ?? []);
            if (Object.keys(apiErrors).length > 0) {
                setFieldErrors(apiErrors);
            } else {
                setGeneralError(error.message || "No pudimos crear la cuenta. Intentá de nuevo.");
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
