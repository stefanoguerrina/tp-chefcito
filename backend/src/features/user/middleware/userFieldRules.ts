// Formatos y chequeos de los datos personales de un usuario (nombre, usuario, teléfono,
// fecha de nacimiento...). Los comparten las reglas del registro (authValidationMiddleware)
// y las de usuarios (userValidationMiddleware), para que los tres formularios validen igual.
// El frontend repite estas mismas reglas en features/auth/models/registerModel.js.

// Largos máximos: los de las columnas de la tabla user (ver prisma/schema.prisma).
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 50;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 150;
export const PHONE_MAX_LENGTH = 20;
export const PASSWORD_MIN_LENGTH = 6;
// bcrypt solo usa los primeros 72 caracteres: más largo daría una falsa sensación de seguridad.
export const PASSWORD_MAX_LENGTH = 72;

// Letras, números, punto, guion y guion bajo. Sin espacios ni "@": el login acepta usuario
// o email en el mismo campo y un "@" los volvería indistinguibles.
export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;
export const USERNAME_FORMAT_MESSAGE = 'El nombre de usuario solo puede tener letras, números, puntos y guiones (sin espacios).';

// Letras de cualquier idioma (con tildes y ñ), espacios, apóstrofo y guion ("María José",
// "O'Connor", "Pérez-García"). Tiene que empezar con una letra.
export const NAME_PATTERN = /^\p{L}[\p{L} '-]*$/u;

const PHONE_COUNTRY_PREFIX = '+54';
// Un número argentino tiene 10 dígitos con el código de área (341 555-0101), u 11 si se
// le antepone el 9 de los celulares.
const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 11;
export const PHONE_FORMAT_MESSAGE = 'El teléfono debe tener entre 10 y 11 dígitos, con el código de área (ej. 341 555-0101).';

// Recibe: el teléfono como llega del frontend (ej. "+54 341 555-0101").
// Devuelve: true si, sin la característica del país, solo tiene dígitos, espacios o guiones
// y la cantidad de dígitos es la de un número argentino.
export const isValidPhone = (value: string): boolean => {
  const phone = value.trim();
  const localNumber = phone.startsWith(PHONE_COUNTRY_PREFIX) ? phone.slice(PHONE_COUNTRY_PREFIX.length) : phone;
  if (!/^[\d\s-]+$/.test(localNumber)) return false;
  const digitCount = localNumber.replace(/\D/g, '').length;
  return digitCount >= PHONE_MIN_DIGITS && digitCount <= PHONE_MAX_DIGITS;
};

// Antigüedad máxima de una fecha de nacimiento (la misma que ofrece el calendario del frontend).
const BIRTH_DATE_MAX_YEARS_AGO = 110;
export const BIRTH_DATE_RANGE_MESSAGE = 'La fecha de nacimiento no puede ser futura ni de hace más de 110 años.';

// Recibe: la fecha en formato "YYYY-MM-DD". Devuelve: true si no es futura ni demasiado vieja.
export const isValidBirthDate = (value: string): boolean => {
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return false;
  const today = new Date();
  return birthDate <= today && birthDate.getFullYear() >= today.getFullYear() - BIRTH_DATE_MAX_YEARS_AGO;
};
