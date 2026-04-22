const { defineConfig } = require('@playwright/test');
const { getBaseUrl } = require('./tests/support/utils/env');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  snapshotPathTemplate: 'visual-baselines/{testFileName}-snapshots/{arg}{-projectName}{-platform}{ext}',
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: getBaseUrl(),
    browserName: 'chromium',
    viewport: { width: 1440, height: 780 },
    ignoreHTTPSErrors: true,
    serviceWorkers: 'block',
    launchOptions: {
      args: ['--deny-permission-prompts'],
    },
  },
});
