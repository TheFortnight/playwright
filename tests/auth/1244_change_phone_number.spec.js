const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1244. change phone number from any page', async ({ page }) => {
  await page.goto(`${baseUrl}omsk`, { waitUntil: 'load', timeout: 30000 });

  await expect(page.locator('body .statistics')).toBeVisible({ timeout: 35000 });

  await dismissOverlays(page);

  const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' });
  if (await confirmCityButton.count()) {
    await confirmCityButton.click();
  }

  const signInButton = page.getByRole('button', { name: 'Войти' }).first();
  await expect(signInButton).toBeVisible({ timeout: 15000 });
  await signInButton.click();

  const modal = page.locator('.dialog .modal-container');
  await expect(page.locator('.dialog')).toBeVisible({ timeout: 30000 });
  await expect(modal).toBeVisible({ timeout: 30000 });

  const phoneInput = page.locator('#tel');
  await phoneInput.click();
  await phoneInput.fill('0000000000');

  await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();
  await page.locator('.dialog .auth-form__code-btn').click();

  const changePhoneButton = page.locator('body .code-dialog__change-phone');
  await expect(changePhoneButton).toBeVisible({ timeout: 15000 });
  await changePhoneButton.click();

  await expect(phoneInput).toBeVisible({ timeout: 15000 });
  await phoneInput.click();
  await phoneInput.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('0000000000', { delay: 50 });

  await page.locator('.dialog .auth-form__code-btn').click();

  await expect(page.locator('.dialog .code-dialog__phone')).toHaveText('+7 (000) 000-00-00', { timeout: 15000 });
});
