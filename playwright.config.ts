import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90000,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: 'http://127.0.0.1:3333',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'android-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'iphone-webkit',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:3333/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
