// Test end-to-end: un usuario de demo inicia sesión, busca "fideos" y abre la receta encontrada.
// Recorre front, back y base juntos, como lo haría una persona (usa los datos de demo-seed.sql).
import { test, expect } from '@playwright/test';

const DEMO_USER = { username: 'juanperez', password: '123456' };
const RECIPE_NAME = 'Fideos con tuco';

test('iniciar sesión, buscar una receta y abrir su detalle', async ({ page }) => {
  // Sin sesión, la app manda a la landing.
  await page.goto('/');
  await expect(page).toHaveURL(/\/bienvenida$/);

  // Login desde el modal de la landing. Los campos arrancan en solo lectura hasta que se los
  // toca (para que el navegador no los autocomplete solo), por eso primero el click.
  await page.getByRole('button', { name: 'Iniciar sesión' }).first().click();
  const identifierInput = page.locator('#login-identifier');
  await identifierInput.click();
  await identifierInput.fill(DEMO_USER.username);
  const passwordInput = page.locator('#login-password');
  await passwordInput.click();
  await passwordInput.fill(DEMO_USER.password);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // Ya logueado, entra al inicio y busca desde la barra de búsqueda.
  await expect(page).toHaveURL(/\/$/);
  const searchInput = page.getByLabel('Buscar recetas, categorías o usuarios');
  await searchInput.fill('fideos');
  await searchInput.press('Enter');

  // Página de resultados con la receta del seed.
  await expect(page).toHaveURL(/\/buscar\?q=fideos/);
  const recipeCardTitle = page.getByRole('heading', { level: 3, name: RECIPE_NAME }).first();
  await expect(recipeCardTitle).toBeVisible();
  await recipeCardTitle.click();

  // Detalle de la receta: el título y el primer paso (los pasos se ven de a uno) vienen del backend.
  await expect(page).toHaveURL(/\/recetas\/\d+$/);
  await expect(page.getByRole('heading', { level: 1, name: RECIPE_NAME })).toBeVisible();
  await expect(page.getByText('Rehogar la cebolla picada en aceite de oliva.')).toBeVisible();
});
