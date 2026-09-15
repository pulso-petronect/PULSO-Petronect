import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    actionTimeout: 10_000,
  },
  webServer: {
    command: 'pnpm exec vite preview --config vite.config.ts --port 4173 --strictPort --host 127.0.0.1',
    port: 4173,
    reuseExistingServer: true,
    timeout: 20_000,
  },
});
