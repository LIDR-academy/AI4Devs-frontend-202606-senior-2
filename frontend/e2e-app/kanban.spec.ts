import { test, expect } from '@playwright/test';
test('aplicación: IDs reales, arrastre, persistencia tras recargar y rollback', async ({ page, request }) => {
  await page.goto('/positions');
  await page.getByRole('button', { name: 'Ver proceso' }).first().click();
  await expect(page).toHaveURL(/\/position\/\d+$/);
  const positionId = page.url().split('/').pop();
  const api = 'http://localhost:3010';
  const candidates = await (await request.get(`${api}/position/${positionId}/candidates`)).json();
  const alex = candidates.find((c: { fullName: string }) => c.fullName === 'Alex Demo');
  expect(alex).toBeTruthy();
  const { interviewFlow } = await (await request.get(`${api}/position/${positionId}/interviewflow`)).json();
  const steps = interviewFlow.interviewFlow.interviewSteps;
  const source = steps.find((s: { name: string }) => s.name === alex.currentInterviewStep);
  const destination = steps.find((s: { id: number }) => s.id !== source.id);
  const card = page.getByTestId(`kanban-card-${alex.applicationId}`);
  await expect(card).toBeVisible();
  try {
    const a = (await card.boundingBox())!;
    const b = (await page.getByTestId(`kanban-column-${destination.id}`).boundingBox())!;
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2, { steps: 5 });
    await page.mouse.move(b.x + b.width / 2, b.y + b.height - 10, { steps: 30 });
    await page.waitForTimeout(300);
    const saved = page.waitForResponse(r => r.request().method() === 'PUT');
    await page.mouse.up();
    expect((await saved).status()).toBe(200);
    await page.reload();
    await expect(page.getByTestId(`kanban-column-${destination.id}`)).toContainText('Alex Demo');
    const persisted = await (await request.get(`${api}/position/${positionId}/candidates`)).json();
    expect(persisted.find((c: { applicationId: number }) => c.applicationId === alex.applicationId).currentInterviewStep).toBe(destination.name);
    await page.route('**/candidates/*', route => route.request().method() === 'PUT' ? route.fulfill({ status: 500, body: '{}' }) : route.continue());
    await card.focus();
    await page.keyboard.press('Space');
    await page.keyboard.press(destination.id > source.id ? 'ArrowLeft' : 'ArrowRight');
    await page.keyboard.press('Space');
    await expect(page.getByRole('alert')).toContainText('No se pudo actualizar');
    await expect(page.getByTestId(`kanban-column-${destination.id}`)).toContainText('Alex Demo');
  } finally {
    const restored = await request.put(`${api}/candidates/${alex.id}`, { data: { applicationId: alex.applicationId, currentInterviewStep: source.id } });
    expect(restored.ok()).toBeTruthy();
  }
});
