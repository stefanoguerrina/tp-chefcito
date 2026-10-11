// Configuración de Vitest para los tests del backend (npm test). Es .mts porque el backend
// es CommonJS y Vite lee su configuración como módulo ES.
// Los tests están junto al archivo que prueban, con el sufijo .test.ts.
import fs from 'node:fs';
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';

// Si existe .env.test (con la DATABASE_URL de la base de test), sus variables se cargan antes
// que el .env de desarrollo: dotenv no pisa una variable que ya está definida, así que la app
// usa la base de test. Sin .env.test, los tests que escriben en la base se saltean, para no
// tocar nunca la base de desarrollo.
const testEnvPath = new URL('./.env.test', import.meta.url);
const testEnv = fs.existsSync(testEnvPath) ? dotenv.parse(fs.readFileSync(testEnvPath)) : {};

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      ...testEnv,
      HAS_TEST_DATABASE: testEnv.DATABASE_URL ? 'true' : 'false',
    },
  },
});
