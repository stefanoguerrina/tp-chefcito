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

// El teléfono es opcional (así lo valida el backend: express-validator con
// `optional({ checkFalsy: true })` en authValidationMiddleware.ts), por eso queda
// afuera de este chequeo.
const requiredFields = ["userName", "formalName", "surName", "password", "email"];

export const checkEmptyFields = (form) => {
    return requiredFields.some((field) => form[field] === "");
};

// Prefijo fijo de teléfono argentino: se muestra siempre junto al campo (no es un
// desplegable de país, Chefcito por ahora solo opera en Argentina).
export const PHONE_COUNTRY_PREFIX = "+54";

// Convierte una fecha ISO ("YYYY-MM-DD", la que guarda el form y espera el backend)
// al formato DD/MM/AAAA que se muestra en el campo de fecha de nacimiento.
export const formatDateDisplay = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
};
