const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1189. close popup by x', async ({ page }) => {
  await page.goto(`${baseUrl}omsk`, { waitUntil: 'load', timeout: 30000 });

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

  await page.locator('#tel').click();
  await page.locator('#tel').fill('0000000000');
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();
  await page.locator('.dialog .auth-form__code-btn').click();

  await modal.locator('.auth-header .close-btn').click();
  await expect(modal.locator('.auth-dialog')).toHaveCount(0);
});
