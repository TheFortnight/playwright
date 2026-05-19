const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1240. auth dialog lets user click resend SMS again', async ({ page }) => {
  await test.step('Open portal page and auth popup', async () => {
    await page.goto(`${baseUrl}omsk`, { waitUntil: 'load', timeout: 35000 });
    await expect(page.locator('body .statistics')).toBeVisible({ timeout: 35000 });
    await dismissOverlays(page);

    const signInButton = page.getByRole('button', { name: 'Войти' }).first();
    await expect(signInButton).toBeVisible({ timeout: 15000 });
    await signInButton.click();
    await expect(page.locator('.dialog .modal-container')).toBeVisible({ timeout: 15000 });
  });

  await test.step('Request SMS and click resend', async () => {
    await page.locator('#tel').click();
    await page.locator('#tel').fill('1111111111');

    await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
    await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();

    await page.locator('.dialog .auth-form__code-btn').click();

    const resendButton = page.locator('.dialog .code-dialog__send-btn');
    await expect(resendButton).toBeVisible({ timeout: 35000 });
    await resendButton.click();
  });

  await test.step('Timer shows resend text', async () => {
    await expect(page.locator('.dialog .code-dialog__time-text')).toContainText('Получить код еще раз');
  });
});
