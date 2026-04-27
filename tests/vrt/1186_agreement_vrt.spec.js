const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1186. user agreement opens from auth modal', async ({ page }) => {
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

  const agreementLink = page
    .locator('.agreement-links__link')
    .filter({ hasText: 'Пользовательским соглашением' })
    .first();

  const popupPromise = page.waitForEvent('popup');
  await agreementLink.click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');

  const agreement = popup.locator('body .agreement').filter({ hasText: 'Пользовательское соглашение' }).first();
  const agreementContent = agreement.locator('.agreement__container');
  await expect(agreementContent).toBeVisible({ timeout: 15000 });

  await expect(agreementContent).toHaveScreenshot('1186_agreement.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.05,
  });
});
