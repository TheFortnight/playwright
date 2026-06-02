const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1408. basket filter 24h live', async ({ page, browserName }) => {
  await test.step('Open subcatalog and add the first product to basket', async () => {
    await page.goto(`${baseUrl}omsk/catalog/zheludochno-kishechnye-sredstva`, {
      waitUntil: 'load',
      timeout: 45000,
    });

    await dismissOverlays(page);

    const confirmCityButton = page.getByRole('button', { name: 'Да, я здесь' }).first();
    if (await confirmCityButton.count()) {
      await confirmCityButton.click();
    }

    await expect(page.locator('body .card').first()).toBeVisible({ timeout: 35000 });

    const firstBasketButton = page.locator('.card .basket-btn').first();
    await expect(firstBasketButton).toBeVisible({ timeout: 20000 });

    const basketButtonBox = await firstBasketButton.boundingBox();
    expect(basketButtonBox).toBeTruthy();

    const addToBasketResponse = page.waitForResponse((response) => {
      return response.request().method() === 'POST' && /\/api\/v2\/carts\/[^/]+\/goods(?:\?.*)?$/.test(response.url());
    });

    if (browserName === 'webkit') {
      await firstBasketButton.click({ timeout: 20000 });
    } else {
      await page.mouse.click(
        basketButtonBox.x + basketButtonBox.width / 2,
        basketButtonBox.y + basketButtonBox.height / 2,
      );
    }

    await addToBasketResponse;

    await page.waitForResponse((response) => {
      return response.request().method() === 'GET' && /\/api\/v2\/carts\/actual(?:\?.*)?$/.test(response.url());
    });

    await expect.poll(async () => page.evaluate(() => {
      return document.querySelector('.header-top-right .basket__count')?.textContent?.trim()
        || document.querySelector('.basket-btn__container .item-counter__wrapper')?.textContent?.trim()
        || '';
    }), { timeout: 25000 }).toBe('1');
  });

  await test.step('Open basket and switch to list view', async () => {
    if (browserName === 'firefox') {
      const basketActualResponse = page.waitForResponse((response) => {
        return response.request().method() === 'GET' && /\/api\/v2\/carts\/actual(?:\?.*)?$/.test(response.url());
      });

      await page.goto(`${baseUrl}basket`, { waitUntil: 'load', timeout: 30000 });
      await basketActualResponse;
    } else {
      const basketActualResponse = page.waitForResponse((response) => {
        return response.request().method() === 'GET' && /\/api\/v2\/carts\/actual(?:\?.*)?$/.test(response.url());
      });

      await page.locator('.header-top-right a.mini-basket__label').click({ timeout: 15000 });
      await page.waitForURL(/\/basket(?:$|[?#])/, { timeout: 30000 });
      await basketActualResponse;
    }

    await expect(page).toHaveURL(/\/basket(?:$|[?#])/, { timeout: 30000 });
    await expect(page.locator('body')).toContainText('Корзина', { timeout: 20000 });
    await expect(page.locator('.basket-items')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.basket-items .basket-item-desktop__body')).toHaveCount(1, { timeout: 30000 });
    await expect(page.locator('.basket-items .basket-item-desktop__body').first()).toBeVisible({ timeout: 20000 });

    const basketCount = page.locator('.header-top-right .basket__count');
    const cardCounter = page.locator('.basket-btn__container .item-counter__wrapper');
    const quantityIndicator = (await basketCount.count()) ? basketCount : cardCounter;
    await expect(quantityIndicator).toHaveText('1', { timeout: 30000 });

    const choosePharmacyButton = page.locator('.basket-order__order-block .order-block__btn').first();
    await expect(choosePharmacyButton).toBeVisible({ timeout: 15000 });
    await expect(choosePharmacyButton).toBeEnabled({ timeout: 30000 });
    await choosePharmacyButton.click();

    await expect(page).toHaveURL(/\/checkout\/basket\/.*\/select-pharmacy(?:$|[?#])/, { timeout: 30000 });
    await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', { timeout: 20000 });
    await expect(page.locator('body .pharmacy-filters__switch')).toBeVisible({ timeout: 45000 });

    const legacyListTab = page.locator('body .tab-switcher__tab:last-child');
    const currentListTab = page.locator('body .tab-switcher__button').last();
    const listTab = (await legacyListTab.count()) ? legacyListTab : currentListTab;

    await expect(listTab).toBeVisible({ timeout: 30000 });
    await listTab.hover();
    await listTab.click();

    await expect(page.locator('body .search-result__pharmacy').first()).toBeVisible({ timeout: 65000 });
  });

  await test.step('Apply 24h filter and verify the pharmacy list', async () => {
    const filterButton = page.getByRole('button', { name: 'Круглосуточные' }).first();
    await expect(filterButton).toBeVisible({ timeout: 30000 });
    await filterButton.click({ timeout: 15000 });

    await expect(filterButton).toHaveClass(/active/, { timeout: 15000 });

    const notFoundTitle = page.locator('body .pharmacy-offer__result .stab__title');
    if (await notFoundTitle.isVisible().catch(() => false)) {
      await expect(notFoundTitle).toContainText('Аптеки не найдены', { timeout: 15000 });
      return;
    }

    const pharmacies = page.locator('body .search-result__pharmacy');
    await expect(pharmacies.first()).toBeVisible({ timeout: 30000 });

    await expect.poll(async () => {
      const count = await pharmacies.count();

      if (!count) {
        return false;
      }

      const schedules = await pharmacies.locator('.opening-hours').allTextContents();
      return schedules.length > 0 && schedules.every((text) => String(text).includes('Круглосуточно'));
    }, { timeout: 20000 }).toBe(true);
  });
});
