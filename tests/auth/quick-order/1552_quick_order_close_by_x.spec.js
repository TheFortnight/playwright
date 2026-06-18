const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../../support/utils/env');
const { dismissOverlays } = require('../../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1552. quick order close by x', async ({ page, browserName }) => {
  await test.step('Open subcatalog', async () => {
    await page.goto(`${baseUrl}omsk/catalog/zheludochno-kishechnye-sredstva`, {
      waitUntil: 'load',
      timeout: 60000,
    });

    await dismissOverlays(page);

    const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
    if (await confirmCityButton.count()) {
      await confirmCityButton.click();
    }

    await expect(page.locator('body .card').first()).toBeVisible({ timeout: 35000 });
  });

  await test.step('Open first offers link and switch to list view', async () => {
    const firstOffersLink = page.locator('[id="0"] .card__pharmacy-wrapper a').first();
    await expect(firstOffersLink).toBeVisible({ timeout: 30000 });
    await firstOffersLink.hover();
    await firstOffersLink.click({ force: browserName === 'firefox' });

    await expect(page.locator('body .good-card__title')).toBeVisible({ timeout: 30000 });

    const legacyListTab = page.locator('body .tab-switcher__tab:last-child');
    const currentListTab = page.locator('body .tab-switcher__button').last();
    const listTab = (await legacyListTab.count()) ? legacyListTab : currentListTab;
    await expect(listTab).toBeVisible({ timeout: 30000 });
    await listTab.hover();
    await listTab.click();

    await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });
  });

  await test.step('Open quick order modal and close it with x', async () => {
    const bookButton = page.locator('body .order-btn').first();
    await expect(bookButton).toBeVisible({ timeout: 30000 });
    await bookButton.scrollIntoViewIfNeeded();
    await bookButton.click();

    const modal = page.locator('.dialog .modal-container');
    await expect(modal).toBeVisible({ timeout: 15000 });

    await modal.locator('.auth-header .close-btn').click();

    await expect(modal.locator('.auth-dialog')).toHaveCount(0, { timeout: 10000 });
    await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 30000 });
  });
});
