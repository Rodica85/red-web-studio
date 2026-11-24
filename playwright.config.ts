import { defineConfig, devices } from '@playwright/test';
import os from 'node:os';

const PORT = 4173;

// Playwright's WebKit (Safari) no longer works on macOS 14 or older (frozen build).
// There we skip the Safari projects locally; GitHub Actions (Linux) always runs them.
const isOldMac = process.platform === 'darwin' && parseInt(os.release(), 10) < 24;
const runSafari = !!process.env.CI || !isOldMac || !!process.env.WEBKIT;

/**
 * Automated tests for redwebstudio.com and its demo websites.
 *
 *   npm test                 all browsers (Chrome, Firefox, Safari, phones)
 *   npm run test:chromium    quick run in Chrome only
 *   npm run test:ui          interactive mode
 *   npm run report           open the last HTML report
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Opening hours and "open now" signs depend on UK time.
    timezoneId: 'Europe/London',
    locale: 'en-GB',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    ...(runSafari
      ? [
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
          { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
        ]
      : []),
  ],
  webServer: {
    // Same clean URLs as Vercel (/privacy-policy, /demos/salon/admin).
    command: `npx serve website -l ${PORT} -n -L`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
