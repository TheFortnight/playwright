const { test, expect, getBaseUrl, dismissOverlays } = require('../support/fixtures');

const baseUrl = getBaseUrl();

test('1243. authorization from any page shows no internet message', async ({ page }) => {
  await page.goto(`${baseUrl}omsk/catalog/zheludochno-kishechnye-sredstva`, {
    waitUntil: 'load',
    timeout: 30000,
  });

  await dismissOverlays(page);

  const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
  if (await confirmCityButton.count()) {
    await confirmCityButton.click();
  }

  const signInButton = page.getByRole('button', { name: 'Войти' }).first();
  await expect(signInButton).toBeVisible({ timeout: 15000 });
  await signInButton.click();

  const phoneInput = page.locator('#tel');
  await expect(phoneInput).toBeVisible({ timeout: 15000 });

  await phoneInput.fill('0000000000');

  await page.context().setOffline(true);

  await page.locator('body .agreement-wrapper .agreement-item:nth-child(2) .custom-checkbox').click();
  await page.locator('body .agreement-wrapper .agreement-item:nth-child(3) .custom-checkbox').click();
  await page.locator('.dialog .auth-form__code-btn').click();

  await expect(page.locator('body .stab__title')).toHaveText('Нет подключения к интернету', {
    timeout: 15000,
  });
});
