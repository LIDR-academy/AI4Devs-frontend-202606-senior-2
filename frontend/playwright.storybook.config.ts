import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:6006', viewport: { width: 1280, height: 800 }, channel: 'chrome' },
  webServer: { command: 'npm run storybook -- --ci --host 127.0.0.1 --no-open', url: 'http://127.0.0.1:6006', reuseExistingServer: !process.env.CI, timeout: 120000 },
  reporter: 'list', workers: 1,
});
