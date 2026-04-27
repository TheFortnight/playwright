const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1185. privacy policy opens from auth modal', async ({ page }) => {
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

  const privacyLink = page
    .locator('.agreement-links__link')
    .filter({ hasText: 'Политикой в области персональных данных' })
    .first();

  const popupPromise = page.waitForEvent('popup');
  await privacyLink.click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');

  const agreement = popup.locator('body .agreement').filter({ hasText: 'Политика конфиденциальности' }).first();
  const agreementContent = agreement.locator('.agreement__container');
  await expect(agreementContent).toBeVisible({ timeout: 15000 });

  await expect(agreementContent).toHaveScreenshot('1185_priv_policy.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.05,
  });
});
