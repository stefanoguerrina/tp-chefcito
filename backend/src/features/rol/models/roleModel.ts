// Tipos e interfaces de dominio para la feature Role (rol).
// Esta capa no tiene lógica: solo describe la forma de los datos.

// ID del rol administrador en la tabla `role` (coincide con user/models/userModel.ts).
export const ADMIN_ROLE_ID = 1;

// Nombre del rol que se asigna por defecto a todo usuario nuevo (ver authService.register).
// Se busca por nombre en vez de por ID fijo: así, en una BD nueva (de otro integrante que
// clona el repo) que todavía no tenga este rol cargado, roleService.ensureDefaultUserRole
// lo crea automáticamente en vez de romper el registro.
export const DEFAULT_USER_ROLE_NAME = 'Usuario';

// Datos necesarios para crear un nuevo rol.
export interface CreateRoleData {
  name: string;
  description?: string | null;
}

// Campos que se pueden modificar de un rol existente.
export interface UpdateRoleData {
  name?: string;
  description?: string | null;
}
