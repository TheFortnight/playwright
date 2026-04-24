const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1183. sign in form with invalid input', async ({ page }) => {
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

  const phoneInput = page.locator('#tel');
  await phoneInput.click();
  await page.keyboard.type("RTYUI']#$%^");
  await expect(phoneInput).toHaveValue('+7 (___) ___-__-__');

  await expect(modal).toHaveScreenshot('1183_invalid_input.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.05,
  });
});
