const { test, expect } = require('@playwright/test');
const { dismissOverlays } = require('../support/utils/overlays');

/**
 * 1238 — Timer
 * Checks that the "Получить код еще раз" timer appears after
 * submitting the phone number in the auth dialog.
 * Does NOT complete login — intentionally stops before SMS code entry.
 */
test('1238. auth dialog shows resend timer after sending SMS', async ({ page }) => {

  await test.step('Open site and click sign in', async () => {
    await page.goto('/omsk', { waitUntil: 'load', timeout: 35000 });
    await expect(page.locator('body .statistics')).toBeVisible({ timeout: 35000 });
    await dismissOverlays(page);

    const signInButton = page.getByRole('button', { name: 'Войти' }).first();
    await expect(signInButton).toBeVisible({ timeout: 15000 });
    await signInButton.click();
    await expect(page.locator('.dialog .modal-container')).toBeVisible({ timeout: 15000 });
  });

  await test.step('Fill phone number and request SMS code', async () => {
    await page.locator('#tel').click();
    await page.locator('#tel').fill('1111111111');

    await page.locator(
      'body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox'
    ).click();
    await page.locator(
      'body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox'
    ).click();

    await page.locator('.dialog .auth-form__code-btn').click();
  });

  await test.step('Timer is visible after SMS is sent', async () => {
    await expect(
      page.locator('.dialog .code-dialog__time-text')
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('.dialog .code-dialog__time-text')
    ).toContainText('Получить код еще раз');
  });

});
