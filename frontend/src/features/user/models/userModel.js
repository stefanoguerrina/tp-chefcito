// Modelo de la feature User: mapea el usuario crudo que devuelve el backend al objeto que
// usa el frontend, y arma el formulario de "Editar perfil" y el de "Cambiar contraseña"
// (estado inicial, validación y body). Factory functions simples, sin JSX ni estado.
import {
  PHONE_COUNTRY_PREFIX, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, getPersonNameError, getPhoneError,
} from '../../auth/models/registerModel.js';

// Convierte un usuario crudo del backend al objeto que usa el frontend. El dueño del perfil
// y los admins reciben todos los datos; los demás, solo los públicos (sin email, teléfono
// ni fecha de nacimiento: quedan en null).
// Recibe: el usuario de GET/PATCH /api/users/:id (o de subir/quitar una foto).
// Devuelve: { id, username, name, lastName, email, phone, birthDate, avatarUrl, coverUrl,
// bio, specialty, location, createdAt }.
export const userFromApi = (user) => ({
  id: user.id,
  username: user.username,
  name: user.name,
  lastName: user.lastName,
  email: user.email ?? null,
  phone: user.phone ?? null,
  birthDate: user.birthDate ?? null,
  avatarUrl: user.avatarUrl ?? null,
  coverUrl: user.coverUrl ?? null,
  bio: user.bio ?? null,
  specialty: user.specialty ?? null,
  location: user.location ?? null,
  createdAt: user.createdAt ?? null,
});

// Iniciales para el avatar de respaldo (sin foto). Recibe: nombre y apellido.
// Devuelve: ej. "JP", o "?" si no hay ninguno.
export const getUserInitials = (name, lastName) =>
  `${name?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';

// Recibe: el teléfono guardado (ej. "+54 341 555-0101" o null). Devuelve solo la parte
// editable, sin la característica: el +54 va fijo en el campo y no se puede cambiar.
const stripCountryPrefix = (phone) => {
  const value = (phone ?? '').trim();
  return value.startsWith(PHONE_COUNTRY_PREFIX) ? value.slice(PHONE_COUNTRY_PREFIX.length).trim() : value;
};

// Estado inicial del formulario "Editar perfil" a partir del usuario actual.
// Recibe: user. Devuelve: { name, lastName, phone (sin el +54), bio, specialty, location }.
export const createProfileForm = (user) => ({
  name: user.name ?? '',
  lastName: user.lastName ?? '',
  phone: stripCountryPrefix(user.phone),
  bio: user.bio ?? '',
  specialty: user.specialty ?? '',
  location: user.location ?? '',
});

// Mismas reglas que el registro (y que el backend): nombre y apellido obligatorios y solo
// con letras; el teléfono es opcional, pero si se completa tiene que ser un número válido.
// Recibe: form. Devuelve: { [campo]: mensaje } solo con los campos con error.
export const validateProfileForm = (form) => {
  const errors = {};
  const nameError = getPersonNameError(form.name, {
    empty: 'Ingresá tu nombre.',
    format: 'El nombre solo puede tener letras.',
  });
  if (nameError) errors.name = nameError;

  const lastNameError = getPersonNameError(form.lastName, {
    empty: 'Ingresá tu apellido.',
    format: 'El apellido solo puede tener letras.',
  });
  if (lastNameError) errors.lastName = lastNameError;

  const phoneError = getPhoneError(form.phone);
  if (phoneError) errors.phone = phoneError;
  return errors;
};

// Body de PATCH /api/users/:id. Los opcionales vacíos van en null para que se borren.
// Recibe: form. Devuelve: el payload.
export const toProfilePayload = (form) => ({
  name: form.name.trim(),
  lastName: form.lastName.trim(),
  // Mismo formato que al registrarse (toRegisterPayload): "+54 <número>".
  phone: form.phone.trim() ? `${PHONE_COUNTRY_PREFIX} ${form.phone.trim()}` : null,
  bio: form.bio.trim() || null,
  specialty: form.specialty.trim() || null,
  location: form.location.trim() || null,
});

// Estado inicial del formulario "Cambiar contraseña".
export const createPasswordForm = () => ({ currentPassword: '', newPassword: '', confirmPassword: '' });

// Mismas reglas que valida el backend (validateChangePassword) más la confirmación, que
// solo existe en el formulario. Recibe: form. Devuelve: { [campo]: mensaje } con los errores.
export const validatePasswordForm = (form) => {
  const errors = {};
  if (!form.currentPassword) errors.currentPassword = 'Ingresá tu contraseña actual.';
  if (!form.newPassword) errors.newPassword = 'Ingresá la contraseña nueva.';
  else if (form.newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = `Usá al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  } else if (form.newPassword.length > PASSWORD_MAX_LENGTH) {
    errors.newPassword = `No puede superar los ${PASSWORD_MAX_LENGTH} caracteres.`;
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = 'Tiene que ser distinta de la actual.';
  }
  if (form.confirmPassword !== form.newPassword) errors.confirmPassword = 'Las contraseñas no coinciden.';
  return errors;
};
