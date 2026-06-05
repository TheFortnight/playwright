const { test, expect } = require('@playwright/test');
const { getBaseUrl } = require('../support/utils/env');
const { dismissOverlays } = require('../support/utils/overlays');

const baseUrl = getBaseUrl();

test('1412. basket map pharmacy info live', async ({ page, browserName }) => {
  await test.step('Open catalog and add the first product to basket', async () => {
    await page.goto(`${baseUrl}omsk/catalog/zheludochno-kishechnye-sredstva`, {
      waitUntil: 'domcontentloaded',
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

  await test.step('Open basket and choose pharmacy', async () => {
    if (browserName === 'firefox' || browserName === 'webkit') {
      await page.goto(`${baseUrl}basket`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } else {
      await page.locator('.header-top-right a.mini-basket__label').click({ timeout: 15000 });
      await page.waitForURL(/\/basket(?:$|[?#])/, { timeout: 30000 });
    }

    await expect(page).toHaveURL(/\/basket(?:$|[?#])/, { timeout: 30000 });
    await expect(page.locator('body')).toContainText('Корзина', { timeout: 20000 });
    await expect(page.locator('.basket-items')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.basket-items .basket-item-desktop__body').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('body')).toContainText('В вашем заказе 1 товар', { timeout: 20000 });

    const basketCount = page.locator('.header-top-right .basket__count');
    const cardCounter = page.locator('.basket-btn__container .item-counter__wrapper');
    const quantityIndicator = (await basketCount.count()) ? basketCount : cardCounter;
    await expect(quantityIndicator).toHaveText('1', { timeout: 30000 });

    const choosePharmacyButton = page.locator('.basket-order__order-block .order-block__btn').first();
    await expect(choosePharmacyButton).toBeVisible({ timeout: 15000 });
    await expect(choosePharmacyButton).toBeEnabled({ timeout: 30000 });
    await Promise.all([
      page.waitForURL(/\/checkout\/basket\/.*\/select-pharmacy(?:$|[?#])/, { timeout: 30000 }),
      choosePharmacyButton.click(),
    ]);

    await expect(page).toHaveURL(/\/checkout\/basket\/.*\/select-pharmacy(?:$|[?#])/, { timeout: 30000 });
    await expect(page.locator('.pharmacy-offer__title')).toContainText('В какой аптеке вы заберете заказ?', { timeout: 20000 });
    await expect(page.locator('#map')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.pharmacy-filters__switch')).toBeVisible({ timeout: 45000 });
  });

  await test.step('Open the first offer on map and verify popup details', async () => {
    const firstOfferButton = page.locator('#selectFirstOrderBtn');

    await expect(page.locator('#map')).toBeAttached({ timeout: 30000 });
    await expect(page.locator('#map')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .loader')).toBeHidden({ timeout: 30000 });
    await expect(firstOfferButton).toBeAttached({ timeout: 30000 });
    await expect(page.locator('body .zoom__plus-btn')).toBeVisible({ timeout: 15000 });

    await page.evaluate(() => {
      document.querySelector('body .loading-container')?.remove();
      document.querySelector('#selectFirstOrderBtn')?.click();
    });

    const mapPopup = page.locator('body .drug-store-map-popup');
    await expect.poll(async () => mapPopup.count(), { timeout: 45000 }).toBeGreaterThan(0);
    await expect(mapPopup).toBeVisible({ timeout: 20000 });
    await expect(page.locator('body .drug-store-map-popup__name')).toHaveText(/\S/, { timeout: 15000 });
    await expect(page.locator('body .drug-store-map-popup__adress')).toHaveText(/\S/, { timeout: 15000 });
    await expect(page.locator('body .drug-store-map-popup__schedule')).toHaveText(/\S/, { timeout: 15000 });
    await expect(page.locator('body .drug-store-map-popup-price')).toHaveText(/\S/, { timeout: 15000 });
    await expect(page.locator('body .drug-store-map-popup__count')).toHaveText('1 товар', { timeout: 15000 });
    await expect(page.locator('body .drug-store-map-popup__close-icon')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('body .appToBasket')).toBeVisible({ timeout: 15000 });
  });
});
