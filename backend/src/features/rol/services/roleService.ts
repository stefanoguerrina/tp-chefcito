// Lógica de negocio de la feature role.
// Orquesta el repositorio, aplica reglas y transforma datos para el controller.
import { roleRepository } from '../repository/roleRepository.js';
import { userRepository } from '../../user/repository/userRepository.js';
import { toPublic } from '../../user/models/userModel.js';
import { ADMIN_ROLE_ID, DEFAULT_USER_ROLE_NAME, type CreateRoleData, type UpdateRoleData } from '../models/roleModel.js';

// Devuelve todos los roles.
export async function getAllRoles() {
  const roles = await roleRepository.findAll();
  if (roles.length === 0) return null;
  return roles;
}

// Busca un rol por ID. Devuelve null si no existe.
export async function getRoleById(id: number) {
  return roleRepository.findById(id);
}

// Crea un nuevo rol. Devuelve un objeto de resultado que indica éxito,
// o el motivo del fallo (nombre duplicado).
export async function createRole(
  data: CreateRoleData
): Promise<
  | { ok: true; role: Awaited<ReturnType<typeof roleRepository.create>> }
  | { ok: false; reason: 'duplicate_name' }
> {
  const existing = await roleRepository.findByName(data.name);
  if (existing) return { ok: false, reason: 'duplicate_name' };

  const role = await roleRepository.create(data);
  return { ok: true, role };
}

// Actualiza un rol existente. Devuelve null si no existe.
export async function updateRole(id: number, data: UpdateRoleData) {
  const existing = await roleRepository.findById(id);
  if (!existing) return null;
  return roleRepository.update(id, data);
}

// Elimina un rol. Devuelve un objeto de resultado: ok, not_found, is_admin_role
// (el rol admin es parte del sistema y no puede borrarse) o has_users (si todavía
// tiene usuarios asociados vía la tabla intermedia userrole).
export async function deleteRole(
  id: number
): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'is_admin_role' | 'has_users' }> {
  const existing = await roleRepository.findById(id);
  if (!existing) return { ok: false, reason: 'not_found' };

  if (id === ADMIN_ROLE_ID) return { ok: false, reason: 'is_admin_role' };

  const userCount = await roleRepository.countUsers(id);
  if (userCount > 0) return { ok: false, reason: 'has_users' };

  await roleRepository.delete(id);
  return { ok: true };
}

// Devuelve los usuarios (públicos, sin password) que tienen asignado un rol.
// Devuelve null si el rol no existe.
export async function getUsersByRole(roleId: number) {
  const role = await roleRepository.findById(roleId);
  if (!role) return null;

  const links = await roleRepository.findUsersByRole(roleId);
  return links.map((link) => toPublic(link.user));
}

// Devuelve los roles asignados a un usuario. Devuelve null si el usuario no existe.
export async function getRolesByUser(userId: number) {
  const user = await userRepository.findById(userId);
  if (!user) return null;

  const links = await roleRepository.findRolesByUser(userId);
  return links.map((link) => link.role);
}

// Asigna un rol a un usuario (maneja la tabla intermedia userrole).
// Verifica que ambos existan y que el vínculo no esté duplicado.
export async function assignRoleToUser(
  roleId: number,
  userId: number
): Promise<
  | { ok: true }
  | { ok: false; reason: 'role_not_found' | 'user_not_found' | 'already_assigned' }
> {
  const [role, user] = await Promise.all([
    roleRepository.findById(roleId),
    userRepository.findById(userId),
  ]);

  if (!role) return { ok: false, reason: 'role_not_found' };
  if (!user) return { ok: false, reason: 'user_not_found' };

  const existingLink = await roleRepository.findUserRole(userId, roleId);
  if (existingLink) return { ok: false, reason: 'already_assigned' };

  await roleRepository.assignToUser(userId, roleId);
  return { ok: true };
}

// Devuelve el rol por defecto para usuarios nuevos (DEFAULT_USER_ROLE_NAME), creándolo
// si todavía no existe en la BD. Usado por authService.register para que el alta de
// usuarios funcione también en una BD recién clonada, sin necesidad de un seed manual.
export async function ensureDefaultUserRole() {
  const existing = await roleRepository.findByName(DEFAULT_USER_ROLE_NAME);
  if (existing) return existing;

  return roleRepository.create({
    name: DEFAULT_USER_ROLE_NAME,
    description: 'Rol asignado por defecto a todo usuario que se registra.',
  });
}

// Quita un rol de un usuario (maneja la tabla intermedia userrole).
export async function removeRoleFromUser(
  roleId: number,
  userId: number
): Promise<{ ok: true } | { ok: false; reason: 'not_assigned' }> {
  const existingLink = await roleRepository.findUserRole(userId, roleId);
  if (!existingLink) return { ok: false, reason: 'not_assigned' };

  await roleRepository.removeFromUser(userId, roleId);
  return { ok: true };
}
