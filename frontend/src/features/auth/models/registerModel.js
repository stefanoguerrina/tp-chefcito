// Modelo del formulario de registro: estado inicial, validación campo por campo (las
// mismas reglas que aplica el backend en authValidationMiddleware.ts y userFieldRules.ts) y traducción de los
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

// Largos y formatos que exige el backend (los mismos de userFieldRules.ts): se repiten acá
// para avisar debajo del campo sin esperar la respuesta del servidor.
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 50;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 150;
export const PASSWORD_MIN_LENGTH = 6;
// bcrypt solo usa los primeros 72 caracteres de la contraseña.
export const PASSWORD_MAX_LENGTH = 72;

// Letras, números, punto, guion y guion bajo (sin espacios ni "@", que se confundiría con
// un email al iniciar sesión).
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

// Letras de cualquier idioma (con tildes y ñ), espacios, apóstrofo y guion; empieza con letra.
const NAME_PATTERN = /^\p{L}[\p{L} '-]*$/u;

// Formato básico de email (algo@algo.algo): el chequeo completo lo hace el backend.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Prefijo fijo de teléfono argentino: se muestra siempre junto al campo (no es un
// desplegable de país, Chefcito por ahora solo opera en Argentina).
export const PHONE_COUNTRY_PREFIX = "+54";

// Un número argentino tiene 10 dígitos con el código de área, u 11 con el 9 de los celulares.
const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 11;
// El backend guarda hasta 20 caracteres contando la característica ("+54 "): este es el
// máximo que se puede escribir en el campo.
export const PHONE_NUMBER_MAX_LENGTH = 20 - `${PHONE_COUNTRY_PREFIX} `.length;

// Antigüedad máxima de una fecha de nacimiento (la misma que ofrece DatePickerModal).
const BIRTH_DATE_MAX_YEARS_AGO = 110;

// Valida un nombre o un apellido (lo usan el registro y "Editar perfil").
// Recibe: el valor y los mensajes { empty, format } propios del campo.
// Devuelve: el mensaje de error, o "" si está bien.
export const getPersonNameError = (value, { empty, format }) => {
    const name = value.trim();
    if (!name) return empty;
    if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
        return `Debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.`;
    }
    if (!NAME_PATTERN.test(name)) return format;
    return "";
};

// Valida el teléfono, que es opcional: vacío está bien (lo usan el registro y "Editar perfil").
// Recibe: el número sin la característica (ej. "341 555-0101").
// Devuelve: el mensaje de error, o "" si está bien.
export const getPhoneError = (value) => {
    const phone = value.trim();
    if (!phone) return "";
    if (!/^[\d\s-]+$/.test(phone)) return "Usá solo números (podés separar con espacios o guiones).";
    const digitCount = phone.replace(/\D/g, "").length;
    if (digitCount < PHONE_MIN_DIGITS || digitCount > PHONE_MAX_DIGITS) {
        return `Ingresá el número con código de área: ${PHONE_MIN_DIGITS} u ${PHONE_MAX_DIGITS} dígitos (ej. 341 555-0101).`;
    }
    return "";
};

// Valida la fecha de nacimiento, que es opcional. Recibe: la fecha ISO ("YYYY-MM-DD") o "".
// Devuelve: el mensaje de error, o "" si está bien.
const getBirthDateError = (isoDate) => {
    if (!isoDate) return "";
    const birthDate = new Date(`${isoDate}T00:00:00`);
    const today = new Date();
    if (birthDate > today) return "La fecha de nacimiento no puede ser futura.";
    if (birthDate.getFullYear() < today.getFullYear() - BIRTH_DATE_MAX_YEARS_AGO) {
        return "Revisá el año de la fecha de nacimiento.";
    }
    return "";
};

// Valida el formulario antes de enviarlo.
// Recibe: form. Devuelve: { [campo]: mensaje } solo con los campos que tienen error
// (objeto vacío = todo bien). El teléfono y la fecha son opcionales: solo se revisan si
// el usuario los completó.
export const validateRegisterForm = (form) => {
    const errors = {};
    const userName = form.userName.trim();
    const email = form.email.trim();

    const formalNameError = getPersonNameError(form.formalName, {
        empty: "Ingresá tu nombre.",
        format: "El nombre solo puede tener letras."
    });
    if (formalNameError) errors.formalName = formalNameError;

    const surNameError = getPersonNameError(form.surName, {
        empty: "Ingresá tu apellido.",
        format: "El apellido solo puede tener letras."
    });
    if (surNameError) errors.surName = surNameError;

    if (!userName) {
        errors.userName = "Elegí un nombre de usuario.";
    } else if (userName.length < USERNAME_MIN_LENGTH || userName.length > USERNAME_MAX_LENGTH) {
        errors.userName = `Debe tener entre ${USERNAME_MIN_LENGTH} y ${USERNAME_MAX_LENGTH} caracteres.`;
    } else if (!USERNAME_PATTERN.test(userName)) {
        errors.userName = "Usá solo letras, números, puntos y guiones (sin espacios).";
    }

    if (!email) {
        errors.email = "Ingresá tu email.";
    } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = "Ingresá un email válido (ej. nombre@mail.com).";
    } else if (email.length > EMAIL_MAX_LENGTH) {
        errors.email = `No puede superar los ${EMAIL_MAX_LENGTH} caracteres.`;
    }

    if (!form.password) {
        errors.password = "Creá una contraseña.";
    } else if (form.password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `Usá al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
    } else if (form.password.length > PASSWORD_MAX_LENGTH) {
        errors.password = `No puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`;
    }

    const telephoneError = getPhoneError(form.telephone);
    if (telephoneError) errors.telephone = telephoneError;

    const birthDateError = getBirthDateError(form.birthDate);
    if (birthDateError) errors.birthDate = birthDateError;

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
