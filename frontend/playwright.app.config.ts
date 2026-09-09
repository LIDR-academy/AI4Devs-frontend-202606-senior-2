import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e-app',
  use: { baseURL: 'http://127.0.0.1:3000', viewport: { width: 1280, height: 800 }, channel: 'chrome' },
  reporter: 'list', workers: 1,
});
