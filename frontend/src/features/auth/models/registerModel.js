// Modelo del formulario de registro: estado inicial, validación campo por campo (las
// mismas reglas que aplica el backend en authValidationMiddleware.ts) y traducción de los
// errores por campo que devuelve la API a los nombres de este formulario.
import { mapApiFieldErrors } from "../../../shared/utils/fieldAria.js";

// Estado inicial del formulario de registro.
// telephone y birthDate son opcionales — no bloquean el envío si están vacíos.
export const formInitialState = {
    userName: "",
    formalName: "",
    surName: "",
    password: "",
    email: "",
    telephone: "",
    birthDate: ""
};

// Largos que exige el backend (ver validateRegister en el backend).
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 50;
export const PASSWORD_MIN_LENGTH = 6;

// Formato básico de email (algo@algo.algo): el chequeo completo lo hace el backend.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida el formulario antes de enviarlo.
// Recibe: form. Devuelve: { [campo]: mensaje } solo con los campos que tienen error
// (objeto vacío = todo bien). El teléfono y la fecha son opcionales: así los valida el
// backend (`optional({ checkFalsy: true })`), por eso no se chequean acá.
export const validateRegisterForm = (form) => {
    const errors = {};
    const userName = form.userName.trim();
    const email = form.email.trim();

    if (!form.formalName.trim()) errors.formalName = "Ingresá tu nombre.";
    if (!form.surName.trim()) errors.surName = "Ingresá tu apellido.";

    if (!userName) {
        errors.userName = "Elegí un nombre de usuario.";
    } else if (userName.length < USERNAME_MIN_LENGTH || userName.length > USERNAME_MAX_LENGTH) {
        errors.userName = `Debe tener entre ${USERNAME_MIN_LENGTH} y ${USERNAME_MAX_LENGTH} caracteres.`;
    }

    if (!email) {
        errors.email = "Ingresá tu email.";
    } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = "Ingresá un email válido (ej. nombre@mail.com).";
    }

    if (!form.password) {
        errors.password = "Creá una contraseña.";
    } else if (form.password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `Usá al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    }

    return errors;
};

// Nombre de cada campo en la API (lo que viene en `campo`) -> nombre en este formulario.
const API_FIELD_TO_FORM_FIELD = {
    username: "userName",
    name: "formalName",
    lastName: "surName",
    email: "email",
    password: "password",
    phone: "telephone",
    birthDate: "birthDate"
};

// Convierte los errores por campo de la API ([{ campo, mensaje }], ver ApiError) en el
// mismo formato que validateRegisterForm, para mostrarlos debajo de cada input.
// Recibe: fieldErrors. Devuelve: { [campoDelForm]: mensaje } (los campos que no son de
// este formulario se ignoran).
export const mapRegisterApiErrors = (fieldErrors) =>
    mapApiFieldErrors(fieldErrors, API_FIELD_TO_FORM_FIELD);

// Prefijo fijo de teléfono argentino: se muestra siempre junto al campo (no es un
// desplegable de país, Chefcito por ahora solo opera en Argentina).
export const PHONE_COUNTRY_PREFIX = "+54";

// Arma el body que espera el backend a partir del formulario (lo usan el registro y el
// alta de usuarios del panel admin, que piden los mismos datos).
// Recibe: form. Devuelve: { username, name, lastName, email, password, phone, birthDate }.
export const toRegisterPayload = (form) => ({
    username: form.userName.trim(),
    name: form.formalName.trim(),
    lastName: form.surName.trim(),
    email: form.email.trim(),
    password: form.password,
    // El campo solo guarda el número local; el prefijo de país se antepone acá.
    phone: form.telephone.trim() ? `${PHONE_COUNTRY_PREFIX} ${form.telephone.trim()}` : null,
    birthDate: form.birthDate || null
});

// Convierte una fecha ISO ("YYYY-MM-DD", la que guarda el form y espera el backend)
// al formato DD/MM/AAAA que se muestra en el campo de fecha de nacimiento.
export const formatDateDisplay = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
};
