// Test de integración de la API: con Supertest se le hacen pedidos HTTP reales a la app de
// Express (app.ts, sin levantar el servidor) y se revisa la respuesta completa, pasando por
// rutas, middlewares, controllers, services y, en el último bloque, la base de datos.
import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from './app.js';
import prisma from './core/prismaClient.js';

describe('API sin base de datos: respuestas de error en JSON', () => {
  it('una ruta inexistente responde 404 con un mensaje', async () => {
    const response = await request(app).get('/api/ruta-que-no-existe');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Ruta no encontrada.' });
  });

  it('un JSON mal formado responde 400 sin mostrar detalles internos', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"username": "juan",');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'El cuerpo de la petición no es un JSON válido.' });
  });

  it('una ruta protegida sin token responde 401', async () => {
    const response = await request(app).get('/api/users/1');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Acceso denegado. No se proporcionó un token.');
  });

  it('un token inválido también responde 401', async () => {
    const response = await request(app).get('/api/users/1').set('Authorization', 'Bearer token-falso');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token inválido o expirado.');
  });

  it('un registro vacío responde 422 con el error de cada campo obligatorio', async () => {
    const response = await request(app).post('/api/auth/register').send({});

    expect(response.status).toBe(422);
    const fields = response.body.errors.map((error: { campo: string }) => error.campo);
    expect(fields).toEqual(expect.arrayContaining(['username', 'password', 'name', 'lastName', 'email']));
  });
});

// Este bloque escribe en la base: solo corre si existe backend/.env.test con una base de test
// aparte (ver vitest.config.ts). Así nunca toca la base de desarrollo.
describe.skipIf(process.env.HAS_TEST_DATABASE !== 'true')('API con la base de test: registro, login y ruta protegida', () => {
  // Usuario único en cada corrida, para no chocar con uno que haya quedado de otra.
  const suffix = Date.now();
  const newUser = {
    username: `test.user.${suffix}`,
    password: 'clave-de-test',
    name: 'Usuario',
    lastName: 'De Test',
    email: `test.user.${suffix}@chefcito.test`,
  };
  let createdUserId: number | undefined;

  // Borra el usuario creado (sus roles se borran en cascada) y cierra la conexión.
  afterAll(async () => {
    if (createdUserId) await prisma.user.delete({ where: { id: createdUserId } });
    await prisma.$disconnect();
  });

  it('registra un usuario, inicia sesión y con el token accede a su perfil', async () => {
    const registerResponse = await request(app).post('/api/auth/register').send(newUser);
    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.username).toBe(newUser.username);
    // La contraseña nunca vuelve en la respuesta.
    expect(registerResponse.body).not.toHaveProperty('password');
    createdUserId = registerResponse.body.id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: newUser.username, password: newUser.password });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toEqual(expect.any(String));
    // Aunque la base de test arranque vacía, un usuario registrado nunca es administrador.
    expect(loginResponse.body.isAdmin).toBe(false);

    const profileResponse = await request(app)
      .get(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${loginResponse.body.token}`);
    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body).toMatchObject({ id: createdUserId, email: newUser.email });
  });

  it('el mismo usuario no se puede registrar dos veces (409 con el campo)', async () => {
    const response = await request(app).post('/api/auth/register').send(newUser);

    expect(response.status).toBe(409);
    expect(response.body.errors).toEqual([{ campo: 'username', mensaje: 'El nombre de usuario ya está en uso.' }]);
  });

  it('una contraseña incorrecta responde 401 sin decir si el usuario existe', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: newUser.username, password: 'otra-clave' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Email, usuario o contraseña incorrectos.');
  });
});
