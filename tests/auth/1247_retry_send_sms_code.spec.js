const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1247. auth dialog retries SMS send before timer ends', async ({ page }) => {
  await test.step('Open homepage and auth popup', async () => {
    await page.goto(`${baseUrl}omsk`, { waitUntil: 'load', timeout: 30000 });
    await dismissOverlays(page);

    const signInButton = page.getByRole('button', { name: 'Войти' }).first();
    await expect(signInButton).toBeVisible({ timeout: 15000 });
    await signInButton.click();

    await expect(page.locator('.dialog .modal-container')).toBeVisible({ timeout: 30000 });
  });

  await test.step('Enter phone number and request SMS', async () => {
    await page.locator('#tel').click();
    await page.locator('#tel').fill('1111111111');

    await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
    await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();

    await page.locator('.dialog .auth-form__code-btn').click();
  });

  await test.step('Return to phone form and request SMS again', async () => {
    await expect(page.locator('body .code-dialog__change-phone')).toBeVisible({ timeout: 15000 });
    await page.locator('body .code-dialog__change-phone').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('#tel')).toBeVisible({ timeout: 15000 });
    await page.locator('#tel').click();
    await page.locator('#tel').fill('1111111111');

    await page.locator('.dialog .auth-form__code-btn').click();
  });

  await test.step('Timer shows resend text', async () => {
    await expect(page.locator('.dialog .code-dialog__time-text')).toContainText('Получить код еще раз', {
      timeout: 10000,
    });
  });
});
