const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');
const { createDraftAPI } = require('../support/flows/basket');

const baseUrl = getBaseUrl();

test('1235. user agreement opens from basket booking modal', async ({ page }) => {
  await page.goto(baseUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  });

  await dismissOverlays(page);

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
  await listTab.scrollIntoViewIfNeeded();
  await listTab.evaluate((el) => el.click());

  await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });
  await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', { timeout: 20000 });

  const orderButton = page.locator('body .order-btn').first();
  await expect(orderButton).toBeVisible({ timeout: 30000 });
  await orderButton.click({ force: true });

  const modal = page.locator('.dialog .modal-container');
  await expect(modal).toBeVisible({ timeout: 15000 });

  const agreementLink = page.locator('.agreement-links__link').filter({ hasText: 'Пользовательским соглашением' }).first();
  const popupPromise = page.waitForEvent('popup');
  await agreementLink.click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');

  const agreement = popup.locator('body .agreement').filter({ hasText: 'Пользовательское соглашение' }).first();
  const agreementContent = agreement.locator('.agreement__container');
  await expect(agreementContent).toBeVisible({ timeout: 15000 });

  await expect(agreementContent).toHaveScreenshot('1235_agreement.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.05,
  });
});
