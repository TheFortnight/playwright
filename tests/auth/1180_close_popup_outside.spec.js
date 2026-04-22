const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1180. auth popup closes by clicking outside the dialog', async ({ page }) => {
  await page.goto(`${baseUrl}omsk`, {
    waitUntil: 'load',
    timeout: 30000,
  });

  await dismissOverlays(page);

  const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' });
  if (await confirmCityButton.count()) {
    await confirmCityButton.click();
  }

  const signInButton = page.getByRole('button', { name: 'Войти' }).first();
  await expect(signInButton).toBeVisible({ timeout: 15000 });
  await signInButton.click();

  const modal = page.locator('.dialog .modal-container');
  await expect(modal).toBeVisible({ timeout: 15000 });

  await page.evaluate(() => {
    document.querySelector('.overlay')?.click();
  });

  await expect(modal).toBeHidden({ timeout: 10000 });
});
