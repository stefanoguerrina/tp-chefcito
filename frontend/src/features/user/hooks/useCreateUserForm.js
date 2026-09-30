// Hook que gestiona el estado y la lógica del formulario de alta de usuario por admin.
import { useState } from 'react';
import { createUserService } from '../services/createUserService.js';
import { mapApiFieldErrors } from '../../../shared/utils/fieldAria.js';

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

// Formato básico de email: el chequeo completo lo hace el backend.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Los campos de este formulario se llaman igual que en la API (para mapApiFieldErrors).
const API_FIELDS = { username: 'username', password: 'password', name: 'name', lastName: 'lastName', email: 'email', phone: 'phone', birthDate: 'birthDate' };

// Valida el alta con las mismas reglas que el backend (y que el registro).
// Recibe: form. Devuelve: { [campo]: mensaje } solo con los campos con error.
const validateCreateUserForm = (form) => {
    const errors = {};
    const username = form.username.trim();
    if (!username) errors.username = 'Ingresá un nombre de usuario.';
    else if (username.length < 3 || username.length > 50) errors.username = 'Debe tener entre 3 y 50 caracteres.';
    if (!form.password) errors.password = 'Ingresá una contraseña.';
    else if (form.password.length < 6) errors.password = 'Usá al menos 6 caracteres.';
    if (!form.name.trim()) errors.name = 'Ingresá el nombre.';
    if (!form.lastName.trim()) errors.lastName = 'Ingresá el apellido.';
    if (!form.email.trim()) errors.email = 'Ingresá el email.';
    else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Ingresá un email válido.';
    return errors;
};

export const useCreateUserForm = ({ onUserCreated }) => {
    const [form, setForm] = useState(INITIAL_FORM);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    // Errores de cada campo ({ username: '...', email: '...' }), debajo de cada input.
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState('');

    const handleInputChange = (event, field) => {
        setError('');
        setSuccess('');
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
        const value = event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        const errors = validateCreateUserForm(form);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
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
            // Si el backend señaló campos (validación o usuario/email repetido), van debajo de
            // cada uno; si no, como mensaje general.
            const apiErrors = mapApiFieldErrors(err.fieldErrors, API_FIELDS);
            if (Object.keys(apiErrors).length > 0) setFieldErrors(apiErrors);
            else setError(err.message || 'Error al crear el usuario. Intentá de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form,
        isLoading,
        error,
        fieldErrors,
        success,
        handleInputChange,
        handleSubmit
    };
};
