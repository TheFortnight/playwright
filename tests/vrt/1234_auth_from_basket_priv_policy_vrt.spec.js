const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');
const { createDraftAPI } = require('../support/flows/basket');

const baseUrl = getBaseUrl();

test('1234. privacy policy opens from basket booking modal', async ({ page }) => {
  await page.goto(baseUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  });

  await dismissOverlays(page);

  const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
  if (await confirmCityButton.count()) {
    await confirmCityButton.click();
  }

  const draftId = await createDraftAPI(page, { baseUrl });

  await page.goto(`${baseUrl}checkout/basket/${draftId}/select-pharmacy`, {
    waitUntil: 'load',
    timeout: 30000,
  });

  await expect(page.locator('#map')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('body .lottie-loader .loaded')).toBeVisible({ timeout: 45000 });
  await expect(page.locator('body .pharmacy-filters__switch')).toBeVisible({ timeout: 45000 });

  const legacyListTab = page.locator('body .tab-switcher__tab:last-child');
  const currentListTab = page.locator('body .tab-switcher__button').last();
  const listTab = (await legacyListTab.count()) ? legacyListTab : currentListTab;
  await listTab.hover();
  await listTab.click();

  await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });
  await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', { timeout: 20000 });

  const orderButton = page.locator('body .order-btn').first();
  await expect(orderButton).toBeVisible({ timeout: 30000 });
  await orderButton.scrollIntoViewIfNeeded();
  await orderButton.click();

  const modal = page.locator('.dialog .modal-container');
  await expect(modal).toBeVisible({ timeout: 15000 });

  const privacyLink = page.locator('.agreement-links__link').filter({ hasText: 'Политикой в области персональных данных' }).first();
  const popupPromise = page.waitForEvent('popup');
  await privacyLink.click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');

  const agreementContent = popup.locator('body .agreement__container').first();
  await expect(agreementContent).toBeVisible({ timeout: 15000 });

  await expect(agreementContent).toHaveScreenshot('1234_privacy_policy.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.05,
  });
});
