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
test('BS-01/02: búsqueda integrada, vacío y limpiar recuperan datos y foco', async ({ page }) => {
  await page.goto(story('search-match'));
  const input = page.getByRole('searchbox', { name: 'Buscar candidatos' });
  await expect(page.getByText('1 de 3 candidatos')).toBeVisible();
  await expect(page.getByText('Alex Demo')).toHaveCount(0);
  await input.fill('Lucía');
  await expect(page.getByText('No hay candidatos que coincidan con la búsqueda.')).toBeVisible();
  await expect(page.getByRole('heading', { level: 5 })).toHaveCount(3);
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  await expect(input).toBeFocused();
  await expect(page.getByText('3 de 3 candidatos')).toBeVisible();
});
test('BS-04: guardado filtrado bloquea ambos controles', async ({ page }) => {
  await page.goto(story('search-saving'));
  await expect(page.getByRole('status')).toContainText('Guardando');
  await expect(page.getByRole('searchbox')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Limpiar búsqueda' })).toBeDisabled();
});
test('BS-04: rollback filtrado conserva la consulta y los ocultos', async ({ page }) => {
  await page.goto(story('search-rollback'));
  await expect(page.getByRole('alert')).toContainText('No se pudo actualizar');
  await expect(page.getByRole('searchbox')).toHaveValue('jose');
  await expect(page.getByTestId('kanban-column-1')).toContainText('José García');
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  await expect(page.getByText('3 de 3 candidatos')).toBeVisible();
  await expect(page.getByText('Alex Demo')).toBeVisible();
});
test('BS-05: búsqueda móvil mantiene botón debajo y evita desbordamiento', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(story('search-match'));
  await expect(page.getByText('1 de 3 candidatos')).toBeVisible();
  const input = (await page.getByRole('searchbox').boundingBox())!;
  const button = (await page.getByRole('button', { name: 'Limpiar búsqueda' }).boundingBox())!;
  expect(button.y).toBeGreaterThanOrEqual(input.y + input.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('molécula aislada: limpiar controla query y recupera foco', async ({ page }) => {
  await page.goto('/iframe.html?id=lidr-molecules-candidatesearch--match&viewMode=story');
  const input = page.getByRole('searchbox');
  await expect(input).toHaveValue('jose');
  await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
});
