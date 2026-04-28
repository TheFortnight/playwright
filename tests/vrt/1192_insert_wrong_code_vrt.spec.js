const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1192. insert wrong sms code', async ({ page }) => {
  await page.goto(`${baseUrl}omsk`, { waitUntil: 'load', timeout: 60000 });

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

  await page.locator('#tel').fill('0000000000');
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();
  await page.locator('.dialog .auth-form__code-btn').click();

  const codeInput = page.locator('.dialog .code-dialog__code-box input').first();
  await expect(codeInput).toBeVisible({ timeout: 45000 });
  await codeInput.click();
  await page.keyboard.type('00000');

  await expect(page.locator('.dialog .indicator__error-text')).toHaveText('Неверный код', {
    timeout: 15000,
  });
  await expect(modal).toHaveScreenshot('1192_wrong_code.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.05,
  });
});