// Estado inicial y validación del formulario de inicio de sesión.

// Recibe: el email o usuario con el que arranca el campo (ej. el recién registrado).
// Devuelve: el estado inicial del formulario.
export const createLoginFormState = (initialIdentifier = "") => ({
    email: initialIdentifier,
    password: ""
});

// Valida el formulario antes de enviarlo.
// Recibe: form. Devuelve: { [campo]: mensaje } solo con los campos vacíos (objeto vacío =
// todo bien). Que las credenciales sean correctas lo decide el backend.
export const validateLoginForm = (form) => {
    const errors = {};
    if (!form.email.trim()) errors.email = "Ingresá tu email o nombre de usuario.";
    if (!form.password) errors.password = "Ingresá tu contraseña.";
    return errors;
};
