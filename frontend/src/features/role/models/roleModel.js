// Datos fijos y funciones puras de la feature role, compartidos por sus componentes.

// Id del rol administrador: es el mismo ADMIN_ROLE_ID del backend (userModel.ts). Ese rol
// es parte del sistema (define quién entra al panel) y el backend no deja eliminarlo.
const ADMIN_ROLE_ID = 1;

// Cuántos usuarios tienen asignado un rol (el backend lo manda en _count.userrole).
// Recibe: un rol crudo. Devuelve: un número (0 si no vino el dato).
export const getRoleUsersCount = (role) => role._count?.userrole ?? 0;

// Pluraliza "usuario"/"usuarios". Recibe: un número. Devuelve: "1 usuario", "3 usuarios".
export const formatUsersCount = (count) => `${count} ${count === 1 ? 'usuario' : 'usuarios'}`;

// Motivo por el que un rol no se puede eliminar (se muestra como tooltip del botón), o
// null si se puede. Mismas reglas que valida el backend al borrar: el rol admin es parte
// del sistema, y un rol con usuarios asignados (activos o dados de baja) no se borra.
export const getDeleteBlockReason = (role) => {
  if (role.id === ADMIN_ROLE_ID) return 'El rol de administrador no se puede eliminar';
  const usersCount = getRoleUsersCount(role);
  if (usersCount > 0) return `No se puede eliminar: lo tienen ${formatUsersCount(usersCount)}`;
  return null;
};
