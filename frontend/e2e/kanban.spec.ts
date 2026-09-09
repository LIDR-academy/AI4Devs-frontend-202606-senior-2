import { test, expect } from '@playwright/test';
const story = (id: string) => `/iframe.html?id=lidr-organisms-positionkanbandetail--${id}&viewMode=story`;
test('KB-01: el tablero existente se carga sin backend y el teclado mueve una tarjeta', async ({ page }) => {
  await page.goto(story('loaded'));
  const card = page.getByTestId('kanban-card-10');
  await expect(card).toBeVisible();
  await card.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect(page.getByTestId('kanban-column-2')).toContainText('Alex Demo');
});
test('KB-02: la story de fallo muestra rollback', async ({ page }) => {
  await page.goto(story('move-error'));
  await expect(page.getByRole('alert')).toContainText('No se pudo actualizar');
  await expect(page.getByTestId('kanban-column-1')).toContainText('Alex Demo');
});
test('KB-03: la story pending conserva el bloqueo', async ({ page }) => {
  await page.goto(story('saving'));
  await expect(page.getByRole('status')).toContainText('Guardando');
  await expect(page.getByTestId('kanban-card-11')).not.toHaveAttribute('tabindex', '0');
});
test('KB-04: nombre largo no desborda a 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(story('long-name'));
  await expect(page.getByTestId('kanban-card-10')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('BS-01 y BS-02: búsqueda normalizada, vacío y recuperación por teclado', async ({ page }) => {
  await page.goto(story('search-ready'));
  const input = page.getByRole('searchbox');
  await input.fill('  JOSE  ');
  await expect(page.getByTestId('kanban-card-11')).toBeVisible();
  await expect(page.getByTestId('kanban-card-10')).toHaveCount(0);
  await input.fill('nadie');
  await expect(page.getByText('No hay candidatos que coincidan con la búsqueda.')).toBeVisible();
  await input.press('Tab');
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  await expect(page.getByTestId('kanban-card-10')).toBeVisible();
});
test('BS-03: arrastrar con filtro mueve a José y conserva a Alex', async ({ page }) => {
  await page.goto(story('search-ready'));
  await page.getByRole('searchbox').fill('jose');
  await page.getByTestId('kanban-card-11').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect(page.getByTestId('kanban-column-2')).toContainText('José Pérez');
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  await expect(page.getByTestId('kanban-column-1')).toContainText('Alex Demo');
});
test('BS-05: buscador usable a 375 px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(story('search-ready'));
  await page.getByRole('searchbox').fill('jose');
  await expect(page.getByRole('button', { name: 'Limpiar búsqueda' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
