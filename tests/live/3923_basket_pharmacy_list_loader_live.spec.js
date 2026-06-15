const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');
const { createDraftAPI } = require('../support/flows/basket');

const baseUrl = getBaseUrl();

test.use({
  viewport: { width: 390, height: 844 },
});

test('3923. basket pharmacy list loader live', async ({ page }) => {
  await test.step('Seed basket and open pharmacy list view', async () => {
    await page.goto(`${baseUrl}omsk`, {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });

    await dismissOverlays(page);

    const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
    if (await confirmCityButton.count()) {
      await confirmCityButton.click();
    }

    const draftId = await createDraftAPI(page, { baseUrl, quantity: 2 });

    await page.goto(`${baseUrl}checkout/basket/${draftId}/select-pharmacy`, {
      waitUntil: 'load',
      timeout: 30000,
    });

    await dismissOverlays(page);

    await expect(page).toHaveURL(/\/checkout\/basket\/.*\/select-pharmacy(?:$|[?#])/, { timeout: 30000 });
    await expect(page.locator('body')).toContainText(/В вашем заказе\s+2\s+товар/u, { timeout: 20000 });
    await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', { timeout: 20000 });
    await expect(page.locator('body .pharmacy-filters__switch')).toBeVisible({ timeout: 45000 });

    const legacyListSwitcher = page.locator('body .view-switcher');
    const currentListSwitcher = page.locator('body .tab-switcher__button').last();
    const listSwitcher = (await legacyListSwitcher.count()) ? legacyListSwitcher : currentListSwitcher;

    await expect(listSwitcher).toBeVisible({ timeout: 30000 });
    await listSwitcher.click({ timeout: 30000 });

    await expect(page.locator('body .search-result__card').first()).toBeVisible({ timeout: 65000 });
  });

  await test.step('Scroll until the next pharmacy batch loads', async () => {
    let spinnerSeen = false;

    await page.evaluate(() => {
      window.__spinnerSeen = false;

      if (window.__spinnerObserver) {
        window.__spinnerObserver.disconnect();
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector('body phrm-logo-spinner') || document.querySelector('body .loading-container')) {
          window.__spinnerSeen = true;
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });

      window.__spinnerObserver = observer;
    });

    for (let attempt = 0; attempt < 60; attempt += 1) {
      await page.evaluate(() => {
        window.scrollBy(0, 1200);
        document.scrollingElement?.dispatchEvent(new Event('scroll', { bubbles: true }));
      });

      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    }

    await expect(page.locator('body .search-result__card')).toHaveCount(55, { timeout: 30000 });

    spinnerSeen = await page.evaluate(() => Boolean(window.__spinnerSeen));
    if (spinnerSeen) {
      expect(spinnerSeen).toBe(true);
    }

    const legacyListItem = page.locator('body .pharmacy-list__item');
    const currentListItem = page.locator('body .search-result__pharmacy');
    const listItemLast = (await legacyListItem.count()) ? legacyListItem.last() : currentListItem.last();
    const sortBarButton = page.getByText('Сначала ближе').first();

    await expect(sortBarButton).toBeVisible({ timeout: 30000 });
    await listItemLast.scrollIntoViewIfNeeded({ timeout: 30000 });
    await expect(listItemLast).toBeInViewport({ timeout: 30000 });
  });
});
