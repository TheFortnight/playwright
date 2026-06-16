const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');
const { createDraftAPI } = require('../support/flows/basket');

const baseUrl = getBaseUrl();

test('1415. basket map item info unfold fold live', async ({ page }) => {
  await test.step('Seed basket and open pharmacy map', async () => {
    await page.goto(baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });

    await dismissOverlays(page);

    const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
    if (await confirmCityButton.count()) {
      await confirmCityButton.click();
    }

    const draftId = await createDraftAPI(page, { baseUrl, prodId: 38960 });

    await page.goto(`${baseUrl}checkout/basket/${draftId}/select-pharmacy`, {
      waitUntil: 'load',
      timeout: 30000,
    });

    await dismissOverlays(page);

    await expect(page).toHaveURL(/\/checkout\/basket\/.*\/select-pharmacy(?:$|[?#])/, { timeout: 30000 });
    await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', { timeout: 20000 });
    await expect(page.locator('#map')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .pharmacy-filters__switch')).toBeVisible({ timeout: 45000 });
  });

  await test.step('Open first offer on the map', async () => {
    await expect(page.locator('body .loader')).toBeHidden({ timeout: 30000 });
    await expect(page.locator('#selectFirstOrderBtn')).toBeAttached({ timeout: 30000 });

    await page.evaluate(() => {
      document.querySelector('body .loading-container')?.remove();
      document.querySelector('#selectFirstOrderBtn')?.click();
    });

    const mapPopup = page.locator('body .drug-store-map-popup');
    await expect(mapPopup).toBeVisible({ timeout: 20000 });
    await expect(page.locator('body .drug-store-map-popup__count')).toHaveText('1 товар', { timeout: 15000 });
  });

  await test.step('Unfold and fold item info', async () => {
    const popupCountButton = page.locator('body .drug-store-map-popup__count');
    const offerItemCount = page.locator('body .offer-all-goods__item-count');
    const offerPrice = page.locator('body .offer-all-goods__price');

    await popupCountButton.click({ timeout: 15000 });
    await expect(offerItemCount).toBeVisible({ timeout: 5000 });
    await expect(offerItemCount).toContainText('1 шт x', { timeout: 5000 });
    await expect(offerPrice).toHaveText(/\S/, { timeout: 5000 });

    await popupCountButton.click({ timeout: 15000 });
    await expect(offerItemCount).toHaveCount(0, { timeout: 5000 });
  });
});
