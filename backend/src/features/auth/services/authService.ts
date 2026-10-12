// Lógica de negocio de la feature auth.
// Orquesta el repositorio, aplica hasheo de contraseñas y firma JWT.
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository } from '../repository/authRepository.js';
import { toPublic, ADMIN_ROLE_ID } from '../../user/models/userModel.js';
import { roleRepository } from '../../rol/repository/roleRepository.js';
import { ensureDefaultUserRole } from '../../rol/services/roleService.js';

const SALT_ROUNDS = 10;

type RegisterResult =
  | { ok: true; user: object }
  | { ok: false; reason: 'username_taken' | 'email_taken' };

type LoginResult =
  | { ok: true; token: string; isAdmin: boolean }
  | { ok: false; reason: 'invalid_credentials' | 'no_jwt_secret' };

// Registra un nuevo usuario: verifica duplicados, hashea la contraseña y persiste.
export async function register(data: {
  username: string;
  password: string;
  name: string;
  lastName: string;
  email: string;
  phone?: string | null;
  birthDate?: Date | null;
}): Promise<RegisterResult> {
  const [existingByUsername, existingByEmail] = await Promise.all([
    authRepository.findByUsername(data.username),
    authRepository.findByEmail(data.email),
  ]);

  if (existingByUsername) return { ok: false, reason: 'username_taken' };
  if (existingByEmail) return { ok: false, reason: 'email_taken' };

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await authRepository.create({
    username: data.username.trim(),
    password: hashedPassword,
    name: data.name.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() ?? null,
    birthDate: data.birthDate ?? null,
  });

  // Todo usuario nuevo recibe el rol "Usuario" por defecto (se crea solo si la BD
  // todavía no lo tiene, ver roleService.ensureDefaultUserRole).
  const defaultRole = await ensureDefaultUserRole();
  await roleRepository.assignToUser(user.id, defaultRole.id);

  return { ok: true, user: toPublic(user) };
}

// Autentica un usuario con su email/username y contraseña.
// En caso de éxito devuelve un JWT firmado y el flag isAdmin.
export async function login(identifier: string, password: string): Promise<LoginResult> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return { ok: false, reason: 'no_jwt_secret' };

  const user = await authRepository.findByEmailOrUsername(identifier);
  if (!user) return { ok: false, reason: 'invalid_credentials' };

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return { ok: false, reason: 'invalid_credentials' };

  const roleIds = await authRepository.getUserRoleIds(user.id);
  const isAdmin = roleIds.includes(ADMIN_ROLE_ID);

  // Token con payload mínimo y no sensible, expira en 8 horas.
  const token = jwt.sign(
    { id: user.id, username: user.username, isAdmin },
    secret,
    { expiresIn: '8h' }
  );

  return { ok: true, token, isAdmin };
}
