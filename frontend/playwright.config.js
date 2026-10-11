// Configuración de Playwright para los tests end-to-end (npm run test:e2e): abren la app en un
// navegador real y la usan como un usuario. Necesitan la base de desarrollo con los datos de
// docs/demo-seed.sql cargados.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Tiempo máximo de cada test: el primer pedido a cada página puede tardar (Vite compila en dev).
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    // Si un test falla, guarda captura y la traza para ver qué pasó en el reporte.
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Levanta el backend y el frontend si no están corriendo; si ya están (npm run dev en otra
  // terminal), usa esos.
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:3000/api/database/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
