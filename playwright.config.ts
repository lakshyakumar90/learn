import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://127.0.0.1:3100' },
  webServer: {
    command: 'node tests/e2e/serve-static.mjs 3100 out',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: true,
  },
});
