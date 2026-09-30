// Lógica de negocio de la feature user.
// Orquesta el repositorio, aplica reglas y transforma datos para el controller.
import bcrypt from 'bcrypt';
import { userRepository } from '../repository/userRepository.js';
import { toPublic, type UpdateUserData, type UserImageField, ADMIN_ROLE_ID } from '../models/userModel.js';
import { deleteLocalUpload } from '../../../core/fileStorage.js';
import { ensureDefaultUserRole } from '../../rol/services/roleService.js';

const SALT_ROUNDS = 10;

// Devuelve todos los usuarios activos sin su contraseña.
export async function getAllUsers() {
  const users = await userRepository.findAll();
  if (users.length === 0) return null;
  return users.map(toPublic);
}

// Devuelve todos los usuarios inactivos (dados de baja) sin su contraseña.
// Solo accesible por administradores.
export async function getDeletedUsers() {
  const users = await userRepository.findAllDeleted();
  if (users.length === 0) return null;
  return users.map(toPublic);
}

// Devuelve un usuario activo por ID sin su contraseña, o null si no existe.
export async function getUserById(id: number) {
  const user = await userRepository.findById(id);
  if (!user) return null;
  return toPublic(user);
}

// Realiza la baja lógica de un usuario.
// Verifica que exista antes de actualizarlo. Devuelve sus datos públicos o null si no existe.
export async function softDeleteUser(id: number) {
  const user = await userRepository.findById(id);
  if (!user) return null;
  await userRepository.softDelete(id);
  return toPublic(user);
}

// Reactiva un usuario dado de baja. Busca en los inactivos, no en los activos.
// Devuelve los datos públicos del usuario reactivado, o null si no existía como inactivo.
export async function restoreUser(id: number) {
  const user = await userRepository.findByIdDeleted(id);
  if (!user) return null;
  const restored = await userRepository.restore(id);
  return toPublic(restored);
}

// Actualiza los datos editables del perfil. Devuelve los datos públicos o null si no existe.
export async function updateUser(id: number, data: UpdateUserData) {
  const existing = await userRepository.findById(id);
  if (!existing) return null;
  const updated = await userRepository.update(id, data);
  return toPublic(updated);
}

// Guarda la nueva foto de perfil o de portada (una sola de cada una por usuario).
// Recibe: id del usuario, field ('avatarUrl' | 'coverUrl') y la ruta pública del archivo
// ya subido. La foto anterior, si era un archivo propio, se borra del disco porque ya no
// la usa nadie. Devuelve el usuario actualizado o not_found.
export async function setUserImage(
  id: number,
  field: UserImageField,
  imageUrl: string
): Promise<{ ok: true; user: object } | { ok: false; reason: 'not_found' }> {
  const existing = await userRepository.findById(id);
  if (!existing) return { ok: false, reason: 'not_found' };

  const updated = await userRepository.update(id, { [field]: imageUrl });
  await deleteLocalUpload(existing[field]);
  return { ok: true, user: toPublic(updated) };
}

// Quita la foto de perfil o de portada: deja la columna en null y borra el archivo.
// Recibe: id del usuario y field. Devuelve el usuario actualizado o not_found.
export async function removeUserImage(
  id: number,
  field: UserImageField
): Promise<{ ok: true; user: object } | { ok: false; reason: 'not_found' }> {
  const existing = await userRepository.findById(id);
  if (!existing) return { ok: false, reason: 'not_found' };

  const updated = await userRepository.update(id, { [field]: null });
  await deleteLocalUpload(existing[field]);
  return { ok: true, user: toPublic(updated) };
}

// Cambia la contraseña de un usuario verificando primero la contraseña actual.
// Devuelve un objeto que indica el resultado: ok, not_found, o wrong_password.
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'wrong_password' }> {
  const user = await userRepository.findById(userId);
  if (!user) return { ok: false, reason: 'not_found' };

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) return { ok: false, reason: 'wrong_password' };

  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepository.updatePassword(userId, hashed);

  return { ok: true };
}

// Alta de usuario por un administrador.
// Verifica duplicados de username y email, hashea la contraseña, le asigna el rol
// "Usuario" y, si makeAdmin=true, también el rol admin.
// Devuelve el usuario público creado o un motivo de fallo.
export async function createUserByAdmin(data: {
  username: string;
  password: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string | null;
  birthDate?: Date | null;
  makeAdmin?: boolean;
}): Promise<
  | { ok: true; user: object }
  | { ok: false; reason: 'username_taken' | 'email_taken' }
> {
  const [existingByUsername, existingByEmail] = await Promise.all([
    userRepository.findByUsername(data.username),
    userRepository.findByEmail(data.email),
  ]);

  if (existingByUsername) return { ok: false, reason: 'username_taken' };
  if (existingByEmail) return { ok: false, reason: 'email_taken' };

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const newUser = await userRepository.create({
    username: data.username.trim(),
    password: hashedPassword,
    name: data.name.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() ?? null,
    birthDate: data.birthDate ?? null,
  });

  // Igual que en el registro, todo usuario nuevo recibe el rol "Usuario" por defecto.
  // Si además se pidió rol admin, se suma ese también (un usuario puede tener varios).
  const defaultRole = await ensureDefaultUserRole();
  await userRepository.assignRole(newUser.id, defaultRole.id);
  if (data.makeAdmin) {
    await userRepository.assignRole(newUser.id, ADMIN_ROLE_ID);
  }

  return { ok: true, user: toPublic(newUser) };
}
