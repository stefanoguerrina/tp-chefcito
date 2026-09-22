// Tipos e interfaces de dominio para la feature User.
// Esta capa no tiene lógica: solo describe la forma de los datos.

// ID del rol administrador en la tabla `role`.
export const ADMIN_ROLE_ID = 1;

// Datos necesarios para crear un nuevo usuario.
export interface CreateUserData {
  username: string;
  password: string; // Ya hasheado con bcrypt — nunca llega texto plano acá.
  name: string;
  lastName: string;
  email: string;
  phone?: string | null;
  birthDate?: Date | null;
}

// Campos que el usuario puede modificar en su perfil.
export interface UpdateUserData {
  name?: string;
  lastName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  specialty?: string | null;
  location?: string | null;
  birthDate?: Date | null;
}

// Elimina la contraseña de un objeto usuario antes de enviarlo en una respuesta HTTP.
export function toPublic<T extends { password: string }>(user: T): Omit<T, 'password'> {
  const { password, ...publicData } = user;
  return publicData;
}
