import { test, expect } from '@playwright/test';

test.describe('Supervisor Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a login
    await page.goto('/login');

    // Login como supervisor
    await page.fill('input[placeholder="OP001"]', 'SV001');
    await page.fill('input[placeholder="••••••"]', 'pass123');
    await page.click('button:has-text("Iniciar Sesión")');

    // Esperar redirección a supervisor-sessions
    await page.waitForURL('/supervisor-sessions', { timeout: 5000 });
  });

  test('debe listar sesiones de conteo', async ({ page }) => {
    // Verificar que la página cargó
    expect(await page.locator('h1').textContent()).toContain('Panel de Supervisor');

    // Verificar filtros
    expect(await page.locator('button:has-text("Todas")').isVisible()).toBe(true);
    expect(await page.locator('button:has-text("Abiertas")').isVisible()).toBe(true);
    expect(await page.locator('button:has-text("Cerradas")').isVisible()).toBe(true);
    expect(await page.locator('button:has-text("Aprobadas")').isVisible()).toBe(true);
  });

  test('debe filtrar sesiones por estado', async ({ page }) => {
    // Hacer clic en filtro "Cerradas"
    await page.click('button:has-text("Cerradas")');

    // Verificar que el botón está seleccionado
    const closedButton = page.locator('button:has-text("Cerradas")');
    await expect(closedButton).toHaveClass(/bg-blue-600/);
  });

  test('debe navegar a detalles de sesión', async ({ page }) => {
    // Si hay sesiones, hacer clic en "Ver Detalles"
    const detailButton = page.locator('button:has-text("Ver Detalles")').first();

    if (await detailButton.isVisible()) {
      await detailButton.click();

      // Esperar navegación
      await page.waitForURL(/\/session-detail\//, { timeout: 5000 });

      // Verificar que llegamos a detalles
      expect(await page.locator('h1').textContent()).toContain('Detalles de Sesión');
    }
  });

  test('debe mostrar estadísticas en session detail', async ({ page }) => {
    // Navegar a primera sesión si existe
    const detailButton = page.locator('button:has-text("Ver Detalles")').first();

    if (await detailButton.isVisible()) {
      await detailButton.click();
      await page.waitForURL(/\/session-detail\//, { timeout: 5000 });

      // Verificar tarjetas de estadísticas
      expect(await page.locator('text=Total Items').isVisible()).toBe(true);
      expect(await page.locator('text=Con Diferencia').isVisible()).toBe(true);
      expect(await page.locator('text=Requieren Reconteo').isVisible()).toBe(true);
      expect(await page.locator('text=Diferencia Total').isVisible()).toBe(true);
      expect(await page.locator('text=Promedio').isVisible()).toBe(true);
    }
  });

  test('debe logout correctamente', async ({ page }) => {
    // Hacer clic en "Cerrar Sesión"
    await page.click('button:has-text("Cerrar Sesión")');

    // Esperar redirección a login
    await page.waitForURL('/login', { timeout: 5000 });

    // Verificar que estamos en login
    expect(await page.locator('h1').textContent()).toContain('Inventory Count');
  });
});
