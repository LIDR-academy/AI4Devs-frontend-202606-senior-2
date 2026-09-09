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
