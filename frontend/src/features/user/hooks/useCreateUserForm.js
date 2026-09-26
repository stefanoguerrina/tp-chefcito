// Hook que gestiona el estado y la lógica del formulario de alta de usuario por admin.
import { useState } from 'react';
import { createUserService } from '../services/createUserService.js';

const INITIAL_FORM = {
    username: '',
    password: '',
    name: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    makeAdmin: false
};

// Campos requeridos para el alta de usuario.
const REQUIRED_FIELDS = ['username', 'password', 'name', 'lastName', 'email'];

export const useCreateUserForm = ({ onUserCreated }) => {
    const [form, setForm] = useState(INITIAL_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (event, field) => {
        setError('');
        setSuccess('');
        const value = event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        // Validación client-side básica: verifica que los campos requeridos no estén vacíos.
        const camposVacios = REQUIRED_FIELDS.filter((f) => !form[f].trim());
        if (camposVacios.length > 0) {
            setError('Por favor, completá todos los campos requeridos.');
            return;
        }

        setIsLoading(true);
        try {
            const newUser = await createUserService({
                username: form.username.trim(),
                password: form.password,
                name: form.name.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || null,
                birthDate: form.birthDate || null,
                makeAdmin: form.makeAdmin
            });

            setSuccess(`Usuario "@${newUser.username}" creado exitosamente.`);
            setForm(INITIAL_FORM);
            // Notifica al componente padre para que actualice la lista de usuarios.
            onUserCreated(newUser);
        } catch (err) {
            setError(err.message || 'Error al crear el usuario. Intentá de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form,
        isLoading,
        error,
        success,
        handleInputChange,
        handleSubmit
    };
};
